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
import { CarbonData as Data } from './data.js';
import { clamp } from './format.js';

export const NUMBER_FIELDS = [
  { id: 'commuteKmPerDay', min: 0, max: 500, label: 'Distance driven per day' },
  { id: 'transitKmPerWeek', min: 0, max: 2000, label: 'Public transit distance per week' },
  { id: 'flightsShortHaulPerYear', min: 0, max: 100, label: 'Short-haul flights per year' },
  { id: 'flightsLongHaulPerYear', min: 0, max: 100, label: 'Long-haul flights per year' },
  { id: 'electricityKwhPerMonth', min: 0, max: 5000, label: 'Electricity used per month' },
  { id: 'renewablePercent', min: 0, max: 100, label: 'Share from renewables' },
  { id: 'wasteKgPerWeek', min: 0, max: 200, label: 'Household waste per week' },
  { id: 'recycledPercent', min: 0, max: 100, label: 'Share recycled or composted' },
  { id: 'waterLitersPerDay', min: 0, max: 2000, label: 'Water used per day' }
];

export const FIELD_BOUNDS = NUMBER_FIELDS.reduce((map, field) => {
  map[field.id] = field;
  return map;
}, {});

/** Returns an error string for a field value, or '' if it is valid. */
export function validateField(id, value) {
  const bounds = FIELD_BOUNDS[id];
  if (!bounds) return '';
  if (value === '' || value === null || typeof value === 'undefined') {
    return `${bounds.label} is required.`;
  }
  const num = Number(value);
  if (!isFinite(num)) return `${bounds.label} must be a number.`;
  if (num < bounds.min || num > bounds.max) {
    return `Enter a value between ${bounds.min} and ${bounds.max}.`;
  }
  return '';
}

export const DEFAULT_CALCULATOR_INPUTS = {
  commuteKmPerDay: 20,
  transitKmPerWeek: 0,
  flightsShortHaulPerYear: 0,
  flightsLongHaulPerYear: 0,
  electricityKwhPerMonth: 250,
  renewablePercent: 0,
  wasteKgPerWeek: 8,
  recycledPercent: 30,
  waterLitersPerDay: 150,
  vehicleType: 'petrolCar',
  dietType: 'mediumMeat',
  waterHeatedMostly: false
};

export function computeFootprint(values) {
  const f = Data.EMISSION_FACTORS;
  let vehicleFactor = f.transportation.vehicles[values.vehicleType];
  if (typeof vehicleFactor !== 'number') vehicleFactor = 0;

  const transportationAnnual =
    (values.commuteKmPerDay * vehicleFactor * 365) +
    (values.transitKmPerWeek * f.transportation.publicTransit * 52) +
    (values.flightsShortHaulPerYear * f.transportation.flightShortHaul) +
    (values.flightsLongHaulPerYear * f.transportation.flightLongHaul);

  const renewableShare = clamp(values.renewablePercent, 0, 100) / 100;
  const electricityAnnual = values.electricityKwhPerMonth * 12 * f.electricity.gridFactor * (1 - renewableShare);

  let dietFactor = f.diet[values.dietType];
  if (typeof dietFactor !== 'number') dietFactor = f.diet.mediumMeat;
  const dietAnnual = dietFactor * 365;

  const recycledShare = clamp(values.recycledPercent, 0, 100) / 100;
  const wasteEffectiveFactor = (f.waste.landfill * (1 - recycledShare)) + (f.waste.recycledOrComposted * recycledShare);
  const wasteAnnual = values.wasteKgPerWeek * 52 * wasteEffectiveFactor;

  const waterFactor = f.water.coldSupply + (values.waterHeatedMostly ? f.water.heatedExtra : 0);
  const waterAnnual = values.waterLitersPerDay * 365 * waterFactor;

  const byCategoryAnnual = {
    transportation: Math.max(0, transportationAnnual),
    electricity: Math.max(0, electricityAnnual),
    diet: Math.max(0, dietAnnual),
    waste: Math.max(0, wasteAnnual),
    water: Math.max(0, waterAnnual)
  };

  const annual = Data.CATEGORY_ORDER.reduce((sum, key) => sum + byCategoryAnnual[key], 0);

  return {
    annual,
    monthly: annual / 12,
    daily: annual / 365,
    byCategoryAnnual
  };
}
