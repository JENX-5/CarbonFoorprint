/**
 * storage.js
 * ---------------------------------------------------------------------------
 * localStorage persistence + the shape of persisted app state. Ported from
 * the original utils.js, with one additive field: `history`, a capped log
 * of past calculations that powers the dashboard's footprint-over-time
 * chart. Existing saved data without a `history` field loads fine — it's
 * defaulted to an empty array, same defensive pattern as every other field
 * here.
 * ---------------------------------------------------------------------------
 */

export const STORAGE_KEY = 'contourCarbonAppState_v2';
const LEGACY_STORAGE_KEY = 'contourCarbonAppState_v1';
export const MAX_HISTORY_ENTRIES = 24;

export const Storage = {
  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  },
  save(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }
};

export function defaultState() {
  return {
    inputs: null,
    results: null,
    calculatorCompleted: false,
    simulatorRun: false,
    firstBaselineAnnual: null,
    ecoScore: 0,
    unlockedAchievements: [],
    checklist: { date: null, completed: {}, awarded: {} },
    streak: { current: 0, longest: 0, lastActiveDate: null },
    weeklyChallenge: { completedWeeks: [] },
    history: [],
    theme: 'system'
  };
}

export function loadState() {
  const base = defaultState();
  const parsed = Storage.load();
  if (!parsed) return base;
  try {
    return {
      inputs: parsed.inputs || base.inputs,
      results: parsed.results || base.results,
      calculatorCompleted: !!parsed.calculatorCompleted,
      simulatorRun: !!parsed.simulatorRun,
      firstBaselineAnnual: typeof parsed.firstBaselineAnnual === 'number' ? parsed.firstBaselineAnnual : base.firstBaselineAnnual,
      ecoScore: typeof parsed.ecoScore === 'number' && isFinite(parsed.ecoScore) ? parsed.ecoScore : 0,
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements) ? parsed.unlockedAchievements : [],
      checklist: Object.assign({}, base.checklist, parsed.checklist || {}),
      streak: Object.assign({}, base.streak, parsed.streak || {}),
      weeklyChallenge: Object.assign({}, base.weeklyChallenge, parsed.weeklyChallenge || {}),
      history: Array.isArray(parsed.history) ? parsed.history.slice(-MAX_HISTORY_ENTRIES) : base.history,
      theme: parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : base.theme
    };
  } catch (e) {
    return base;
  }
}

/** Appends a calculation snapshot to history, keeping only the most recent entries. */
export function pushHistoryEntry(history, results) {
  const entry = {
    date: new Date().toISOString(),
    annual: results.annual,
    byCategoryAnnual: results.byCategoryAnnual
  };
  return [...history, entry].slice(-MAX_HISTORY_ENTRIES);
}
