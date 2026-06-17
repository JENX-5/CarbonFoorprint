import { describe, it, expect } from "vitest";
import {
  getLevel,
  getNextLevel,
  getLevelProgress,
  getCurrentChallenge,
  evaluateNewAchievements,
  applyAchievements,
  toggleChecklistItem,
  completeWeeklyChallenge,
  meetsCondition,
  buildMetricsSnapshot,
} from "../src/lib/gamification.js";
import { defaultState } from "../src/lib/storage.js";
import { getYesterdayKey } from "../src/lib/format.js";

describe("Gamification Engine", () => {
  describe("getLevel and progress math", () => {
    it("should map ecoScore to level boundaries", () => {
      const firstLevel = getLevel(0);
      expect(firstLevel.name).toBe("Eco Novice");

      const nextLevel = getNextLevel(0);
      expect(nextLevel).not.toBeNull();
      // Using non-null assertion

      expect(nextLevel?.name).toBe("Eco Explorer");

      const progress = getLevelProgress(50);
      expect(progress.percent).toBe(50); // Since first level min is 0 and next level is 100
      expect(progress.pointsToNext).toBe(50);
    });

    it("should handle top level max", () => {
      const topLevel = getLevel(1500);
      expect(topLevel.name).toBe("Eco Legend");
      const progress = getLevelProgress(1600);
      expect(progress.percent).toBe(100);
      expect(progress.next).toBeNull();
    });
  });

  describe("getCurrentChallenge", () => {
    it("should retrieve a valid weekly challenge", () => {
      const challengeInfo = getCurrentChallenge();
      expect(challengeInfo).toHaveProperty("weekKey");
      expect(challengeInfo.challenge).toHaveProperty("id");
      expect(challengeInfo.challenge).toHaveProperty("title");
    });
  });

  describe("Achievements Evaluation", () => {
    it("should evaluate achievements dynamically", () => {
      const state = defaultState();
      state.calculatorCompleted = true;
      state.inputs = { renewablePercent: 60 };

      const newBadges = evaluateNewAchievements(state);
      // firstCalculation is completed, renewableReady (>=50%) is completed
      const unlockedIds = newBadges.map((b) => b.id);
      expect(unlockedIds).toContain("firstCalculation");
      expect(unlockedIds).toContain("renewableReady");

      const applied = applyAchievements(state);
      expect(applied.unlockedAchievements).toContain("firstCalculation");
      expect(applied.unlockedAchievements).toContain("renewableReady");
      expect(applied.ecoScore).toBeGreaterThan(0);
    });

    it("should handle meetsCondition with unknown comparator", () => {
      const dummy = {
        metric: "someMetric",
        comparator: "unknown",
        threshold: 10,
      };
      expect(meetsCondition(dummy, { someMetric: 5 })).toBe(false);
    });

    it("should handle meetsCondition with invalid value for number comparators", () => {
      const dummyGte = {
        metric: "someMetric",
        comparator: "gte",
        threshold: 10,
      };
      const dummyLte = {
        metric: "someMetric",
        comparator: "lte",
        threshold: 10,
      };
      expect(meetsCondition(dummyGte, { someMetric: "not-a-number" })).toBe(
        false,
      );
      expect(meetsCondition(dummyLte, { someMetric: "not-a-number" })).toBe(
        false,
      );
    });

    it("should handle meetsCondition with invalid threshold for isIn comparator", () => {
      const dummyIsIn = {
        metric: "someMetric",
        comparator: "isIn",
        threshold: "not-an-array",
      };
      expect(meetsCondition(dummyIsIn, { someMetric: "value" })).toBe(false);
    });

    it("should ignore already unlocked achievements", () => {
      const state = defaultState();
      state.calculatorCompleted = true;
      state.unlockedAchievements = ["firstCalculation"];
      const newBadges = evaluateNewAchievements(state);
      const unlockedIds = newBadges.map((b) => b.id);
      expect(unlockedIds).not.toContain("firstCalculation");
    });

    it("buildMetricsSnapshot and evaluateNewAchievements handle empty state object", () => {
      const metrics = buildMetricsSnapshot({});
      expect(metrics.annualTotal).toBe(Infinity);
      expect(metrics.dietType).toBeNull();
      expect(metrics.renewablePercent).toBe(0);
      expect(metrics.recycledPercent).toBe(0);
      expect(metrics.currentStreak).toBe(0);
      expect(metrics.weeklyChallengesCompleted).toBe(0);

      // evaluateNewAchievements with empty state (which maps state.unlockedAchievements as undefined)
      const newBadges = evaluateNewAchievements({});
      expect(newBadges).toBeInstanceOf(Array);
    });
  });

  describe("toggleChecklistItem", () => {
    it("should toggle item, award points, and manage streaks", () => {
      let state = defaultState();
      // Initially checklist points = 0, streak = 0
      state = toggleChecklistItem(state, "recycleShare");

      expect(state.checklist.completed.recycleShare).toBe(true);
      expect(state.ecoScore).toBeGreaterThan(0);
      expect(state.streak.current).toBe(1);
    });

    it("should handle toggling multiple items on the same day", () => {
      let state = defaultState();
      state = toggleChecklistItem(state, "recycleShare");
      state = toggleChecklistItem(state, "plantMeal");
      expect(state.checklist.completed.recycleShare).toBe(true);
      expect(state.checklist.completed.plantMeal).toBe(true);
    });

    it("should continue the streak when active yesterday and today", () => {
      let state = defaultState();
      const yesterdayKey = getYesterdayKey();
      state.streak = {
        current: 2,
        longest: 2,
        lastActiveDate: yesterdayKey,
      };
      state = toggleChecklistItem(state, "recycleShare");
      expect(state.streak.current).toBe(3);
      expect(state.streak.longest).toBe(3);
    });

    it("should return same state if checklist item id is invalid", () => {
      const state = defaultState();
      const nextState = toggleChecklistItem(state, "nonExistentItem");
      expect(nextState).toBe(state);
    });
  });

  describe("completeWeeklyChallenge", () => {
    it("should mark weekly challenge complete", () => {
      let state = defaultState();
      state = completeWeeklyChallenge(state);
      const challengeKey = getCurrentChallenge().weekKey;
      expect(state.weeklyChallenge.completedWeeks).toContain(challengeKey);
    });

    it("should return same state if challenge is already completed", () => {
      let state = defaultState();
      state = completeWeeklyChallenge(state);
      const secondState = completeWeeklyChallenge(state);
      expect(secondState).toBe(state);
    });
  });
});
