/**
 * calculations.js
 * ---------------------------------------------------------------------------
 * The core footprint calculation engine. Logic is unchanged from the
 * original utils.js `computeFootprint` — same factors, same formula, same
 * output shape — so every previously-correct result still computes
 * identically. NUMBER_FIELDS now also gets actually consumed (by the
 * calculator wizard's validation), instead of being defined but unused.
 * ---------------------------------------------------------------------------
 */
import { CarbonData as Data } from "@/lib/data.js";
import { clamp } from "@/lib/format.js";
import { EMISSION_FACTORS, DEFAULT_INPUTS } from "@/lib/constants.js";

/**
 * Array of field definitions specifying numeric inputs and their bounds.
 * @type {Array<{ id: string, min: number, max: number, label: string }>}
 */
export const NUMBER_FIELDS = [
  { id: "commuteKmPerDay", min: 0, max: 500, label: "Distance driven per day" },
  {
    id: "transitKmPerWeek",
    min: 0,
    max: 2000,
    label: "Public transit distance per week",
  },
  {
    id: "flightsShortHaulPerYear",
    min: 0,
    max: 100,
    label: "Short-haul flights per year",
  },
  {
    id: "flightsLongHaulPerYear",
    min: 0,
    max: 100,
    label: "Long-haul flights per year",
  },
  {
    id: "electricityKwhPerMonth",
    min: 0,
    max: 5000,
    label: "Electricity used per month",
  },
  { id: "renewablePercent", min: 0, max: 100, label: "Share from renewables" },
  { id: "wasteKgPerWeek", min: 0, max: 200, label: "Household waste per week" },
  {
    id: "recycledPercent",
    min: 0,
    max: 100,
    label: "Share recycled or composted",
  },
  { id: "waterLitersPerDay", min: 0, max: 2000, label: "Water used per day" },
];

/**
 * A mapping of field IDs to their bounds definitions for efficient lookup.
 * @type {Record<string, { id: string, min: number, max: number, label: string }>}
 */
export const FIELD_BOUNDS = NUMBER_FIELDS.reduce((map, field) => {
  map[field.id] = field;
  return map;
}, {});

/**
 * Validate a single input field.
 *
 * @param {string} id - Identifier of the field (must match a key in FIELD_BOUNDS).
 * @param {any} value - The raw value entered by the user.
 * @returns {string} Empty string when the value is valid; otherwise a human‑readable error message.
 */
export function validateField(id, value) {
  const bounds = FIELD_BOUNDS[id];
  if (!bounds) return "";
  if (value === "" || value === null || typeof value === "undefined") {
    return `${bounds.label} is required.`;
  }
  const num = Number(value);
  if (!isFinite(num)) return `${bounds.label} must be a number.`;
  if (num < bounds.min || num > bounds.max) {
    return `Enter a value between ${bounds.min} and ${bounds.max}.`;
  }
  return "";
}

/**
 * Default input values for the carbon footprint calculator wizard.
 * @type {typeof DEFAULT_INPUTS}
 */
export const DEFAULT_CALCULATOR_INPUTS = DEFAULT_INPUTS;

const DAYS_PER_YEAR = 365;
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

/**
 * Compute the carbon footprint for a given set of user inputs.
 *
 * The calculation uses emission factors defined in `constants.js` (via `EMISSION_FACTORS`).
 * It returns the total annual footprint and derived monthly/daily values, as well as a
 * breakdown per category for UI display.
 *
 * @param {typeof DEFAULT_CALCULATOR_INPUTS} values - Normalized calculator input values.
 * @returns {{
 *   annual: number,
 *   monthly: number,
 *   daily: number,
 *   byCategoryAnnual: Record<string, number>
 * }} Object containing the computed footprint.
 * */
export function computeFootprint(values) {
  const f = EMISSION_FACTORS;
  let vehicleFactor = f.transportation.vehicles[values.vehicleType];
  if (typeof vehicleFactor !== "number") vehicleFactor = 0;

  const transportationAnnual =
    values.commuteKmPerDay * vehicleFactor * DAYS_PER_YEAR +
    values.transitKmPerWeek * f.transportation.publicTransit * WEEKS_PER_YEAR +
    values.flightsShortHaulPerYear * f.transportation.flightShortHaul +
    values.flightsLongHaulPerYear * f.transportation.flightLongHaul;

  const renewableShare = clamp(values.renewablePercent, 0, 100) / 100;
  const electricityAnnual =
    values.electricityKwhPerMonth *
    MONTHS_PER_YEAR *
    f.electricity.gridFactor *
    (1 - renewableShare);

  let dietFactor = f.diet[values.dietType];
  if (typeof dietFactor !== "number") {
    dietFactor = f.diet.mediumMeat;
  }
  const dietAnnual = dietFactor * DAYS_PER_YEAR;
  const recycledShare = clamp(values.recycledPercent, 0, 100) / 100;
  const wasteEffectiveFactor =
    f.waste.landfill * (1 - recycledShare) +
    f.waste.recycledOrComposted * recycledShare;
  const wasteAnnual =
    values.wasteKgPerWeek * WEEKS_PER_YEAR * wasteEffectiveFactor;

  const waterFactor =
    f.water.coldSupply + (values.waterHeatedMostly ? f.water.heatedExtra : 0);
  const waterAnnual = values.waterLitersPerDay * DAYS_PER_YEAR * waterFactor;

  const byCategoryAnnual = {
    transportation: Math.max(0, transportationAnnual),
    electricity: Math.max(0, electricityAnnual),
    diet: Math.max(0, dietAnnual),
    waste: Math.max(0, wasteAnnual),
    water: Math.max(0, waterAnnual),
  };

  let annual = 0;
  for (const key of Data.CATEGORY_ORDER) {
    annual += byCategoryAnnual[key];
  }

  return {
    annual,
    monthly: annual / MONTHS_PER_YEAR,
    daily: annual / DAYS_PER_YEAR,
    byCategoryAnnual,
  };
}
