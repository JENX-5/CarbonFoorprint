import { describe, it, expect } from "vitest";
import { appReducer } from "../src/state/appReducer.js";
import { defaultState } from "../src/lib/storage.js";

describe("App Reducer", () => {
  it("should handle CALCULATE action", () => {
    const state = defaultState();
    const action = {
      type: "CALCULATE",
      payload: {
        inputs: {
          commuteKmPerDay: 10,
          transitKmPerWeek: 10,
          flightsShortHaulPerYear: 0,
          flightsLongHaulPerYear: 0,
          electricityKwhPerMonth: 200,
          renewablePercent: 0,
          wasteKgPerWeek: 5,
          recycledPercent: 20,
          waterLitersPerDay: 100,
          vehicleType: "petrolCar",
          dietType: "mediumMeat",
          waterHeatedMostly: false,
        },
        results: {
          annual: 4500,
          monthly: 375,
          daily: 12.3,
          byCategoryAnnual: {
            transportation: 1500,
            electricity: 1800,
            diet: 1000,
            waste: 180,
            water: 20,
          },
        },
      },
    };

    const nextState = appReducer(state, action);
    expect(nextState.calculatorCompleted).toBe(true);
    expect(nextState.inputs.commuteKmPerDay).toBe(10);
    expect(nextState.results.annual).toBe(4500);
    expect(nextState.ecoScore).toBeGreaterThan(0); // Earned points for first calculation
    expect(nextState.history).toHaveLength(1);
    expect(nextState._meta.event).toBe("first-calculation");
  });

  it("should handle RUN_SIMULATOR action", () => {
    const state = defaultState();
    const action = { type: "RUN_SIMULATOR" };

    const nextState = appReducer(state, action);
    expect(nextState.simulatorRun).toBe(true);
    expect(nextState.ecoScore).toBeGreaterThan(0);
    expect(nextState._meta.event).toBe("first-simulation");
  });

  it("should handle TOGGLE_CHECKLIST_ITEM action", () => {
    const state = defaultState();
    const action = {
      type: "TOGGLE_CHECKLIST_ITEM",
      payload: { itemId: "recycleShare" },
    };

    const nextState = appReducer(state, action);
    expect(nextState.checklist.completed.recycleShare).toBe(true);
    expect(nextState.ecoScore).toBeGreaterThan(0);
  });

  it("should handle SET_THEME action", () => {
    const state = defaultState();
    const action = {
      type: "SET_THEME",
      payload: { theme: "dark" },
    };

    const nextState = appReducer(state, action);
    expect(nextState.theme).toBe("dark");
  });

  it("should handle RESET_ALL action", () => {
    let state = defaultState();
    state.ecoScore = 500;
    state.calculatorCompleted = true;

    const action = { type: "RESET_ALL" };
    const nextState = appReducer(state, action);
    expect(nextState.ecoScore).toBe(0);
    expect(nextState.calculatorCompleted).toBe(false);
    expect(nextState._meta.event).toBe("reset");
  });
});
