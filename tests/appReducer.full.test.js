import { describe, it, expect } from "vitest";
import { appReducer } from "../src/state/appReducer.js";
import { defaultState } from "../src/lib/storage.js";
import { getCurrentChallenge } from "../src/lib/gamification.js";

describe("appReducer full coverage", () => {
  const base = defaultState();

  it("CALCULATE action updates state and meta", () => {
    const action = {
      type: "CALCULATE",
      payload: { inputs: {}, results: { annual: 100 } },
    };
    const result = appReducer(base, action);
    expect(result.calculatorCompleted).toBe(true);
    expect(result.results).toEqual({ annual: 100 });
    expect(result._meta?.event).toBe("first-calculation");
    expect(result._meta?.newlyUnlocked).toBeInstanceOf(Array);
  });

  it("RUN_SIMULATOR action", () => {
    const action = { type: "RUN_SIMULATOR" };
    const result = appReducer(base, action);
    expect(result.simulatorRun).toBe(true);
    expect(result._meta?.event).toBe("first-simulation");
  });

  it("APPLY_SCENARIO action updates history", () => {
    const action = {
      type: "APPLY_SCENARIO",
      payload: { inputs: {}, results: { annual: 200 } },
    };
    const result = appReducer(base, action);
    expect(result.history.length).toBe(1);
    expect(result._meta?.event).toBe("scenario-applied");
  });

  it("TOGGLE_CHECKLIST_ITEM action", () => {
    const action = {
      type: "TOGGLE_CHECKLIST_ITEM",
      payload: { itemId: "test" },
    };
    const result = appReducer(base, action);
    expect(result._meta?.event).toBe("checklist-toggled");
  });

  it("COMPLETE_WEEKLY_CHALLENGE when already completed returns null event", () => {
    const weekKey = getCurrentChallenge().weekKey;
    const stateWithWeek = {
      ...base,
      weeklyChallenge: { completedWeeks: [weekKey] },
    };
    const action = { type: "COMPLETE_WEEKLY_CHALLENGE" };
    const result = appReducer(stateWithWeek, action);
    expect(result._meta?.event).toBeNull();
  });

  it("COMPLETE_WEEKLY_CHALLENGE when not completed adds entry and event", () => {
    const weekKey = getCurrentChallenge().weekKey;
    const stateWithout = { ...base, weeklyChallenge: { completedWeeks: [] } };
    const result = appReducer(stateWithout, {
      type: "COMPLETE_WEEKLY_CHALLENGE",
    });
    expect(result.weeklyChallenge.completedWeeks).toContain(weekKey);
    expect(result._meta?.event).toBe("challenge-completed");
  });

  it("SET_THEME action sets theme and meta", () => {
    const action = { type: "SET_THEME", payload: { theme: "dark" } };
    const result = appReducer(base, action);
    expect(result.theme).toBe("dark");
    expect(result._meta?.event).toBeNull();
  });

  it("CALCULATE second run updates event to recalculated", () => {
    const state = {
      ...base,
      calculatorCompleted: true,
      firstBaselineAnnual: 150,
    };
    const action = {
      type: "CALCULATE",
      payload: { inputs: {}, results: { annual: 200 } },
    };
    const result = appReducer(state, action);
    expect(result._meta?.event).toBe("recalculated");
    expect(result.firstBaselineAnnual).toBe(150);
  });

  it("RUN_SIMULATOR second run does not award points or log first-simulation event", () => {
    const state = {
      ...base,
      simulatorRun: true,
      ecoScore: 10,
      unlockedAchievements: ["scenarioExplorer"],
    };
    const action = { type: "RUN_SIMULATOR" };
    const result = appReducer(state, action);
    expect(result.simulatorRun).toBe(true);
    expect(result.ecoScore).toBe(10);
    expect(result._meta?.event).toBeNull();
  });

  it("IMPORT_STATE action imports given state and sets event to imported", () => {
    const action = {
      type: "IMPORT_STATE",
      payload: { state: { ecoScore: 99 } },
    };
    const result = appReducer(base, action);
    expect(result.ecoScore).toBe(99);
    expect(result._meta?.event).toBe("imported");
  });

  it("default case returns unchanged state", () => {
    const action = { type: "UNKNOWN_ACTION_TYPE" };
    const result = appReducer(base, action);
    expect(result).toBe(base);
  });
});
