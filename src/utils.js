
import { CarbonData as Data } from './data.js';

export const Utils = {
    clamp: (value, min, max) => {
      if (!isFinite(value)) return min;
      return Math.min(max, Math.max(min, value));
    },
    formatNumber: (value, decimals) => {
      var d = typeof decimals === 'number' ? decimals : 0;
      if (!isFinite(value)) value = 0;
      var rounded = Utils.clamp(value, 0, Number.MAX_SAFE_INTEGER);
      try {
        return rounded.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
      } catch (e) {
        return rounded.toFixed(d);
      }
    },
    formatSigned: (value, decimals) => {
      var d = typeof decimals === 'number' ? decimals : 0;
      var sign = value > 0 ? '+' : value < 0 ? '\u2212' : '';
      return sign + Utils.formatNumber(Math.abs(value), d);
    },
    pad2: (n) => n < 10 ? '0' + n : String(n),
    getDateKey: (date) => {
      var y = date.getFullYear();
      var m = Utils.pad2(date.getMonth() + 1);
      var d = Utils.pad2(date.getDate());
      return y + '-' + m + '-' + d;
    },
    getTodayKey: () => Utils.getDateKey(new Date()),
    getYesterdayKey: () => {
      var d = new Date();
      d.setDate(d.getDate() - 1);
      return Utils.getDateKey(d);
    },
    getISOWeekInfo: (date) => {
      var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      var dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      var week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return { isoYear: d.getUTCFullYear(), week: week };
    }
};

export const STORAGE_KEY = 'contourCarbonAppState_v1';
export const Storage = {
    load: () => {
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        var parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return null;
        return parsed;
      } catch (e) {
        return null;
      }
    },
    save: (state) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
      } catch (e) {
        return false;
      }
    },
    clear: () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        return true;
      } catch (e) {
        return false;
      }
    }
};

export function defaultState() {
    return {
      inputs: null,
      results: null,
      calculatorCompleted: false,
      simulatorRun: false,
      firstBaselineAnnual: null,
      ecoScore: 0,
      unlockedAchievements: [],
      checklist: { date: null, completed: {}, awarded: {} },
      streak: { current: 0, longest: 0, lastActiveDate: null },
      weeklyChallenge: { completedWeeks: [] }
    };
}

export function loadState() {
    var base = defaultState();
    var parsed = Storage.load();
    if (!parsed) return base;
    try {
      return {
        inputs: parsed.inputs || base.inputs,
        results: parsed.results || base.results,
        calculatorCompleted: !!parsed.calculatorCompleted,
        simulatorRun: !!parsed.simulatorRun,
        firstBaselineAnnual: typeof parsed.firstBaselineAnnual === 'number' ? parsed.firstBaselineAnnual : base.firstBaselineAnnual,
        ecoScore: typeof parsed.ecoScore === 'number' && isFinite(parsed.ecoScore) ? parsed.ecoScore : 0,
        unlockedAchievements: Array.isArray(parsed.unlockedAchievements) ? parsed.unlockedAchievements : [],
        checklist: Object.assign({}, base.checklist, parsed.checklist || {}),
        streak: Object.assign({}, base.streak, parsed.streak || {}),
        weeklyChallenge: Object.assign({}, base.weeklyChallenge, parsed.weeklyChallenge || {})
      };
    } catch (e) {
      return base;
    }
}

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

export function computeFootprint(values) {
    var f = Data.EMISSION_FACTORS;
    var vehicleFactor = f.transportation.vehicles[values.vehicleType];
    if (typeof vehicleFactor !== 'number') vehicleFactor = 0;

    var transportationAnnual =
      (values.commuteKmPerDay * vehicleFactor * 365) +
      (values.transitKmPerWeek * f.transportation.publicTransit * 52) +
      (values.flightsShortHaulPerYear * f.transportation.flightShortHaul) +
      (values.flightsLongHaulPerYear * f.transportation.flightLongHaul);

    var renewableShare = Utils.clamp(values.renewablePercent, 0, 100) / 100;
    var electricityAnnual = values.electricityKwhPerMonth * 12 * f.electricity.gridFactor * (1 - renewableShare);

    var dietFactor = f.diet[values.dietType];
    if (typeof dietFactor !== 'number') dietFactor = f.diet.mediumMeat;
    var dietAnnual = dietFactor * 365;

    var recycledShare = Utils.clamp(values.recycledPercent, 0, 100) / 100;
    var wasteEffectiveFactor = (f.waste.landfill * (1 - recycledShare)) + (f.waste.recycledOrComposted * recycledShare);
    var wasteAnnual = values.wasteKgPerWeek * 52 * wasteEffectiveFactor;

    var waterFactor = f.water.coldSupply + (values.waterHeatedMostly ? f.water.heatedExtra : 0);
    var waterAnnual = values.waterLitersPerDay * 365 * waterFactor;

    var byCategoryAnnual = {
      transportation: Math.max(0, transportationAnnual),
      electricity: Math.max(0, electricityAnnual),
      diet: Math.max(0, dietAnnual),
      waste: Math.max(0, wasteAnnual),
      water: Math.max(0, waterAnnual)
    };

    var annual = Data.CATEGORY_ORDER.reduce(function (sum, key) {
      return sum + byCategoryAnnual[key];
    }, 0);

    return {
      annual: annual,
      monthly: annual / 12,
      daily: annual / 365,
      byCategoryAnnual: byCategoryAnnual
    };
}

export const Scoring = {
    computeScore: function (annual) {
      var bounds = Data.SCORE_BOUNDS;
      var raw = 100 - (((annual - bounds.best) / (bounds.worst - bounds.best)) * 100);
      return Math.round(Utils.clamp(raw, 0, 100));
    },
    getRating: function (score) {
      var thresholds = Data.RATING_THRESHOLDS;
      for (var i = 0; i < thresholds.length; i++) {
        if (score >= thresholds[i].min) return thresholds[i];
      }
      return thresholds[thresholds.length - 1];
    },
    compareToGlobalAverage: function (annual) {
      var avg = Data.BENCHMARKS.globalAverageAnnualKg;
      var diffPercent = ((avg - annual) / avg) * 100;
      var below = diffPercent >= 0;
      return {
        below: below,
        percent: Math.round(Math.abs(diffPercent)),
        text: Math.round(Math.abs(diffPercent)) + '% ' + (below ? 'below' : 'above') + ' the global average'
      };
    }
};

export const Insights = {
    generate: function (values, byCategoryAnnual) {
      var f = Data.EMISSION_FACTORS;
      var annualTotal = Data.CATEGORY_ORDER.reduce(function (sum, k) { return sum + byCategoryAnnual[k]; }, 0);

      var topCategory = Data.CATEGORY_ORDER.reduce(function (best, key) {
        return byCategoryAnnual[key] > byCategoryAnnual[best] ? key : best;
      }, Data.CATEGORY_ORDER[0]);

      var topShare = annualTotal > 0 ? (byCategoryAnnual[topCategory] / annualTotal) * 100 : 0;

      var candidates = [];

      var transportSavings = byCategoryAnnual.transportation * 0.20;
      candidates.push({
        category: 'transportation',
        savingsKg: transportSavings,
        text: 'Combining trips, shifting some drives to public transit, and driving more smoothly could realistically cut transportation emissions by about 20%.'
      });

      var electricityAt100 = values.electricityKwhPerMonth * 12 * f.electricity.gridFactor * 0;
      var electricitySavings = byCategoryAnnual.electricity - electricityAt100;
      candidates.push({
        category: 'electricity',
        savingsKg: electricitySavings,
        text: 'Moving to a 100% renewable electricity plan would remove essentially all of the grid-related emissions in this category.'
      });

      var dietSavings = 0;
      var dietText = 'Your diet is already in the lowest-impact tiers, so no further rule-based saving was identified here.';
      if (values.dietType !== 'vegetarian' && values.dietType !== 'vegan') {
        var currentDietFactor = f.diet[values.dietType];
        var vegetarianFactor = f.diet.vegetarian;
        dietSavings = Math.max(0, (currentDietFactor - vegetarianFactor) * 365);
        dietText = 'Shifting toward a vegetarian pattern would lower the daily emission factor behind your meals.';
      }
      candidates.push({ category: 'diet', savingsKg: dietSavings, text: dietText });

      var recycledAt90Factor = (f.waste.landfill * 0.10) + (f.waste.recycledOrComposted * 0.90);
      var wasteAt90 = values.wasteKgPerWeek * 52 * recycledAt90Factor;
      var wasteSavings = Math.max(0, byCategoryAnnual.waste - wasteAt90);
      candidates.push({
        category: 'waste',
        savingsKg: wasteSavings,
        text: 'Raising your recycled or composted share to about 90% would divert most of this waste away from higher-emission landfill processing.'
      });

      var waterSavings = byCategoryAnnual.water * 0.15;
      candidates.push({
        category: 'water',
        savingsKg: waterSavings,
        text: 'Shorter showers and only running full dishwasher or laundry loads could cut water-related emissions by about 15%.'
      });

      candidates.sort(function (a, b) { return b.savingsKg - a.savingsKg; });
      var recommendations = candidates.filter(function (c) { return c.savingsKg > 0.5; }).slice(0, 3);
      var totalPotentialSavings = recommendations.reduce(function (sum, c) { return sum + c.savingsKg; }, 0);

      return {
        topCategory: topCategory,
        topShare: topShare,
        annualTotal: annualTotal,
        recommendations: recommendations,
        totalPotentialSavings: totalPotentialSavings
      };
    }
};

export const Simulator = {
    run: function (values, byCategoryAnnual, sliders) {
      var f = Data.EMISSION_FACTORS;
      var baselineTotal = Data.CATEGORY_ORDER.reduce(function (sum, k) { return sum + byCategoryAnnual[k]; }, 0);

      var newTransportation = byCategoryAnnual.transportation * (1 - sliders.driveLessPercent / 100);
      var newElectricity = values.electricityKwhPerMonth * 12 * f.electricity.gridFactor * (1 - sliders.renewableTarget / 100);

      var dietFactor = f.diet[sliders.dietTarget];
      if (typeof dietFactor !== 'number') dietFactor = f.diet[values.dietType];
      var newDiet = dietFactor * 365;

      var newWaste = byCategoryAnnual.waste * (1 - sliders.wasteReducePercent / 100);
      var newWater = byCategoryAnnual.water;

      var newTotal = newTransportation + newElectricity + newDiet + newWaste + newWater;
      var savedKg = baselineTotal - newTotal;

      return {
        baselineTotal: baselineTotal,
        newTotal: Math.max(0, newTotal),
        savedKg: savedKg,
        equivalentTrees: savedKg / Data.CONVERSIONS.kgAbsorbedPerTreePerYear,
        equivalentKm: savedKg / Data.CONVERSIONS.kgPerKmDrivenAveragePetrolCar
      };
    }
};

export const Gamification = {
    getLevel: function (ecoScore) {
      var levels = Data.LEVELS;
      var current = levels[0];
      for (var i = 0; i < levels.length; i++) {
        if (ecoScore >= levels[i].min) current = levels[i];
      }
      return current;
    },
    getCurrentChallenge: function () {
      var info = Utils.getISOWeekInfo(new Date());
      var weekKey = info.isoYear + '-W' + Utils.pad2(info.week);
      var index = info.week % Data.CHALLENGES.length;
      return { weekKey: weekKey, challenge: Data.CHALLENGES[index] };
    },
    addPoints: function (state, amount) {
      state.ecoScore = Math.max(0, state.ecoScore + amount);
    },
    allChecklistItemsCompletedToday: function (state) {
      return Data.CHECKLIST_ITEMS.every(function (item) {
        return !!state.checklist.completed[item.id];
      });
    },
    buildMetrics: function (state) {
      return {
        calculatorCompleted: !!state.calculatorCompleted,
        simulatorRun: !!state.simulatorRun,
        annualTotal: state.results ? state.results.annual : Number.POSITIVE_INFINITY,
        dietType: state.inputs ? state.inputs.dietType : null,
        renewablePercent: state.inputs ? state.inputs.renewablePercent : -1,
        recycledPercent: state.inputs ? state.inputs.recycledPercent : -1,
        currentStreak: state.streak.current,
        weeklyChallengesCompleted: state.weeklyChallenge.completedWeeks.length,
        checklistAllCompletedToday: Gamification.allChecklistItemsCompletedToday(state),
        ecoScore: state.ecoScore
      };
    },
    evaluateComparator: function (metricValue, comparator, threshold) {
      switch (comparator) {
        case 'gte': return typeof metricValue === 'number' && metricValue >= threshold;
        case 'lte': return typeof metricValue === 'number' && metricValue <= threshold;
        case 'boolean': return metricValue === threshold;
        case 'isIn': return Array.isArray(threshold) && threshold.indexOf(metricValue) !== -1;
        default: return false;
      }
    },
    evaluateAchievements: function (state) {
      var metrics = Gamification.buildMetrics(state);
      var newlyUnlocked = [];
      Data.ACHIEVEMENTS.forEach(function (achievement) {
        if (state.unlockedAchievements.indexOf(achievement.id) !== -1) return;
        var satisfied = Gamification.evaluateComparator(metrics[achievement.metric], achievement.comparator, achievement.threshold);
        if (satisfied) {
          state.unlockedAchievements.push(achievement.id);
          Gamification.addPoints(state, Data.ACTION_POINTS.achievementUnlock);
          newlyUnlocked.push(achievement);
        }
      });
      return newlyUnlocked;
    },
    ensureChecklistFresh: function (state) {
      var today = Utils.getTodayKey();
      if (state.checklist.date !== today) {
        state.checklist = { date: today, completed: {}, awarded: {} };
      }
    },
    checkStreakBreak: function (state) {
      var today = Utils.getTodayKey();
      var yesterday = Utils.getYesterdayKey();
      if (state.streak.lastActiveDate && state.streak.lastActiveDate !== today && state.streak.lastActiveDate !== yesterday) {
        state.streak.current = 0;
      }
    },
    updateStreakForToday: function (state) {
      var today = Utils.getTodayKey();
      var yesterday = Utils.getYesterdayKey();
      if (state.streak.lastActiveDate === today) return;
      if (state.streak.lastActiveDate === yesterday) {
        state.streak.current += 1;
      } else {
        state.streak.current = 1;
      }
      state.streak.lastActiveDate = today;
      state.streak.longest = Math.max(state.streak.longest, state.streak.current);
    },
    toggleChecklistItem: function (state, itemId, checked) {
      var item = Data.CHECKLIST_ITEMS.find(function (i) { return i.id === itemId; });
      if (!item) return null;
      Gamification.ensureChecklistFresh(state);
      state.checklist.completed[itemId] = checked;
      var pointsEarned = 0;
      if (checked && !state.checklist.awarded[itemId]) {
        state.checklist.awarded[itemId] = true;
        Gamification.addPoints(state, item.points);
        pointsEarned = item.points;
        Gamification.updateStreakForToday(state);
      }
      return { item: item, pointsEarned: pointsEarned };
    },
    completeCurrentChallenge: function (state) {
      var current = Gamification.getCurrentChallenge();
      if (state.weeklyChallenge.completedWeeks.indexOf(current.weekKey) !== -1) {
        return { alreadyDone: true, challenge: current.challenge };
      }
      state.weeklyChallenge.completedWeeks.push(current.weekKey);
      Gamification.addPoints(state, current.challenge.points);
      return { alreadyDone: false, challenge: current.challenge };
    }
};
