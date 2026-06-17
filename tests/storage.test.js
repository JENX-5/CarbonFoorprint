import { describe, it, expect, beforeEach, vi } from "vitest";
import { Storage, defaultState, loadState } from "../src/lib/storage.js";

describe("Storage Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Simple mock of localStorage
    let store = {};
    vi.stubGlobal("window", {
      localStorage: {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, val) => {
          store[key] = String(val);
        }),
        removeItem: vi.fn((key) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      },
    });
  });

  it("should return default state when storage is empty", () => {
    const state = loadState();
    expect(state.calculatorCompleted).toBe(false);
    expect(state.ecoScore).toBe(0);
    expect(state.history).toHaveLength(0);
  });

  it("should save and load state successfully", () => {
    const customState = defaultState();
    customState.ecoScore = 150;
    customState.calculatorCompleted = true;

    const saved = Storage.save(customState);
    expect(saved).toBe(true);

    const loaded = loadState();
    expect(loaded.ecoScore).toBe(150);
    expect(loaded.calculatorCompleted).toBe(true);
  });

  it("should load legacy storage keys if present", () => {
    const legacyState = {
      ecoScore: 300,
      theme: "dark",
    };

    window.localStorage.setItem(
      "contourCarbonAppState_v1",
      JSON.stringify(legacyState),
    );

    const state = loadState();
    expect(state.ecoScore).toBe(300);
    expect(state.theme).toBe("dark");
  });

  it("should gracefully handle storage errors", () => {
    // Mock getItem to throw an error (e.g., security restriction)
    window.localStorage.getItem = vi.fn(() => {
      throw new Error("Storage disabled");
    });

    const state = loadState();
    // Should fallback to defaultState instead of crashing
    expect(state.ecoScore).toBe(0);
  });
});
