/**
 * insightsEngine.js — unchanged math from the original `Insights` namespace.
 * Generates the transparent, rule-based recommendation list described in
 * the README's "AI Recommendation Engine" section. Each recommendation now
 * also carries a `simulatorPreset` so the Insights page can hand a
 * recommendation straight to the Simulator ("Try this scenario").
 */
import { CarbonData as Data } from './data.js';

export function generateInsights(values, byCategoryAnnual) {
  const f = Data.EMISSION_FACTORS;
  const annualTotal = Data.CATEGORY_ORDER.reduce((sum, k) => sum + byCategoryAnnual[k], 0);

  const topCategory = Data.CATEGORY_ORDER.reduce(
    (best, key) => (byCategoryAnnual[key] > byCategoryAnnual[best] ? key : best),
    Data.CATEGORY_ORDER[0]
  );

  const topShare = annualTotal > 0 ? (byCategoryAnnual[topCategory] / annualTotal) * 100 : 0;

  const candidates = [];

  const transportSavings = byCategoryAnnual.transportation * 0.20;
  candidates.push({
    category: 'transportation',
    savingsKg: transportSavings,
    text: 'Combining trips, shifting some drives to public transit, and driving more smoothly could realistically cut transportation emissions by about 20%.',
    simulatorPreset: { driveLessPercent: 20 }
  });

  const electricityAt100 = values.electricityKwhPerMonth * 12 * f.electricity.gridFactor * 0;
  const electricitySavings = byCategoryAnnual.electricity - electricityAt100;
  candidates.push({
    category: 'electricity',
    savingsKg: electricitySavings,
    text: 'Moving to a 100% renewable electricity plan would remove essentially all of the grid-related emissions in this category.',
    simulatorPreset: { renewableTarget: 100 }
  });

  let dietSavings = 0;
  let dietText = 'Your diet is already in the lowest-impact tiers, so no further rule-based saving was identified here.';
  if (values.dietType !== 'vegetarian' && values.dietType !== 'vegan') {
    const currentDietFactor = f.diet[values.dietType];
    const vegetarianFactor = f.diet.vegetarian;
    dietSavings = Math.max(0, (currentDietFactor - vegetarianFactor) * 365);
    dietText = 'Shifting toward a vegetarian pattern would lower the daily emission factor behind your meals.';
  }
  candidates.push({ category: 'diet', savingsKg: dietSavings, text: dietText, simulatorPreset: { dietTarget: 'vegetarian' } });

  const recycledAt90Factor = (f.waste.landfill * 0.10) + (f.waste.recycledOrComposted * 0.90);
  const wasteAt90 = values.wasteKgPerWeek * 52 * recycledAt90Factor;
  const wasteSavings = Math.max(0, byCategoryAnnual.waste - wasteAt90);
  candidates.push({
    category: 'waste',
    savingsKg: wasteSavings,
    text: 'Raising your recycled or composted share to about 90% would divert most of this waste away from higher-emission landfill processing.',
    simulatorPreset: { wasteReducePercent: 30 }
  });

  const waterSavings = byCategoryAnnual.water * 0.15;
  candidates.push({
    category: 'water',
    savingsKg: waterSavings,
    text: 'Shorter showers and only running full dishwasher or laundry loads could cut water-related emissions by about 15%.',
    simulatorPreset: {}
  });

  candidates.sort((a, b) => b.savingsKg - a.savingsKg);
  const recommendations = candidates.filter((c) => c.savingsKg > 0.5).slice(0, 3);
  const totalPotentialSavings = recommendations.reduce((sum, c) => sum + c.savingsKg, 0);

  return {
    topCategory,
    topShare,
    annualTotal,
    recommendations,
    totalPotentialSavings
  };
}
