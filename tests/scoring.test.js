import { describe, it, expect } from 'vitest';
import { computeScore, getRating, compareToGlobalAverage } from '../src/lib/scoring.js';

describe('Scoring Engine', () => {
  describe('computeScore', () => {
    it('should assign a score of 100 for the best-performing footprint', () => {
      // Best is 0 or 1500 depending on bounds
      expect(computeScore(1500)).toBe(100);
      expect(computeScore(0)).toBe(100);
    });

    it('should assign a score of 0 for extreme bad footprints', () => {
      expect(computeScore(25000)).toBe(0);
    });

    it('should assign intermediate scores correctly', () => {
      const midScore = computeScore(5500);
      expect(midScore).toBeGreaterThan(0);
      expect(midScore).toBeLessThan(100);
    });
  });

  describe('getRating', () => {
    it('should return correct rating thresholds', () => {
      const excellentRating = getRating(95);
      expect(excellentRating.id).toBe('rating-excellent');

      const goodRating = getRating(75);
      expect(goodRating.id).toBe('rating-good');

      const criticalRating = getRating(10);
      expect(criticalRating.id).toBe('rating-critical');
    });
  });

  describe('compareToGlobalAverage', () => {
    it('should compute comparisons with global average', () => {
      const compBelow = compareToGlobalAverage(2000);
      expect(compBelow.below).toBe(true);
      expect(compBelow.percent).toBeGreaterThan(0);
      expect(compBelow.text).toContain('below the global average');

      const compAbove = compareToGlobalAverage(8000);
      expect(compAbove.below).toBe(false);
      expect(compAbove.percent).toBeGreaterThan(0);
      expect(compAbove.text).toContain('above the global average');
    });
  });
});
