/**
 * format.js
 * ---------------------------------------------------------------------------
 * Pure, dependency-free formatting and date helpers shared across the app.
 * Ported from the original utils.js `Utils` namespace with identical
 * behaviour — only the module boundary changed.
 * ---------------------------------------------------------------------------
 */

export function clamp(value, min, max) {
  if (!isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function formatNumber(value, decimals) {
  const d = typeof decimals === 'number' ? decimals : 0;
  let v = value;
  if (!isFinite(v)) v = 0;
  const rounded = clamp(v, 0, Number.MAX_SAFE_INTEGER);
  try {
    return rounded.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  } catch {
    return rounded.toFixed(d);
  }
}

export function formatSigned(value, decimals) {
  const d = typeof decimals === 'number' ? decimals : 0;
  // Zero is considered non‑negative, so always prepend '+'
  const sign = value >= 0 ? '+' : '\u2212';
  return sign + formatNumber(Math.abs(value), d);
}

export function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

export function getDateKey(date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

export function getTodayKey() {
  return getDateKey(new Date());
}

export function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateKey(d);
}

export function getISOWeekInfo(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { isoYear: d.getUTCFullYear(), week };
}

export function getCurrentWeekKey() {
  const info = getISOWeekInfo(new Date());
  return `${info.isoYear}-W${pad2(info.week)}`;
}

/** Short, friendly relative-ish date label used in history lists. */
export function formatHistoryDate(iso) {
  // Guard against invalid ISO strings which produce an "Invalid Date" object
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return '';
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
