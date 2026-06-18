/**
 * format.js
 * ---------------------------------------------------------------------------
 * Pure, dependency-free formatting and date helpers shared across the app.
 * Ported from the original utils.js `Utils` namespace with identical
 * behaviour — only the module boundary changed.
 * ---------------------------------------------------------------------------
 */

/**
 * Clamps a number to be within the specified minimum and maximum bounds.
 * If the value is not finite, the minimum is returned.
 *
 * @param {number} value - The input value to clamp.
 * @param {number} min - The lower bound.
 * @param {number} max - The upper bound.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
  if (!isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Formats a number with commas and specified decimal places.
 * If the value is not finite, it is treated as 0.
 *
 * @param {number} value - The number to format.
 * @param {number} [decimals=0] - The number of decimal places.
 * @returns {string} The formatted number string.
 */
export function formatNumber(value, decimals) {
  const d = typeof decimals === "number" ? decimals : 0;
  let v = value;
  if (!isFinite(v)) v = 0;
  const rounded = clamp(v, 0, Number.MAX_SAFE_INTEGER);
  try {
    return rounded.toLocaleString("en-US", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });
  } catch {
    return rounded.toFixed(d);
  }
}

/**
 * Formats a number with a sign prefix (+ for non-negative, \u2212 for negative).
 *
 * @param {number} value - The number to format with a sign.
 * @param {number} [decimals=0] - The number of decimal places.
 * @returns {string} The formatted signed number string.
 */
export function formatSigned(value, decimals) {
  const d = typeof decimals === "number" ? decimals : 0;
  // Zero is considered non-negative, so always prepend '+'
  const sign = value >= 0 ? "+" : "\u2212";
  return sign + formatNumber(Math.abs(value), d);
}

/**
 * Pads a single or double digit number with leading zero to ensure at least 2 digits.
 *
 * @param {number} n - The number to pad.
 * @returns {string} The zero-padded string.
 */
export function pad2(n) {
  return n < 10 ? "0" + n : String(n);
}

/**
 * Returns a date key formatted as YYYY-MM-DD from a Date object.
 *
 * @param {Date} date - The Date object.
 * @returns {string} The date key string.
 */
export function getDateKey(date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

/**
 * Returns a date key formatted as YYYY-MM-DD for today.
 *
 * @returns {string} The date key for today.
 */
export function getTodayKey() {
  return getDateKey(new Date());
}

/**
 * Returns a date key formatted as YYYY-MM-DD for yesterday.
 *
 * @returns {string} The date key for yesterday.
 */
export function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateKey(d);
}

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;

/**
 * Returns ISO week info (year and week number) for a given date.
 *
 * @param {Date} date - The Date object.
 * @returns {{ isoYear: number, week: number }} The ISO Year and week number.
 */
export function getISOWeekInfo(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || DAYS_PER_WEEK;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / MS_PER_DAY + 1) / DAYS_PER_WEEK);
  return { isoYear: d.getUTCFullYear(), week };
}

/**
 * Returns a week key formatted as YYYY-Www for the current week.
 *
 * @returns {string} The current week key.
 */
export function getCurrentWeekKey() {
  const info = getISOWeekInfo(new Date());
  return `${info.isoYear}-W${pad2(info.week)}`;
}

/**
 * Formats an ISO date string into a friendly, short text label like 'Jan 15'.
 * Returns an empty string if the ISO date string is invalid.
 *
 * @param {string} iso - The ISO date string.
 * @returns {string} The friendly formatted date label.
 */
export function formatHistoryDate(iso) {
  // Guard against invalid ISO strings which produce an "Invalid Date" object
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
