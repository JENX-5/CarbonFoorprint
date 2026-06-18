/**
 * appReducer.js
 * ---------------------------------------------------------------------------
 * Single pure reducer for all cross-page app state: the calculator result,
 * simulator usage, eco score, achievements, daily checklist, streak, weekly
 * challenge, footprint history, and theme. Every branch returns a new state
 * object — no mutation — and ends by running newly-earned achievements
 * through `applyAchievements`, so unlocking logic lives in exactly one
 * place no matter which action triggered it.
 * ---------------------------------------------------------------------------
 */
import {
  defaultState,
  pushHistoryEntry,
  sanitizeState,
} from "@/lib/storage.js";
import {
  applyAchievements,
  toggleChecklistItem,
  completeWeeklyChallenge,
} from "@/lib/gamification.js";
import { CarbonData as Data } from "@/lib/data.js";

/**
 * Wraps state update and applies any achievements that are newly earned.
 * @param {any} state - The temporary updated state.
 * @returns {{ next: any, newlyUnlocked: any[] }} The state with achievements applied and newly unlocked list.
 */
function withAchievements(state) {
  const { unlockedAchievements, ecoScore, newlyUnlocked } =
    applyAchievements(state);
  return { next: { ...state, unlockedAchievements, ecoScore }, newlyUnlocked };
}

/**
 * Global application state reducer.
 * @param {any} state - Current global application state.
 * @param {{ type: string, payload?: any }} action - Dispatched action.
 * @returns {any} The next state object.
 */
export function appReducer(state, action) {
  switch (action.type) {
    case "CALCULATE": {
      const { inputs, results } = action.payload;
      const isFirstEver = !state.calculatorCompleted;
      let next = {
        ...state,
        inputs,
        results,
        calculatorCompleted: true,
        firstBaselineAnnual:
          state.firstBaselineAnnual === null
            ? results.annual
            : state.firstBaselineAnnual,
        ecoScore: isFirstEver
          ? state.ecoScore + Data.ACTION_POINTS.calculatorCompleted
          : state.ecoScore,
        history: pushHistoryEntry(state.history, results),
      };
      const { next: withA, newlyUnlocked } = withAchievements(next);
      return {
        ...withA,
        _meta: {
          newlyUnlocked,
          event: isFirstEver ? "first-calculation" : "recalculated",
        },
      };
    }

    case "RUN_SIMULATOR": {
      const isFirstEver = !state.simulatorRun;
      let next = {
        ...state,
        simulatorRun: true,
        ecoScore: isFirstEver
          ? state.ecoScore + Data.ACTION_POINTS.simulatorRun
          : state.ecoScore,
      };
      const { next: withA, newlyUnlocked } = withAchievements(next);
      return {
        ...withA,
        _meta: {
          newlyUnlocked,
          event: isFirstEver ? "first-simulation" : null,
        },
      };
    }

    case "APPLY_SCENARIO": {
      const { inputs, results } = action.payload;
      let next = {
        ...state,
        inputs,
        results,
        history: pushHistoryEntry(state.history, results),
      };
      const { next: withA, newlyUnlocked } = withAchievements(next);
      return { ...withA, _meta: { newlyUnlocked, event: "scenario-applied" } };
    }

    case "TOGGLE_CHECKLIST_ITEM": {
      const toggled = toggleChecklistItem(state, action.payload.itemId);
      const { next: withA, newlyUnlocked } = withAchievements(toggled);
      return { ...withA, _meta: { newlyUnlocked, event: "checklist-toggled" } };
    }

    case "COMPLETE_WEEKLY_CHALLENGE": {
      const updated = completeWeeklyChallenge(state);
      if (updated === state)
        return { ...state, _meta: { newlyUnlocked: [], event: null } };
      const { next: withA, newlyUnlocked } = withAchievements(updated);
      return {
        ...withA,
        _meta: { newlyUnlocked, event: "challenge-completed" },
      };
    }

    case "SET_THEME":
      return {
        ...state,
        theme: action.payload.theme,
        _meta: { newlyUnlocked: [], event: null },
      };

    case "RESET_ALL":
      return {
        ...defaultState(),
        _meta: { newlyUnlocked: [], event: "reset" },
      };

    case "IMPORT_STATE":
      return {
        ...sanitizeState(action.payload.state),
        _meta: { newlyUnlocked: [], event: "imported" },
      };

    default:
      return state;
  }
}
