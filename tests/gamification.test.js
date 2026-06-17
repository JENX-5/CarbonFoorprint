import { describe, it, expect } from 'vitest';
import { getLevel, getNextLevel, getLevelProgress, getCurrentChallenge, evaluateNewAchievements, applyAchievements, toggleChecklistItem, completeWeeklyChallenge } from '../src/lib/gamification.js';
import { defaultState } from '../src/lib/storage.js';

describe('Gamification Engine', () => {
  describe('getLevel and progress math', () => {
    it('should map ecoScore to level boundaries', () => {
      const firstLevel = getLevel(0);
      expect(firstLevel.name).toBe('Eco Novice');

      const nextLevel = getNextLevel(0);
    expect(nextLevel).not.toBeNull();
    // Using non-null assertion
    
      expect(nextLevel?.name).toBe('Eco Explorer');

      const progress = getLevelProgress(50);
      expect(progress.percent).toBe(50); // Since first level min is 0 and next level is 100
      expect(progress.pointsToNext).toBe(50);
    });

    it('should handle top level max', () => {
      const topLevel = getLevel(1500);
      expect(topLevel.name).toBe('Eco Legend');
      const progress = getLevelProgress(1600);
      expect(progress.percent).toBe(100);
      expect(progress.next).toBeNull();
    });
  });

  describe('getCurrentChallenge', () => {
    it('should retrieve a valid weekly challenge', () => {
      const challengeInfo = getCurrentChallenge();
      expect(challengeInfo).toHaveProperty('weekKey');
      expect(challengeInfo.challenge).toHaveProperty('id');
      expect(challengeInfo.challenge).toHaveProperty('title');
    });
  });

  describe('Achievements Evaluation', () => {
    it('should evaluate achievements dynamically', () => {
      const state = defaultState();
      state.calculatorCompleted = true;
      state.inputs = { renewablePercent: 60 };

      const newBadges = evaluateNewAchievements(state);
      // firstCalculation is completed, renewableReady (>=50%) is completed
      const unlockedIds = newBadges.map(b => b.id);
      expect(unlockedIds).toContain('firstCalculation');
      expect(unlockedIds).toContain('renewableReady');

      const applied = applyAchievements(state);
      expect(applied.unlockedAchievements).toContain('firstCalculation');
      expect(applied.unlockedAchievements).toContain('renewableReady');
      expect(applied.ecoScore).toBeGreaterThan(0);
    });
  });

  describe('toggleChecklistItem', () => {
    it('should toggle item, award points, and manage streaks', () => {
      let state = defaultState();
      // Initially checklist points = 0, streak = 0
      state = toggleChecklistItem(state, 'recycleShare');

      expect(state.checklist.completed.recycleShare).toBe(true);
      expect(state.ecoScore).toBeGreaterThan(0);
      expect(state.streak.current).toBe(1);
    });
  });

  describe('completeWeeklyChallenge', () => {
    it('should mark weekly challenge complete', () => {
      let state = defaultState();
      state = completeWeeklyChallenge(state);
      const challengeKey = getCurrentChallenge().weekKey;
      expect(state.weeklyChallenge.completedWeeks).toContain(challengeKey);
    });
  });
});
