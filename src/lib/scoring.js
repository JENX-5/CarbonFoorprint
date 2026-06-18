/**
 * scoring.js
 * ---------------------------------------------------------------------------
 * The scoring engine that computes environmental scores and ratings based
 * on annual carbon footprints.
 * ---------------------------------------------------------------------------
 */
import { CarbonData as Data } from "@/lib/data.js";
import { clamp } from "@/lib/format.js";

/**
 * Computes the environmental eco score (0 to 100) based on annual carbon footprint.
 * Best (100 score) is best footprint threshold, Worst (0 score) is worst threshold.
 *
 * @param {number} annual - Annual carbon footprint in kg CO2e.
 * @returns {number} The rounded eco score from 0 to 100.
 */
export function computeScore(annual) {
  const bounds = Data.SCORE_BOUNDS;
  const raw =
    100 - ((annual - bounds.best) / (bounds.worst - bounds.best)) * 100;
  return Math.round(clamp(raw, 0, 100));
}

/**
 * Maps an eco score to a rating class and text label.
 *
 * @param {number} score - The eco score from 0 to 100.
 * @returns {{ id: string, label: string, min: number }} The rating definition object.
 */
export function getRating(score) {
  const thresholds = Data.RATING_THRESHOLDS;
  for (let i = 0; i < thresholds.length; i++) {
    if (score >= thresholds[i].min) {
      const { min, label, className } = thresholds[i];
      return { id: className, className, label, min };
    }
  }
  const last = thresholds[thresholds.length - 1];
  return {
    id: last.className,
    className: last.className,
    label: last.label,
    min: last.min,
  };
}

/**
 * Compares an annual carbon footprint value with the global average benchmark.
 *
 * @param {number} annual - Annual carbon footprint in kg CO2e.
 * @returns {{ below: boolean, percent: number, text: string }} Comparison result summary.
 */
export function compareToGlobalAverage(annual) {
  const avg = Data.BENCHMARKS.globalAverageAnnualKg;
  const diffPercent = ((avg - annual) / avg) * 100;
  const below = diffPercent >= 0;
  return {
    below,
    percent: Math.round(Math.abs(diffPercent)),
    text: `${Math.round(Math.abs(diffPercent))}% ${below ? "below" : "above"} the global average`,
  };
}
