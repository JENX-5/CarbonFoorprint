import {
  Storage,
  defaultState,
  loadState,
  pushHistoryEntry,
  MAX_HISTORY_ENTRIES,
} from "@/lib/storage.js";
import { describe, beforeEach, it, expect, vi } from "vitest";

describe("Storage module full coverage", () => {
  const originalStore = {};

  beforeEach(() => {
    // reset a fresh mock localStorage each test
    const store = { ...originalStore };
    vi.stubGlobal("window", {
      localStorage: {
        getItem: vi.fn((key) => store[key] ?? null),
        setItem: vi.fn((key, val) => {
          store[key] = String(val);
        }),
        removeItem: vi.fn((key) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          for (const k in store) delete store[k];
        }),
      },
    });
  });

  it("load returns null on error", () => {
    window.localStorage.getItem.mockImplementation(() => {
      throw new Error("broken");
    });
    expect(Storage.load()).toBeNull();
  });

  it("save returns false on error", () => {
    window.localStorage.setItem.mockImplementation(() => {
      throw new Error("no space");
    });
    expect(Storage.save({})).toBe(false);
  });

  it("clear returns false on error", () => {
    // Make removeItem throw
    window.localStorage.removeItem.mockImplementation(() => {
      throw new Error("remove failed");
    });
    expect(Storage.clear()).toBe(false);
  });

  it("loadState catches error in try block", () => {
    const originalLoad = Storage.load;
    const faulty = {};
    Object.defineProperty(faulty, "unlockedAchievements", {
      get() {
        throw new Error("bad");
      },
    });
    Storage.load = () => faulty;
    try {
      const state = loadState();
      expect(state).toMatchObject(defaultState());
    } finally {
      Storage.load = originalLoad;
    }
  });

  it("loadState uses legacy key when primary missing", () => {
    const legacyData = JSON.stringify({ ecoScore: 5 });
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "contourCarbonAppState_v1") return legacyData;
      return null;
    });
    const state = loadState();
    expect(state.ecoScore).toBe(5);
  });

  it("load returns null when parsed data is not an object", () => {
    window.localStorage.getItem.mockImplementation(() => "123"); // parsed will be number 123
    expect(Storage.load()).toBeNull();
  });

  it("loadState uses base value when firstBaselineAnnual is not a number", () => {
    const originalLoad = Storage.load;
    Storage.load = () => ({
      firstBaselineAnnual: "not-a-number",
    });
    try {
      const state = loadState();
      expect(state.firstBaselineAnnual).toBe(
        defaultState().firstBaselineAnnual,
      );
    } finally {
      Storage.load = originalLoad;
    }
  });

  it("loadState uses firstBaselineAnnual when it is a number", () => {
    const originalLoad = Storage.load;
    Storage.load = () => ({
      firstBaselineAnnual: 5000,
    });
    try {
      const state = loadState();
      expect(state.firstBaselineAnnual).toBe(5000);
    } finally {
      Storage.load = originalLoad;
    }
  });

  it("caps history entries at MAX_HISTORY_ENTRIES", () => {
    let history = [];
    const results = { annual: 100, byCategoryAnnual: {} };
    for (let i = 0; i < MAX_HISTORY_ENTRIES + 5; i++) {
      history = pushHistoryEntry(history, results);
    }
    expect(history.length).toBe(MAX_HISTORY_ENTRIES);
  });
});
