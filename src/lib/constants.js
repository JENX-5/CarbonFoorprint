// src/lib/constants.js
/**
 * Centralized constants for the Carbon Footprint application.
 * This module re-exports emission factors and default inputs from the existing data module
 * to avoid duplication while providing a single import location for other code.
 */
import { CarbonData as Data } from './data.js';

export const EMISSION_FACTORS = Data.EMISSION_FACTORS;

export const DEFAULT_INPUTS = {
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
