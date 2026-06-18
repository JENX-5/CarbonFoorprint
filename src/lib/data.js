/**
 * data.js
 * ---------------------------------------------------------------------------
 * Contour — Carbon Footprint Awareness Platform
 *
 * This file holds every piece of STATIC data the application uses:
 *   - emission factors used by the calculator
 *   - human-readable labels for form options
 *   - sustainability tips shown in the Education Hub
 *   - achievement (badge) definitions
 *   - weekly challenge definitions
 *   - daily checklist item definitions
 *   - gamification levels and point values
 *   - scoring / benchmark configuration
 *
 * No application logic lives here. This module exports the static configurations
 * and constants used throughout the React application.
 * All factors and benchmarks are exposed cleanly as structured data objects.
 *
 * IMPORTANT — about the numbers below:
 * Emission factors for everyday activities vary a great deal by country,
 * grid mix, vehicle efficiency, and methodology. The values here are
 * reasonable, widely-cited, illustrative averages intended for AWARENESS
 * and EDUCATION, not for regulatory, scientific, or financial reporting.
 * This is documented again in README.md under "Assumptions".
 * ---------------------------------------------------------------------------
 */
/** Emission factors. Units are noted on every entry. */
const EMISSION_FACTORS = {
  transportation: {
    // kg CO2e per km, by vehicle/mode used for the daily commute
    vehicles: {
      none: 0,
      petrolCar: 0.192,
      dieselCar: 0.171,
      hybridCar: 0.106,
      electricCar: 0.053,
      motorbike: 0.103,
    },
    // kg CO2e per passenger-km for bus/train style public transit
    publicTransit: 0.105,
    // kg CO2e per flight (average, illustrative), independent of distance
    flightShortHaul: 250,
    flightLongHaul: 1100,
  },
  electricity: {
    // kg CO2e per kWh drawn from a typical (non-renewable) grid mix
    gridFactor: 0.82,
  },
  diet: {
    // kg CO2e per day, by overall dietary pattern
    meatHeavy: 7.19,
    mediumMeat: 5.63,
    lowMeat: 4.67,
    pescatarian: 3.91,
    vegetarian: 3.81,
    vegan: 2.89,
  },
  waste: {
    // kg CO2e per kg of waste, depending on its end destination
    landfill: 0.45,
    recycledOrComposted: 0.11,
  },
  water: {
    // kg CO2e per litre of water supplied and treated
    coldSupply: 0.0003,
    // additional kg CO2e per litre when that water is also heated
    heatedExtra: 0.01,
  },
};

/** Order in which categories should generally be displayed. */
const CATEGORY_ORDER = [
  "transportation",
  "electricity",
  "diet",
  "waste",
  "water",
];

const CATEGORY_LABELS = {
  transportation: "Transportation",
  electricity: "Electricity",
  diet: "Diet",
  waste: "Waste",
  water: "Water",
};

/** Single decorative glyph per category — always paired with text, never used alone. */
const CATEGORY_ICONS = {
  transportation: "\uD83D\uDE97",
  electricity: "\u26A1",
  diet: "\uD83C\uDF7D\uFE0F",
  waste: "\uD83D\uDDD1\uFE0F",
  water: "\uD83D\uDCA7",
};

const VEHICLE_LABELS = {
  none: "No regular commute by vehicle",
  petrolCar: "Petrol / gasoline car",
  dieselCar: "Diesel car",
  hybridCar: "Hybrid car",
  electricCar: "Electric car",
  motorbike: "Motorbike / scooter",
};

const DIET_LABELS = {
  meatHeavy: "Meat with most meals",
  mediumMeat: "Meat most days",
  lowMeat: "Meat a few times a week",
  pescatarian: "Pescatarian (fish, no other meat)",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
};

/**
 * Reference points used to turn an absolute kg CO2e figure into a score,
 * a rating label, and a comparison against a typical global footprint.
 * These are illustrative benchmarks, not authoritative statistics.
 */
const BENCHMARKS = {
  globalAverageAnnualKg: 4700,
};

const SCORE_BOUNDS = {
  // Annual kg CO2e mapped to a score of 100 (best) ...
  best: 1500,
  // ... down to a score of 0 (worst)
  worst: 20000,
};

/** Highest "min" whose threshold the score clears wins. Keep sorted descending. */
const RATING_THRESHOLDS = [
  { min: 80, label: "Excellent", className: "rating-excellent" },
  { min: 60, label: "Good", className: "rating-good" },
  { min: 40, label: "Fair", className: "rating-fair" },
  { min: 20, label: "High Impact", className: "rating-high" },
  { min: 0, label: "Critical", className: "rating-critical" },
];

/** Rough, relatable conversions used only to make savings tangible. */
const CONVERSIONS = {
  kgAbsorbedPerTreePerYear: 21,
  kgPerKmDrivenAveragePetrolCar: 0.192,
};

/** Gamification levels. Highest "min" the score clears wins. Keep sorted ascending. */
const LEVELS = [
  { name: "Eco Novice", min: 0 },
  { name: "Eco Explorer", min: 100 },
  { name: "Eco Adventurer", min: 300 },
  { name: "Eco Champion", min: 700 },
  { name: "Eco Legend", min: 1500 },
];

const ACTION_POINTS = {
  calculatorCompleted: 50,
  simulatorRun: 20,
  weeklyChallenge: 100,
  achievementUnlock: 25,
};

/** Daily checklist items. "points" are awarded once per item per calendar day. */
const CHECKLIST_ITEMS = [
  {
    id: "reusableBottle",
    label: "Used a reusable bottle or cup instead of disposable",
    points: 10,
  },
  {
    id: "activeCommute",
    label: "Walked, cycled, or used public transit for at least one trip",
    points: 10,
  },
  {
    id: "plantMeal",
    label: "Ate at least one fully plant-based meal",
    points: 10,
  },
  {
    id: "unpluggedDevices",
    label: "Turned off or unplugged devices that were not in use",
    points: 10,
  },
  { id: "recycleShare", label: "Recycled share item", points: 10 },
  {
    id: "noSingleUsePlastic",
    label: "Avoided single-use plastic for the entire day",
    points: 10,
  },
];

/** Weekly challenges. The active one rotates automatically by ISO week number. */
const CHALLENGES = [
  {
    id: "meatlessWeek",
    title: "Meatless Week",
    description: "Go fully plant-based for seven days straight.",
    category: "diet",
    points: 100,
  },
  {
    id: "carFreeCommute",
    title: "Car-Free Commute",
    description:
      "Replace your daily commute with walking, cycling, or transit all week.",
    category: "transportation",
    points: 100,
  },
  {
    id: "unplugChallenge",
    title: "Unplug Challenge",
    description:
      "Switch off standby power on every device, every night, this week.",
    category: "electricity",
    points: 100,
  },
  {
    id: "zeroWasteWeek",
    title: "Zero-Waste Week",
    description:
      "Send nothing to landfill for seven days — recycle or compost instead.",
    category: "waste",
    points: 100,
  },
  {
    id: "shortShowerSprint",
    title: "Short Shower Sprint",
    description: "Keep every shower under five minutes for the whole week.",
    category: "water",
    points: 100,
  },
  {
    id: "secondHandSeek",
    title: "Second-Hand Seek",
    description:
      "Buy nothing new this week — repair, borrow, or buy second-hand instead.",
    category: "waste",
    points: 100,
  },
  {
    id: "localFoodWeek",
    title: "Local Food Week",
    description:
      "Choose locally grown or produced food for every meal this week.",
    category: "diet",
    points: 100,
  },
  {
    id: "paperlessPush",
    title: "Paperless Push",
    description: "Switch every bill and receipt you can to digital this week.",
    category: "waste",
    points: 100,
  },
];

/**
 * Achievement (badge) definitions.
 * Each achievement is evaluated generically by script.js against a
 * "metrics snapshot" object, using one of four comparators:
 *   gte     -> metrics[metric] >= threshold
 *   lte     -> metrics[metric] <= threshold
 *   boolean -> metrics[metric] === threshold (threshold is true/false)
 *   isIn    -> threshold.indexOf(metrics[metric]) !== -1
 * Keeping the condition data-driven (instead of one bespoke function per
 * badge) keeps the achievement system open to extension without touching
 * the evaluation logic.
 */
const ACHIEVEMENTS = [
  {
    id: "firstCalculation",
    title: "First Reading",
    description: "Complete your first carbon footprint calculation.",
    icon: "\uD83E\uDDED",
    metric: "calculatorCompleted",
    comparator: "boolean",
    threshold: true,
  },
  {
    id: "scenarioExplorer",
    title: "Scenario Explorer",
    description: "Run the lifestyle simulator at least once.",
    icon: "\uD83D\uDD2D",
    metric: "simulatorRun",
    comparator: "boolean",
    threshold: true,
  },
  {
    id: "lowCarbonLiving",
    title: "Low-Carbon Living",
    description: "Reach an annual footprint under 2,000 kg CO2e.",
    icon: "\uD83C\uDF3F",
    metric: "annualTotal",
    comparator: "lte",
    threshold: 2000,
  },
  {
    id: "plantPowered",
    title: "Plant Powered",
    description: "Log a vegetarian or vegan diet.",
    icon: "\uD83E\uDD57",
    metric: "dietType",
    comparator: "isIn",
    threshold: ["vegetarian", "vegan"],
  },
  {
    id: "renewableReady",
    title: "Renewable Ready",
    description: "Source at least 50% of your electricity from renewables.",
    icon: "\u2600\uFE0F",
    metric: "renewablePercent",
    comparator: "gte",
    threshold: 50,
  },
  {
    id: "zeroWasteHero",
    title: "Zero-Waste Hero",
    description: "Recycle or compost at least 80% of your waste.",
    icon: "\u267B\uFE0F",
    metric: "recycledPercent",
    comparator: "gte",
    threshold: 80,
  },
  {
    id: "weekWarrior",
    title: "Week Warrior",
    description: "Keep a 7-day sustainability streak alive.",
    icon: "\uD83D\uDD25",
    metric: "currentStreak",
    comparator: "gte",
    threshold: 7,
  },
  {
    id: "challengeChampion",
    title: "Challenge Champion",
    description: "Complete three weekly challenges.",
    icon: "\uD83C\uDFC6",
    metric: "weeklyChallengesCompleted",
    comparator: "gte",
    threshold: 3,
  },
  {
    id: "checklistPro",
    title: "Checklist Pro",
    description: "Complete every item on a day's checklist.",
    icon: "\u2705",
    metric: "checklistAllCompletedToday",
    comparator: "boolean",
    threshold: true,
  },
  {
    id: "forestGuardian",
    title: "Forest Guardian",
    description: "Reach the Forest Guardian eco level.",
    icon: "\uD83C\uDF33",
    metric: "ecoScore",
    comparator: "gte",
    threshold: 1500,
  },
];

/** Sustainability tips shown in the Education Hub, grouped by category. */
const SUSTAINABILITY_TIPS = {
  transportation: [
    {
      title: "Combine errands into one trip",
      description:
        "Batching short trips together cuts the number of cold starts, which are the least fuel-efficient part of any drive.",
    },
    {
      title: "Try carpooling or a car-share",
      description:
        "Splitting a commute between two or more people divides the emissions of that trip by the number of riders.",
    },
    {
      title: "Keep tires properly inflated",
      description:
        "Under-inflated tires increase rolling resistance, quietly raising fuel use on every single trip.",
    },
    {
      title: "Consider a hybrid or electric vehicle next",
      description:
        "Electric and hybrid drivetrains typically cut per-km emissions by half or more compared with a petrol car.",
    },
    {
      title: "Work from home when you can",
      description:
        "Every commute skipped entirely removes that trip\u2019s emissions completely — no replacement needed.",
    },
  ],
  electricity: [
    {
      title: "Switch to LED lighting",
      description:
        "LED bulbs use roughly a quarter of the electricity of incandescent bulbs for the same brightness.",
    },
    {
      title: "Unplug what you are not using",
      description:
        "Chargers and electronics left plugged in continue drawing small amounts of standby power around the clock.",
    },
    {
      title: "Ask about a renewable energy plan",
      description:
        "Many utilities offer a green tariff or renewable mix option that lowers your effective grid emission factor.",
    },
    {
      title: "Turn the water heater down a notch",
      description:
        "Lowering the water heater setpoint reduces the standby energy needed to keep water hot all day.",
    },
    {
      title: "Use a programmable thermostat",
      description:
        "Automatically easing heating and cooling while you are away or asleep avoids paying to condition empty rooms.",
    },
  ],
  diet: [
    {
      title: "Add one plant-based meal a week",
      description:
        "A single weekly swap is small enough to stick, and it compounds quickly across a year.",
    },
    {
      title: "Choose chicken or fish over red meat",
      description:
        "Red meat — especially beef — carries a notably higher footprint per meal than most other proteins.",
    },
    {
      title: "Buy what is in season and local",
      description:
        "In-season produce usually needs less energy-intensive growing and storage than out-of-season imports.",
    },
    {
      title: "Plan meals to cut food waste",
      description:
        "Food that is grown, transported, and then thrown away still carries its full footprint with nothing to show for it.",
    },
    {
      title: "Try a regular meat-free day",
      description:
        "A recurring meat-free day is a low-effort habit that is easy to remember and easy to keep.",
    },
  ],
  waste: [
    {
      title: "Start composting food scraps",
      description:
        "Composting keeps organic waste out of landfill, where it would otherwise break down into methane.",
    },
    {
      title: "Switch to reusable bags and containers",
      description:
        "Reusable items pay back their own footprint after only a handful of uses compared with disposables.",
    },
    {
      title: "Double check local recycling rules",
      description:
        "Contaminated recycling — wrong materials mixed in — can send an entire batch to landfill instead.",
    },
    {
      title: "Repair instead of replace",
      description:
        "Extending the life of something you already own avoids the manufacturing footprint of a brand-new replacement.",
    },
    {
      title: "Buy in bulk to cut packaging",
      description:
        "Larger pack sizes generally use less packaging material per unit of product.",
    },
  ],
  water: [
    {
      title: "Install a low-flow showerhead",
      description:
        "Low-flow fixtures cut the volume of hot water used without noticeably changing the shower itself.",
    },
    {
      title: "Fix leaks promptly",
      description:
        "A slow drip can waste a surprising amount of treated water over the course of a month.",
    },
    {
      title: "Run full loads only",
      description:
        "Dishwashers and washing machines use a similar amount of water and energy whether full or half-empty.",
    },
    {
      title: "Collect rainwater for the garden",
      description:
        "Using rainwater outdoors reduces demand on treated municipal supply.",
    },
    {
      title: "Trim shower time by a couple of minutes",
      description:
        "A shorter shower lowers both water use and the energy spent heating it.",
    },
  ],
};

export const CarbonData = {
  EMISSION_FACTORS: EMISSION_FACTORS,
  CATEGORY_ORDER: CATEGORY_ORDER,
  CATEGORY_LABELS: CATEGORY_LABELS,
  CATEGORY_ICONS: CATEGORY_ICONS,
  VEHICLE_LABELS: VEHICLE_LABELS,
  DIET_LABELS: DIET_LABELS,
  BENCHMARKS: BENCHMARKS,
  SCORE_BOUNDS: SCORE_BOUNDS,
  RATING_THRESHOLDS: RATING_THRESHOLDS,
  CONVERSIONS: CONVERSIONS,
  LEVELS: LEVELS,
  ACTION_POINTS: ACTION_POINTS,
  CHECKLIST_ITEMS: CHECKLIST_ITEMS,
  CHALLENGES: CHALLENGES,
  ACHIEVEMENTS: ACHIEVEMENTS,
  SUSTAINABILITY_TIPS: SUSTAINABILITY_TIPS,
};
