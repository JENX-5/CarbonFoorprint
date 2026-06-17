import { CATEGORY_ICONS, CircleCheck } from '../../components/icons/index.jsx';

/**
 * Data-driven field configuration for the calculator wizard. Splitting the
 * form into discrete steps (rather than one long scrolling fieldset list,
 * as in the original) is the single biggest UX change to the calculator:
 * one focused decision at a time, a visible sense of progress, and a live
 * running total the whole way through.
 */
export const CALCULATOR_STEPS = [
  {
    id: 'transportation',
    label: 'Transportation',
    icon: CATEGORY_ICONS.transportation,
    intro: 'Your daily commute and any flights you take add up over a year.',
    fields: [
      { name: 'vehicleType', label: 'Main commute vehicle', type: 'select', optionsKey: 'VEHICLE_LABELS' },
      { name: 'commuteKmPerDay', label: 'Distance driven per day', type: 'number', min: 0, max: 500, unit: 'km' },
      { name: 'transitKmPerWeek', label: 'Public transit per week', type: 'number', min: 0, max: 2000, unit: 'km' },
      { name: 'flightsShortHaulPerYear', label: 'Short-haul flights / yr', type: 'number', min: 0, max: 100, half: true },
      { name: 'flightsLongHaulPerYear', label: 'Long-haul flights / yr', type: 'number', min: 0, max: 100, half: true }
    ]
  },
  {
    id: 'electricity',
    label: 'Electricity',
    icon: CATEGORY_ICONS.electricity,
    intro: 'Grid electricity use, and how much of it already comes from renewables.',
    fields: [
      { name: 'electricityKwhPerMonth', label: 'Electricity used per month', type: 'number', min: 0, max: 5000, unit: 'kWh' },
      { name: 'renewablePercent', label: 'Share from renewables', type: 'number', min: 0, max: 100, unit: '%' }
    ]
  },
  {
    id: 'diet',
    label: 'Diet',
    icon: CATEGORY_ICONS.diet,
    intro: 'Overall dietary pattern has one of the largest effects on day-to-day emissions.',
    fields: [
      { name: 'dietType', label: 'Overall dietary pattern', type: 'select', optionsKey: 'DIET_LABELS' }
    ]
  },
  {
    id: 'wasteWater',
    label: 'Waste & water',
    icon: CATEGORY_ICONS.waste,
    intro: 'Household waste, how much of it is diverted from landfill, and water use.',
    fields: [
      { name: 'wasteKgPerWeek', label: 'Waste per week', type: 'number', min: 0, max: 200, unit: 'kg', half: true },
      { name: 'recycledPercent', label: 'Recycled / composted', type: 'number', min: 0, max: 100, unit: '%', half: true },
      { name: 'waterLitersPerDay', label: 'Water used per day', type: 'number', min: 0, max: 2000, unit: 'L' },
      { name: 'waterHeatedMostly', label: 'Most of this water is heated', type: 'checkbox' }
    ]
  },
  {
    id: 'review',
    label: 'Review',
    icon: CircleCheck,
    intro: 'Check your answers, then calculate your footprint.'
  }
];

export const ALL_FIELDS = CALCULATOR_STEPS.flatMap((step) => step.fields || []);
