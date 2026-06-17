/**
 * scoring.js — unchanged math from the original `Scoring` namespace.
 */
import { CarbonData as Data } from './data.js';
import { clamp } from './format.js';

export function computeScore(annual) {
  const bounds = Data.SCORE_BOUNDS;
  const raw = 100 - (((annual - bounds.best) / (bounds.worst - bounds.best)) * 100);
  return Math.round(clamp(raw, 0, 100));
}

export function getRating(score) {
  const thresholds = Data.RATING_THRESHOLDS;
  for (let i = 0; i < thresholds.length; i++) {
    if (score >= thresholds[i].min) return thresholds[i];
  }
  return thresholds[thresholds.length - 1];
}

export function compareToGlobalAverage(annual) {
  const avg = Data.BENCHMARKS.globalAverageAnnualKg;
  const diffPercent = ((avg - annual) / avg) * 100;
  const below = diffPercent >= 0;
  return {
    below,
    percent: Math.round(Math.abs(diffPercent)),
    text: `${Math.round(Math.abs(diffPercent))}% ${below ? 'below' : 'above'} the global average`
  };
}
