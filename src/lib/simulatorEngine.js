/**
 * simulatorEngine.js — unchanged math from the original `Simulator`
 * namespace ("what-if" projection used by the Scenario Simulator).
 */
import { EMISSION_FACTORS } from './constants.js';
import { CarbonData as Data } from './data.js';

/**
 * Evaluates lifestyle changes against baseline emissions.
 * @param {any} values - Original calculator baseline values.
 * @param {Record<string, number>} byCategoryAnnual - Original category emission values.
 * @param {{
 *   driveLessPercent: number,
 *   renewableTarget: number,
 *   dietTarget: string,
 *   wasteReducePercent: number
 * }} sliders - Target slider settings.
 * @returns {{
 *   baselineTotal: number,
 *   newTotal: number,
 *   savedKg: number,
 *   equivalentTrees: number,
 *   equivalentKm: number,
 *   byCategory: Record<string, number>
 * }} The projected footprint outcomes.
 */
export function runSimulation(values, byCategoryAnnual, sliders) {
  const f = EMISSION_FACTORS;
  const baselineTotal = Data.CATEGORY_ORDER.reduce((sum, k) => sum + byCategoryAnnual[k], 0);

  const newTransportation = byCategoryAnnual.transportation * (1 - sliders.driveLessPercent / 100);
  const newElectricity = values.electricityKwhPerMonth * 12 * f.electricity.gridFactor * (1 - sliders.renewableTarget / 100);

  let dietFactor = f.diet[sliders.dietTarget];
  if (typeof dietFactor !== 'number') dietFactor = f.diet[values.dietType];
  const newDiet = dietFactor * 365;

  const newWaste = byCategoryAnnual.waste * (1 - sliders.wasteReducePercent / 100);
  const newWater = byCategoryAnnual.water;

  const newTotal = newTransportation + newElectricity + newDiet + newWaste + newWater;
  const savedKg = baselineTotal - newTotal;

  return {
    baselineTotal,
    newTotal: Math.max(0, newTotal),
    savedKg,
    equivalentTrees: savedKg / Data.CONVERSIONS.kgAbsorbedPerTreePerYear,
    equivalentKm: savedKg / Data.CONVERSIONS.kgPerKmDrivenAveragePetrolCar,
    byCategory: {
      transportation: Math.max(0, newTransportation),
      electricity: Math.max(0, newElectricity),
      diet: Math.max(0, newDiet),
      waste: Math.max(0, newWaste),
      water: Math.max(0, newWater)
    }
  };
}
