import { Storage, defaultState, loadState, pushHistoryEntry, MAX_HISTORY_ENTRIES } from '../src/lib/storage.js';
import { vi } from 'vitest';

describe('Storage module full coverage', () => {
  const originalStore = {};

  beforeEach(() => {
    // reset a fresh mock localStorage each test
    const store = { ...originalStore };
    vi.stubGlobal('window', {
      localStorage: {
        getItem: vi.fn((key) => store[key] ?? null),
        setItem: vi.fn((key, val) => { store[key] = String(val); }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { for (const k in store) delete store[k]; })
      }
    });
  });

  it('load returns null on error', () => {
    window.localStorage.getItem.mockImplementation(() => { throw new Error('broken'); });
    expect(Storage.load()).toBeNull();
  });

  it('save returns false on error', () => {
    window.localStorage.setItem.mockImplementation(() => { throw new Error('no space'); });
    expect(Storage.save({})).toBe(false);
  });

  it('clear returns false on error', () => {
    // Make removeItem throw
    window.localStorage.removeItem.mockImplementation(() => { throw new Error('remove failed'); });
    expect(Storage.clear()).toBe(false);
  });

  it('loadState catches error in try block', () => {
    // Mock load to return object with getter that throws
    const faulty = {};
    Object.defineProperty(faulty, 'unlockedAchievements', {
      get() { throw new Error('bad'); }
    });
    window.localStorage.getItem.mockImplementation(() => JSON.stringify(faulty));
    const state = loadState();
    // Should fallback to defaultState
    expect(state).toMatchObject(defaultState());
  });

  it('loadState uses legacy key when primary missing', () => {
    const legacyData = JSON.stringify({ ecoScore: 5 });
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'contourCarbonAppState_v1') return legacyData;
      return null;
    });
    const state = loadState();
    expect(state.ecoScore).toBe(5);
  });

  let history = [];
    const results = { annual: 100, byCategoryAnnual: {} };
    for (let i = 0; i < MAX_HISTORY_ENTRIES + 5; i++) {
      history = pushHistoryEntry(history, results);
    }
    expect(history.length).toBe(MAX_HISTORY_ENTRIES);
});
