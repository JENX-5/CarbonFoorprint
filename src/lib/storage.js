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

import { Logger } from "@/lib/logger.js";

export const STORAGE_KEY = "contourCarbonAppState_v2";
const LEGACY_STORAGE_KEY = "contourCarbonAppState_v1";
export const MAX_HISTORY_ENTRIES = 24;

/**
 * Checks if localStorage is available and functional in the current environment.
 * Handles environments where window is undefined or localStorage is restricted.
 *
 * @returns {boolean} True if localStorage is functional, false otherwise.
 */
function isStorageAvailable() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    const testKey = "__contour_storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const Storage = {
  /**
   * Loads the application state from local storage.
   *
   * @returns {Record<string, any>|null} The parsed application state or null.
   */
  load() {
    if (!isStorageAvailable()) {
      Logger.warn("localStorage is not available or access is restricted.");
      return null;
    }
    try {
      const raw =
        window.localStorage.getItem(STORAGE_KEY) ||
        window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return null;
      return parsed;
    } catch (error) {
      Logger.error("Failed to load application state from storage", error);
      return null;
    }
  },
  /**
   * Saves the application state to local storage.
   *
   * @param {Record<string, any>} state - The application state to save.
   * @returns {boolean} True if save was successful, false otherwise.
   */
  save(state) {
    if (!isStorageAvailable()) {
      Logger.warn("localStorage is not available or access is restricted.");
      return false;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      Logger.error("Failed to save application state to storage", error);
      return false;
    }
  },
  /**
   * Clears all application state keys from local storage.
   *
   * @returns {boolean} True if clearing was successful, false otherwise.
   */
  clear() {
    if (!isStorageAvailable()) {
      Logger.warn("localStorage is not available or access is restricted.");
      return false;
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return true;
    } catch (error) {
      Logger.error("Failed to clear application state from storage", error);
      return false;
    }
  },
};

export function defaultState() {
  return {
    inputs: {},
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
    theme: "system",
  };
}

export function sanitizeState(parsed) {
  const base = defaultState();
  if (!parsed || typeof parsed !== "object") return base;
  try {
    const inputs =
      typeof parsed.inputs === "object" && parsed.inputs !== null
        ? { ...parsed.inputs }
        : base.inputs;

    let results = base.results;
    if (parsed.results && typeof parsed.results === "object") {
      results = {
        annual:
          typeof parsed.results.annual === "number" &&
          isFinite(parsed.results.annual)
            ? parsed.results.annual
            : 0,
        monthly:
          typeof parsed.results.monthly === "number" &&
          isFinite(parsed.results.monthly)
            ? parsed.results.monthly
            : 0,
        daily:
          typeof parsed.results.daily === "number" &&
          isFinite(parsed.results.daily)
            ? parsed.results.daily
            : 0,
        byCategoryAnnual:
          parsed.results.byCategoryAnnual &&
          typeof parsed.results.byCategoryAnnual === "object"
            ? { ...parsed.results.byCategoryAnnual }
            : {},
      };
    }

    const checklist = {
      date:
        typeof parsed.checklist?.date === "string"
          ? parsed.checklist.date
          : null,
      completed:
        parsed.checklist?.completed &&
        typeof parsed.checklist.completed === "object"
          ? { ...parsed.checklist.completed }
          : {},
      awarded:
        parsed.checklist?.awarded &&
        typeof parsed.checklist.awarded === "object"
          ? { ...parsed.checklist.awarded }
          : {},
    };

    const streak = {
      current:
        typeof parsed.streak?.current === "number" &&
        isFinite(parsed.streak.current)
          ? parsed.streak.current
          : 0,
      longest:
        typeof parsed.streak?.longest === "number" &&
        isFinite(parsed.streak.longest)
          ? parsed.streak.longest
          : 0,
      lastActiveDate:
        typeof parsed.streak?.lastActiveDate === "string"
          ? parsed.streak.lastActiveDate
          : null,
    };

    const weeklyChallenge = {
      completedWeeks: Array.isArray(parsed.weeklyChallenge?.completedWeeks)
        ? parsed.weeklyChallenge.completedWeeks.filter(
            (w) => typeof w === "string",
          )
        : [],
    };

    const history = Array.isArray(parsed.history)
      ? parsed.history
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => ({
            date:
              typeof entry.date === "string"
                ? entry.date
                : new Date().toISOString(),
            annual:
              typeof entry.annual === "number" && isFinite(entry.annual)
                ? entry.annual
                : 0,
            byCategoryAnnual:
              entry.byCategoryAnnual &&
              typeof entry.byCategoryAnnual === "object"
                ? { ...entry.byCategoryAnnual }
                : {},
          }))
          .slice(-MAX_HISTORY_ENTRIES)
      : base.history;

    return {
      inputs,
      results,
      calculatorCompleted: !!parsed.calculatorCompleted,
      simulatorRun: !!parsed.simulatorRun,
      firstBaselineAnnual:
        typeof parsed.firstBaselineAnnual === "number" &&
        isFinite(parsed.firstBaselineAnnual)
          ? parsed.firstBaselineAnnual
          : base.firstBaselineAnnual,
      ecoScore:
        typeof parsed.ecoScore === "number" && isFinite(parsed.ecoScore)
          ? parsed.ecoScore
          : 0,
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements.filter((id) => typeof id === "string")
        : [],
      checklist,
      streak,
      weeklyChallenge,
      history,
      theme:
        parsed.theme === "light" || parsed.theme === "dark"
          ? parsed.theme
          : base.theme,
    };
  } catch (error) {
    Logger.error("Error migrating or parsing loaded state", error);
    return base;
  }
}

export function loadState() {
  const parsed = Storage.load();
  return sanitizeState(parsed);
}

/** Appends a calculation snapshot to history, keeping only the most recent entries. */
export function pushHistoryEntry(history, results) {
  const entry = {
    date: new Date().toISOString(),
    annual: results.annual,
    byCategoryAnnual: results.byCategoryAnnual,
  };
  return [...history, entry].slice(-MAX_HISTORY_ENTRIES);
}
