(function() {
'use strict';
window.ContourApp = window.ContourApp || {};
var Data = window.CarbonData;

/* --- js/utils.js --- */
window.ContourApp.Utils = {

    qs: function (selector, scope) {
      return (scope || document).querySelector(selector);
    },
    qsa: function (selector, scope) {
      return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    },
    clamp: function (value, min, max) {
      if (!isFinite(value)) return min;
      return Math.min(max, Math.max(min, value));
    },
    formatNumber: function (value, decimals) {
      var d = typeof decimals === 'number' ? decimals : 0;
      if (!isFinite(value)) value = 0;
      var rounded = Utils.clamp(value, 0, Number.MAX_SAFE_INTEGER);
      try {
        return rounded.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
      } catch (e) {
        return rounded.toFixed(d);
      }
    },
    formatSigned: function (value, decimals) {
      var d = typeof decimals === 'number' ? decimals : 0;
      var sign = value > 0 ? '+' : value < 0 ? '\u2212' : '';
      return sign + Utils.formatNumber(Math.abs(value), d);
    },
    createEl: function (tag, options, children) {
      var el = document.createElement(tag);
      options = options || {};
      if (options.className) el.className = options.className;
      if (options.text !== undefined) el.textContent = options.text;
      if (options.attrs) {
        Object.keys(options.attrs).forEach(function (key) {
          el.setAttribute(key, options.attrs[key]);
        });
      }
      if (options.props) {
        Object.keys(options.props).forEach(function (key) {
          el[key] = options.props[key];
        });
      }
      (children || []).forEach(function (child) {
        if (child) el.appendChild(child);
      });
      return el;
    },
    clearChildren: function (el) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    },
    pad2: function (n) {
      return n < 10 ? '0' + n : String(n);
    },
    getDateKey: function (date) {
      var y = date.getFullYear();
      var m = Utils.pad2(date.getMonth() + 1);
      var d = Utils.pad2(date.getDate());
      return y + '-' + m + '-' + d;
    },
    getTodayKey: function () {
      return Utils.getDateKey(new Date());
    },
    getYesterdayKey: function () {
      var d = new Date();
      d.setDate(d.getDate() - 1);
      return Utils.getDateKey(d);
    },
    getISOWeekInfo: function (date) {
      var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      var dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      var week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return { isoYear: d.getUTCFullYear(), week: week };
    }
  };

/* --- js/storage.js --- */
window.ContourApp.STORAGE_KEY = 'contourCarbonAppState_v1';
window.ContourApp.Storage = {

    load: function () {
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
    save: function (state) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
      } catch (e) {
        Toast.show('Your progress could not be saved on this device.', 'error');
        return false;
      }
    },
    clear: function () {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        return true;
      } catch (e) {
        return false;
      }
    }
  };

/* --- js/state.js --- */
function defaultState() {
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

  function loadState() {
    var base = defaultState();
    var parsed = window.ContourApp.Storage.load();
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

  window.ContourApp.state = defaultState();
window.ContourApp.defaultState = defaultState;
window.ContourApp.loadState = loadState;


/* --- js/calculator.js --- */
window.ContourApp.window.ContourApp.NUMBER_FIELDS = [
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

  function validateCalculatorForm(form) {
    var values = {};
    var hasError = false;
    var firstInvalidId = null;

    window.ContourApp.NUMBER_FIELDS.forEach(function (field) {
      var el = window.ContourApp.Utils.qs('#' + field.id, form);
      var errorEl = window.ContourApp.Utils.qs('#' + field.id + '-error', form);
      var raw = el.value.trim();
      var message = '';

      if (raw === '') {
        message = field.label + ' is required.';
      } else {
        var num = Number(raw);
        if (!isFinite(num)) {
          message = 'Enter a valid number.';
        } else if (num < field.min || num > field.max) {
          message = 'Enter a value between ' + field.min + ' and ' + field.max + '.';
        }
      }

      if (message) {
        hasError = true;
        el.setAttribute('aria-invalid', 'true');
        if (errorEl) errorEl.textContent = message;
        if (!firstInvalidId) firstInvalidId = field.id;
      } else {
        el.setAttribute('aria-invalid', 'false');
        if (errorEl) errorEl.textContent = '';
        values[field.id] = Number(raw);
      }
    });

    values.vehicleType = window.ContourApp.Utils.qs('#vehicleType', form).value;
    values.dietType = window.ContourApp.Utils.qs('#dietType', form).value;
    values.waterHeatedMostly = window.ContourApp.Utils.qs('#waterHeatedMostly', form).checked;

    return { valid: !hasError, values: values, firstInvalidId: firstInvalidId };
  }

  function computeFootprint(values) {
    var f = Data.EMISSION_FACTORS;

    var vehicleFactor = f.transportation.vehicles[values.vehicleType];
    if (typeof vehicleFactor !== 'number') vehicleFactor = 0;

    var transportationAnnual =
      (values.commuteKmPerDay * vehicleFactor * 365) +
      (values.transitKmPerWeek * f.transportation.publicTransit * 52) +
      (values.flightsShortHaulPerYear * f.transportation.flightShortHaul) +
      (values.flightsLongHaulPerYear * f.transportation.flightLongHaul);

    var renewableShare = window.ContourApp.Utils.clamp(values.renewablePercent, 0, 100) / 100;
    var electricityAnnual = values.electricityKwhPerMonth * 12 * f.electricity.gridFactor * (1 - renewableShare);

    var dietFactor = f.diet[values.dietType];
    if (typeof dietFactor !== 'number') dietFactor = f.diet.mediumMeat;
    var dietAnnual = dietFactor * 365;

    var recycledShare = window.ContourApp.Utils.clamp(values.recycledPercent, 0, 100) / 100;
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
window.ContourApp.validateCalculatorForm = validateCalculatorForm;
window.ContourApp.computeFootprint = computeFootprint;


/* --- js/insights.js --- */
window.ContourApp.Scoring = {

    computeScore: function (annual) {
      var bounds = Data.SCORE_BOUNDS;
      var raw = 100 - (((annual - bounds.best) / (bounds.worst - bounds.best)) * 100);
      return Math.round(window.ContourApp.Utils.clamp(raw, 0, 100));
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
window.ContourApp.Insights = {

    /**
     * Every recommendation below is derived from one explicit, named rule
     * applied to the user's own numbers — there is no opaque model involved.
     */
    generate: function (values, byCategoryAnnual) {
      var f = Data.EMISSION_FACTORS;
      var annualTotal = Data.CATEGORY_ORDER.reduce(function (sum, k) { return sum + byCategoryAnnual[k]; }, 0);

      var topCategory = Data.CATEGORY_ORDER.reduce(function (best, key) {
        return byCategoryAnnual[key] > byCategoryAnnual[best] ? key : best;
      }, Data.CATEGORY_ORDER[0]);

      var topShare = annualTotal > 0 ? (byCategoryAnnual[topCategory] / annualTotal) * 100 : 0;

      var candidates = [];

      // Rule 1 — Transportation: assume a 20% cut from trip-combining / transit shift / smoother driving.
      var transportSavings = byCategoryAnnual.transportation * 0.20;
      candidates.push({
        category: 'transportation',
        savingsKg: transportSavings,
        text: 'Combining trips, shifting some drives to public transit, and driving more smoothly could realistically cut transportation emissions by about 20%.'
      });

      // Rule 2 — Electricity: assume moving to 100% renewable supply.
      var electricityAt100 = values.electricityKwhPerMonth * 12 * f.electricity.gridFactor * 0;
      var electricitySavings = byCategoryAnnual.electricity - electricityAt100;
      candidates.push({
        category: 'electricity',
        savingsKg: electricitySavings,
        text: 'Moving to a 100% renewable electricity plan would remove essentially all of the grid-related emissions in this category.'
      });

      // Rule 3 — Diet: assume a step down to vegetarian, if not already vegetarian/vegan.
      var dietSavings = 0;
      var dietText = 'Your diet is already in the lowest-impact tiers, so no further rule-based saving was identified here.';
      if (values.dietType !== 'vegetarian' && values.dietType !== 'vegan') {
        var currentDietFactor = f.diet[values.dietType];
        var vegetarianFactor = f.diet.vegetarian;
        dietSavings = Math.max(0, (currentDietFactor - vegetarianFactor) * 365);
        dietText = 'Shifting toward a vegetarian pattern would lower the daily emission factor behind your meals.';
      }
      candidates.push({ category: 'diet', savingsKg: dietSavings, text: dietText });

      // Rule 4 — Waste: assume raising the recycled/composted share to 90%.
      var recycledAt90Factor = (f.waste.landfill * 0.10) + (f.waste.recycledOrComposted * 0.90);
      var wasteAt90 = values.wasteKgPerWeek * 52 * recycledAt90Factor;
      var wasteSavings = Math.max(0, byCategoryAnnual.waste - wasteAt90);
      candidates.push({
        category: 'waste',
        savingsKg: wasteSavings,
        text: 'Raising your recycled or composted share to about 90% would divert most of this waste away from higher-emission landfill processing.'
      });

      // Rule 5 — Water: assume a 15% cut from shorter showers / full loads.
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

/* --- js/simulator.js --- */
window.ContourApp.Simulator = {

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

/* --- js/gamification.js --- */
window.ContourApp.Gamification = {

    getLevel: function (ecoScore) {
      var levels = Data.LEVELS;
      var current = levels[0];
      for (var i = 0; i < levels.length; i++) {
        if (ecoScore >= levels[i].min) current = levels[i];
      }
      return current;
    },
    addPoints: function (amount) {
      window.ContourApp.state.ecoScore = Math.max(0, window.ContourApp.state.ecoScore + amount);
    },
    allChecklistItemsCompletedToday: function () {
      return Data.CHECKLIST_ITEMS.every(function (item) {
        return !!window.ContourApp.state.checklist.completed[item.id];
      });
    },
    buildMetrics: function () {
      return {
        calculatorCompleted: !!window.ContourApp.state.calculatorCompleted,
        simulatorRun: !!window.ContourApp.state.simulatorRun,
        annualTotal: window.ContourApp.state.results ? window.ContourApp.state.results.annual : Number.POSITIVE_INFINITY,
        dietType: window.ContourApp.state.inputs ? window.ContourApp.state.inputs.dietType : null,
        renewablePercent: window.ContourApp.state.inputs ? window.ContourApp.state.inputs.renewablePercent : -1,
        recycledPercent: window.ContourApp.state.inputs ? window.ContourApp.state.inputs.recycledPercent : -1,
        currentStreak: window.ContourApp.state.streak.current,
        weeklyChallengesCompleted: window.ContourApp.state.weeklyChallenge.completedWeeks.length,
        checklistAllCompletedToday: window.ContourApp.Gamification.allChecklistItemsCompletedToday(),
        ecoScore: window.ContourApp.state.ecoScore
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
    evaluateAchievements: function () {
      var metrics = window.ContourApp.Gamification.buildMetrics();
      var newlyUnlocked = [];
      Data.ACHIEVEMENTS.forEach(function (achievement) {
        if (window.ContourApp.state.unlockedAchievements.indexOf(achievement.id) !== -1) return;
        var satisfied = window.ContourApp.Gamification.evaluateComparator(metrics[achievement.metric], achievement.comparator, achievement.threshold);
        if (satisfied) {
          window.ContourApp.state.unlockedAchievements.push(achievement.id);
          window.ContourApp.Gamification.addPoints(Data.ACTION_POINTS.achievementUnlock);
          newlyUnlocked.push(achievement);
        }
      });
      newlyUnlocked.forEach(function (achievement) {
        window.ContourApp.Toast.show('Badge unlocked: ' + achievement.title + ' (+' + Data.ACTION_POINTS.achievementUnlock + ' pts)');
      });
      return newlyUnlocked;
    },
    ensureChecklistFresh: function () {
      var today = window.ContourApp.Utils.getTodayKey();
      if (window.ContourApp.state.checklist.date !== today) {
        window.ContourApp.state.checklist = { date: today, completed: {}, awarded: {} };
      }
    },
    checkStreakBreak: function () {
      var today = window.ContourApp.Utils.getTodayKey();
      var yesterday = window.ContourApp.Utils.getYesterdayKey();
      if (window.ContourApp.state.streak.lastActiveDate && window.ContourApp.state.streak.lastActiveDate !== today && window.ContourApp.state.streak.lastActiveDate !== yesterday) {
        window.ContourApp.state.streak.current = 0;
      }
    },
    updateStreakForToday: function () {
      var today = window.ContourApp.Utils.getTodayKey();
      var yesterday = window.ContourApp.Utils.getYesterdayKey();
      if (window.ContourApp.state.streak.lastActiveDate === today) return;
      if (window.ContourApp.state.streak.lastActiveDate === yesterday) {
        window.ContourApp.state.streak.current += 1;
      } else {
        window.ContourApp.state.streak.current = 1;
      }
      window.ContourApp.state.streak.lastActiveDate = today;
      window.ContourApp.state.streak.longest = Math.max(window.ContourApp.state.streak.longest, window.ContourApp.state.streak.current);
    },
    toggleChecklistItem: function (itemId, checked) {
      var item = Data.CHECKLIST_ITEMS.find(function (i) { return i.id === itemId; });
      if (!item) return;
      window.ContourApp.state.checklist.completed[itemId] = checked;
      if (checked && !window.ContourApp.state.checklist.awarded[itemId]) {
        window.ContourApp.state.checklist.awarded[itemId] = true;
        window.ContourApp.Gamification.addPoints(item.points);
        window.ContourApp.Toast.show('+' + item.points + ' pts \u2014 ' + item.label);
        window.ContourApp.Gamification.updateStreakForToday();
      }
    },
    getCurrentChallenge: function () {
      var info = window.ContourApp.Utils.getISOWeekInfo(new Date());
      var weekKey = info.isoYear + '-W' + window.ContourApp.Utils.pad2(info.week);
      var index = info.week % Data.CHALLENGES.length;
      return { weekKey: weekKey, challenge: Data.CHALLENGES[index] };
    },
    completeCurrentChallenge: function () {
      var current = window.ContourApp.Gamification.getCurrentChallenge();
      if (window.ContourApp.state.weeklyChallenge.completedWeeks.indexOf(current.weekKey) !== -1) {
        return { alreadyDone: true, challenge: current.challenge };
      }
      window.ContourApp.state.weeklyChallenge.completedWeeks.push(current.weekKey);
      window.ContourApp.Gamification.addPoints(current.challenge.points);
      window.ContourApp.Toast.show('+' + current.challenge.points + ' pts \u2014 ' + current.challenge.title + ' complete!');
      return { alreadyDone: false, challenge: current.challenge };
    }
  };

/* --- js/ui.js --- */
window.ContourApp.Toast = {

    region: null,
    show: function (message, type) {
      try {
        if (!window.ContourApp.Toast.region) window.ContourApp.Toast.region = document.getElementById('toastRegion');
        if (!window.ContourApp.Toast.region) return;
        var toast = window.ContourApp.Utils.createEl('div', {
          className: 'toast' + (type === 'error' ? ' toast--error' : ''),
          text: String(message),
          attrs: { role: 'status' }
        });
        window.ContourApp.Toast.region.appendChild(toast);
        while (window.ContourApp.Toast.region.children.length > 4) {
          window.ContourApp.Toast.region.removeChild(window.ContourApp.Toast.region.firstElementChild);
        }
        window.setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 4500);
      } catch (e) {
        /* Never let a notification failure break the app. */
      }
    }
  };
var selectedTipCategory = Data.CATEGORY_ORDER[0];
  var simulatorInitialized = false;
window.ContourApp.El = {}; // cached elements, populated in cacheElements()

  function cacheElements() {
    [
      'heroAnnualValue', 'heroStatHint',
      'calculatorForm', 'calculatorSummary', 'summaryDaily', 'summaryMonthly', 'summaryAnnual', 'formStatus',
      'insightsEmptyState', 'insightsContent', 'insightTopCategory', 'insightTopCategoryDetail',
      'recommendationList', 'insightTotalSavings', 'insightTotalSavingsDetail',
      'simulatorLocked', 'simulatorContent', 'simDriveLess', 'simDriveLessOutput',
      'simRenewableTarget', 'simRenewableTargetOutput', 'simDietTarget', 'simWasteReduce', 'simWasteReduceOutput',
      'simNewAnnual', 'simDeltaText', 'simSavedKg', 'simEquivalentTrees', 'simEquivalentKm', 'resetSimulatorBtn',
      'dashboardEmptyState', 'dashboardContent', 'dailyTotal', 'monthlyTotal', 'annualTotal', 'vsAverage',
      'scoreRingProgress', 'scoreRingLabel', 'carbonScoreValue', 'sustainabilityRating',
      'goalDescription', 'goalProgressBar', 'goalProgressCaption',
      'ecoScoreValue', 'ecoLevelLabel', 'streakValue', 'longestStreakValue',
      'dailyChecklist', 'weeklyChallengeCard', 'challengeTitle', 'challengeDescription', 'challengePoints',
      'completeChallengeBtn', 'challengeStatus', 'badgesGrid',
      'tipsTablist', 'tipsPanel', 'learnIntro',
      'navToggle', 'primaryNav', 'resetCalculatorBtn', 'resetAllDataBtn'
    ].forEach(function (id) {
      El[id] = document.getElementById(id);
    });
  }

  function populateFormFromState() {
    if (!window.ContourApp.state.inputs || !window.ContourApp.El.calculatorForm) return;
    var inputs = window.ContourApp.state.inputs;
    window.ContourApp.NUMBER_FIELDS.forEach(function (field) {
      var el = window.ContourApp.Utils.qs('#' + field.id, window.ContourApp.El.calculatorForm);
      if (el && typeof inputs[field.id] === 'number') el.value = inputs[field.id];
    });
    var vehicleEl = window.ContourApp.Utils.qs('#vehicleType', window.ContourApp.El.calculatorForm);
    if (vehicleEl && inputs.vehicleType) vehicleEl.value = inputs.vehicleType;
    var dietEl = window.ContourApp.Utils.qs('#dietType', window.ContourApp.El.calculatorForm);
    if (dietEl && inputs.dietType) dietEl.value = inputs.dietType;
    var waterEl = window.ContourApp.Utils.qs('#waterHeatedMostly', window.ContourApp.El.calculatorForm);
    if (waterEl) waterEl.checked = !!inputs.waterHeatedMostly;
  }

  function renderHero() {
    if (window.ContourApp.state.results) {
      window.ContourApp.El.heroAnnualValue.textContent = window.ContourApp.Utils.formatNumber(window.ContourApp.state.results.annual, 0);
      window.ContourApp.El.heroStatHint.textContent = 'Updated from your most recent calculation.';
    } else {
      window.ContourApp.El.heroAnnualValue.textContent = '\u2014';
      window.ContourApp.El.heroStatHint.textContent = 'Fill in the calculator below to see your number.';
    }
  }

  function renderCalculatorSummary() {
    if (!window.ContourApp.state.results) {
      window.ContourApp.El.calculatorSummary.hidden = true;
      return;
    }
    window.ContourApp.El.calculatorSummary.hidden = false;
    window.ContourApp.El.summaryDaily.textContent = window.ContourApp.Utils.formatNumber(window.ContourApp.state.results.daily, 1);
    window.ContourApp.El.summaryMonthly.textContent = window.ContourApp.Utils.formatNumber(window.ContourApp.state.results.monthly, 0);
    window.ContourApp.El.summaryAnnual.textContent = window.ContourApp.Utils.formatNumber(window.ContourApp.state.results.annual, 0);
  }

  function renderInsights() {
    if (!window.ContourApp.state.results || !window.ContourApp.state.inputs) {
      window.ContourApp.El.insightsEmptyState.hidden = false;
      window.ContourApp.El.insightsContent.hidden = true;
      return;
    }
    window.ContourApp.El.insightsEmptyState.hidden = true;
    window.ContourApp.El.insightsContent.hidden = false;

    var insight = window.ContourApp.Insights.generate(window.ContourApp.state.inputs, window.ContourApp.state.results.byCategoryAnnual);
    var topLabel = Data.CATEGORY_ICONS[insight.topCategory] + ' ' + Data.CATEGORY_LABELS[insight.topCategory];
    window.ContourApp.El.insightTopCategory.textContent = topLabel;
    window.ContourApp.El.insightTopCategoryDetail.textContent =
      Data.CATEGORY_LABELS[insight.topCategory] + ' makes up about ' + Math.round(insight.topShare) +
      '% of your annual footprint \u2014 the single biggest lever you have right now.';

    window.ContourApp.Utils.clearChildren(window.ContourApp.El.recommendationList);
    insight.recommendations.forEach(function (rec) {
      var strong = window.ContourApp.Utils.createEl('strong', { text: Data.CATEGORY_LABELS[rec.category] + ': ' });
      var rest = document.createTextNode(rec.text + ' Estimated saving: ~' + window.ContourApp.Utils.formatNumber(rec.savingsKg, 0) + ' kg CO2e/year.');
      var li = window.ContourApp.Utils.createEl('li', {}, [strong, rest]);
      window.ContourApp.El.recommendationList.appendChild(li);
    });
    if (insight.recommendations.length === 0) {
      window.ContourApp.El.recommendationList.appendChild(window.ContourApp.Utils.createEl('li', { text: 'No high-impact rule fired for your current inputs \u2014 your habits already look efficient across the board.' }));
    }

    window.ContourApp.El.insightTotalSavings.textContent = window.ContourApp.Utils.formatNumber(insight.totalPotentialSavings, 0);
    window.ContourApp.El.insightTotalSavingsDetail.textContent =
      'That is roughly ' + window.ContourApp.Utils.formatNumber(insight.totalPotentialSavings / Data.CONVERSIONS.kgAbsorbedPerTreePerYear, 0) +
      ' trees\u2019 worth of yearly CO2 absorption, just from the recommendations above.';
  }

  function renderSimulatorGate() {
    var unlocked = !!window.ContourApp.state.results;
    window.ContourApp.El.simulatorLocked.hidden = unlocked;
    window.ContourApp.El.simulatorContent.hidden = !unlocked;
    if (unlocked && !simulatorInitialized) {
      window.ContourApp.El.simDriveLess.value = 0;
      window.ContourApp.El.simRenewableTarget.value = 0;
      window.ContourApp.El.simDietTarget.value = window.ContourApp.state.inputs.dietType;
      window.ContourApp.El.simWasteReduce.value = 0;
      simulatorInitialized = true;
      updateSimulatorOutputs(false);
    }
  }

  function updateSimulatorOutputs(markRun) {
    if (!window.ContourApp.state.results || !window.ContourApp.state.inputs) return;
    var sliders = {
      driveLessPercent: Number(window.ContourApp.El.simDriveLess.value),
      renewableTarget: Number(window.ContourApp.El.simRenewableTarget.value),
      dietTarget: window.ContourApp.El.simDietTarget.value,
      wasteReducePercent: Number(window.ContourApp.El.simWasteReduce.value)
    };

    window.ContourApp.El.simDriveLessOutput.textContent = sliders.driveLessPercent + '%';
    window.ContourApp.El.simRenewableTargetOutput.textContent = sliders.renewableTarget + '%';
    window.ContourApp.El.simWasteReduceOutput.textContent = sliders.wasteReducePercent + '%';
    window.ContourApp.El.simDriveLess.setAttribute('aria-valuetext', sliders.driveLessPercent + '% less driving');
    window.ContourApp.El.simRenewableTarget.setAttribute('aria-valuetext', sliders.renewableTarget + '% renewable electricity');
    window.ContourApp.El.simWasteReduce.setAttribute('aria-valuetext', sliders.wasteReducePercent + '% less waste');

    var result = window.ContourApp.Simulator.run(window.ContourApp.state.inputs, window.ContourApp.state.results.byCategoryAnnual, sliders);
    window.ContourApp.El.simNewAnnual.textContent = window.ContourApp.Utils.formatNumber(result.newTotal, 0);

    if (Math.abs(result.savedKg) < 0.5) {
      window.ContourApp.El.simDeltaText.textContent = 'No change yet \u2014 move a slider to see the effect.';
    } else if (result.savedKg > 0) {
      window.ContourApp.El.simDeltaText.textContent = 'This scenario saves ' + window.ContourApp.Utils.formatNumber(result.savedKg, 0) + ' kg CO2e/year versus your baseline.';
    } else {
      window.ContourApp.El.simDeltaText.textContent = 'This scenario adds ' + window.ContourApp.Utils.formatNumber(Math.abs(result.savedKg), 0) + ' kg CO2e/year versus your baseline.';
    }

    window.ContourApp.El.simSavedKg.textContent = window.ContourApp.Utils.formatSigned(result.savedKg, 0);
    window.ContourApp.El.simEquivalentTrees.textContent = window.ContourApp.Utils.formatSigned(result.equivalentTrees, 0);
    window.ContourApp.El.simEquivalentKm.textContent = window.ContourApp.Utils.formatSigned(result.equivalentKm, 0);

    if (markRun && !window.ContourApp.state.simulatorRun) {
      window.ContourApp.state.simulatorRun = true;
      window.ContourApp.Gamification.addPoints(Data.ACTION_POINTS.simulatorRun);
      window.ContourApp.Toast.show('+' + Data.ACTION_POINTS.simulatorRun + ' pts \u2014 scenario tested');
      window.ContourApp.Gamification.evaluateAchievements();
      window.ContourApp.Storage.save(window.ContourApp.state);
      renderGamification();
      renderBadges();
    }
  }

  function renderDashboard() {
    if (!window.ContourApp.state.results) {
      window.ContourApp.El.dashboardEmptyState.hidden = false;
      window.ContourApp.El.dashboardContent.hidden = true;
      return;
    }
    window.ContourApp.El.dashboardEmptyState.hidden = true;
    window.ContourApp.El.dashboardContent.hidden = false;

    window.ContourApp.El.dailyTotal.textContent = window.ContourApp.Utils.formatNumber(window.ContourApp.state.results.daily, 1);
    window.ContourApp.El.monthlyTotal.textContent = window.ContourApp.Utils.formatNumber(window.ContourApp.state.results.monthly, 0);
    window.ContourApp.El.annualTotal.textContent = window.ContourApp.Utils.formatNumber(window.ContourApp.state.results.annual, 0);

    var comparison = window.ContourApp.Scoring.compareToGlobalAverage(window.ContourApp.state.results.annual);
    window.ContourApp.El.vsAverage.textContent = comparison.text;

    var score = window.ContourApp.Scoring.computeScore(window.ContourApp.state.results.annual);
    var rating = window.ContourApp.Scoring.getRating(score);
    var circumference = 2 * Math.PI * 78;
    window.ContourApp.El.scoreRingProgress.style.strokeDasharray = String(circumference);
    window.ContourApp.El.scoreRingProgress.style.strokeDashoffset = String(circumference * (1 - score / 100));
    window.ContourApp.El.carbonScoreValue.textContent = String(score);
    window.ContourApp.El.scoreRingLabel.setAttribute('aria-label', 'Carbon score ' + score + ' out of 100, rated ' + rating.label);
    window.ContourApp.El.sustainabilityRating.textContent = rating.label;
    window.ContourApp.El.sustainabilityRating.className = 'score-panel__rating ' + rating.className;

    renderGoalPanel();

    // Render chart
    var cat = window.ContourApp.state.results.byCategoryAnnual;
    var total = window.ContourApp.state.results.annual;
    
    var tShare = (cat.transportation / total) * 100;
    var eShare = (cat.electricity / total) * 100;
    var dShare = (cat.diet / total) * 100;
    var wShare = (cat.waste / total) * 100;
    var waShare = (cat.water / total) * 100;

    window.ContourApp.El.breakdownChart = document.getElementById('breakdownChart');
    window.ContourApp.El.chartLegend = document.getElementById('chartLegend');
    
    if (window.ContourApp.El.breakdownChart) {
      document.getElementById('chartTransport').style.setProperty('--share', tShare + '%');
      document.getElementById('chartElectricity').style.setProperty('--share', eShare + '%');
      document.getElementById('chartDiet').style.setProperty('--share', dShare + '%');
      document.getElementById('chartWaste').style.setProperty('--share', wShare + '%');
      document.getElementById('chartWater').style.setProperty('--share', waShare + '%');
      
      window.ContourApp.El.chartLegend.innerHTML = 
        '<span style="color: var(--color-canopy)">🚗 Transport ' + Math.round(tShare) + '%</span> | ' +
        '<span style="color: var(--color-sun)">⚡ Electricity ' + Math.round(eShare) + '%</span> | ' +
        '<span style="color: var(--color-moss)">🍽️ Diet ' + Math.round(dShare) + '%</span> | ' +
        '<span style="color: var(--color-clay)">🗑️ Waste ' + Math.round(wShare) + '%</span> | ' +
        '<span style="color: var(--color-charcoal-soft)">💧 Water ' + Math.round(waShare) + '%</span>';
    }

  }

  function renderGoalPanel() {
    if (window.ContourApp.state.firstBaselineAnnual === null || !window.ContourApp.state.results) {
      window.ContourApp.El.goalDescription.textContent = 'Calculate your footprint to set a 10% reduction goal automatically.';
      window.ContourApp.El.goalProgressBar.value = 0;
      window.ContourApp.El.goalProgressCaption.textContent = '0% of the way there';
      return;
    }
    var baseline = window.ContourApp.state.firstBaselineAnnual;
    var goal = baseline * 0.9;
    var denominator = Math.max(baseline - goal, 0.0001);
    var progress = window.ContourApp.Utils.clamp(((baseline - window.ContourApp.state.results.annual) / denominator) * 100, 0, 100);

    window.ContourApp.El.goalDescription.textContent =
      'Your goal: bring your annual footprint from ' + window.ContourApp.Utils.formatNumber(baseline, 0) +
      ' down to ' + window.ContourApp.Utils.formatNumber(goal, 0) + ' kg CO2e (a 10% cut from your first calculation).';
    window.ContourApp.El.goalProgressBar.value = progress;
    window.ContourApp.El.goalProgressCaption.textContent = Math.round(progress) + '% of the way there';
  }

  function renderGamification() {
    window.ContourApp.El.ecoScoreValue.textContent = window.ContourApp.Utils.formatNumber(window.ContourApp.state.ecoScore, 0);
    window.ContourApp.El.ecoLevelLabel.textContent = window.ContourApp.Gamification.getLevel(window.ContourApp.state.ecoScore).name;
    window.ContourApp.El.streakValue.textContent = window.ContourApp.Utils.formatNumber(window.ContourApp.state.streak.current, 0);
    window.ContourApp.El.longestStreakValue.textContent = window.ContourApp.Utils.formatNumber(window.ContourApp.state.streak.longest, 0);
  }

  function renderChecklist() {
    window.ContourApp.Utils.clearChildren(window.ContourApp.El.dailyChecklist);
    Data.CHECKLIST_ITEMS.forEach(function (item) {
      var checkboxId = 'checklist-' + item.id;
      var checkbox = window.ContourApp.Utils.createEl('input', {
        attrs: { type: 'checkbox', id: checkboxId, 'data-item-id': item.id },
        props: { checked: !!window.ContourApp.state.checklist.completed[item.id] }
      });
      var label = window.ContourApp.Utils.createEl('label', { text: item.label, attrs: { for: checkboxId } });
      var points = window.ContourApp.Utils.createEl('span', { className: 'checklist__points', text: '+' + item.points + ' pts' });
      var li = window.ContourApp.Utils.createEl('li', { className: 'checklist__item' }, [checkbox, label, points]);
      window.ContourApp.El.dailyChecklist.appendChild(li);
    });
  }

  function renderWeeklyChallenge() {
    var current = window.ContourApp.Gamification.getCurrentChallenge();
    window.ContourApp.El.challengeTitle.textContent = current.challenge.title;
    window.ContourApp.El.challengeDescription.textContent = current.challenge.description;
    window.ContourApp.El.challengePoints.textContent = String(current.challenge.points);
    var done = window.ContourApp.state.weeklyChallenge.completedWeeks.indexOf(current.weekKey) !== -1;
    window.ContourApp.El.completeChallengeBtn.disabled = done;
    window.ContourApp.El.challengeStatus.textContent = done ? 'Completed for this week \u2014 nice work.' : '';
  }

  function renderBadges() {
    window.ContourApp.Utils.clearChildren(window.ContourApp.El.badgesGrid);
    Data.ACHIEVEMENTS.forEach(function (achievement) {
      var unlocked = window.ContourApp.state.unlockedAchievements.indexOf(achievement.id) !== -1;
      var icon = window.ContourApp.Utils.createEl('span', { className: 'badge__icon', text: achievement.icon, attrs: { 'aria-hidden': 'true' } });
      var title = window.ContourApp.Utils.createEl('p', { className: 'badge__title', text: achievement.title });
      var desc = window.ContourApp.Utils.createEl('p', { className: 'badge__desc', text: achievement.description });
      var stateText = window.ContourApp.Utils.createEl('p', { className: 'badge__state', text: unlocked ? 'Unlocked' : 'Locked' });
      var textWrap = window.ContourApp.Utils.createEl('div', {}, [title, desc, stateText]);
      var li = window.ContourApp.Utils.createEl('li', { className: 'badge' + (unlocked ? '' : ' badge--locked') }, [icon, textWrap]);
      window.ContourApp.El.badgesGrid.appendChild(li);
    });
  }

  function renderTipsTablist() {
    window.ContourApp.Utils.clearChildren(window.ContourApp.El.tipsTablist);
    Data.CATEGORY_ORDER.forEach(function (category, index) {
      var isSelected = category === selectedTipCategory;
      var tab = window.ContourApp.Utils.createEl('button', {
        className: 'tab',
        text: Data.CATEGORY_ICONS[category] + ' ' + Data.CATEGORY_LABELS[category],
        attrs: {
          type: 'button',
          role: 'tab',
          id: 'tab-' + category,
          'aria-selected': isSelected ? 'true' : 'false',
          'aria-controls': 'tipsPanel',
          tabindex: isSelected ? '0' : '-1'
        }
      });
      tab.addEventListener('click', function () {
        selectedTipCategory = category;
        renderTipsTablist();
        renderTipsPanel();
        tab.focus();
      });
      tab.addEventListener('keydown', function (event) {
        var tabs = window.ContourApp.Utils.qsa('.tab', window.ContourApp.El.tipsTablist);
        var currentIndex = tabs.indexOf(event.currentTarget);
        var nextIndex = null;
        if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex !== null) {
          event.preventDefault();
          selectedTipCategory = Data.CATEGORY_ORDER[nextIndex];
          renderTipsTablist();
          renderTipsPanel();
          var newTabs = window.ContourApp.Utils.qsa('.tab', window.ContourApp.El.tipsTablist);
          if (newTabs[nextIndex]) newTabs[nextIndex].focus();
        }
      });
      window.ContourApp.El.tipsTablist.appendChild(tab);
    });
  }

  function renderTipsPanel() {
    window.ContourApp.Utils.clearChildren(window.ContourApp.El.tipsPanel);
    window.ContourApp.El.tipsPanel.setAttribute('aria-labelledby', 'tab-' + selectedTipCategory);
    var tips = Data.SUSTAINABILITY_TIPS[selectedTipCategory] || [];
    tips.forEach(function (tip) {
      var title = window.ContourApp.Utils.createEl('p', { className: 'tip-card__title', text: tip.title });
      var desc = window.ContourApp.Utils.createEl('p', { className: 'tip-card__desc', text: tip.description });
      window.ContourApp.El.tipsPanel.appendChild(window.ContourApp.Utils.createEl('article', { className: 'tip-card' }, [title, desc]));
    });
  }

  function syncEducationDefaultCategory() {
    if (window.ContourApp.state.results) {
      var insight = window.ContourApp.Insights.generate(window.ContourApp.state.inputs, window.ContourApp.state.results.byCategoryAnnual);
      selectedTipCategory = insight.topCategory;
      window.ContourApp.El.learnIntro.textContent =
        'Your biggest emission source right now is ' + Data.CATEGORY_LABELS[insight.topCategory] +
        ', so its tips are shown first. Browse any other category using the tabs below.';
    } else {
      window.ContourApp.El.learnIntro.textContent = 'Tips are sorted to your biggest emission source once you calculate your footprint. Browse any category below in the meantime.';
    }
  }

  function renderAll() {
    renderHero();
    renderCalculatorSummary();
    renderInsights();
    renderSimulatorGate();
    renderDashboard();
    renderGamification();
    renderChecklist();
    renderWeeklyChallenge();
    renderBadges();
    syncEducationDefaultCategory();
    renderTipsTablist();
    renderTipsPanel();
  }
function wireNav() {
    window.ContourApp.El.navToggle.addEventListener('click', function () {
      var isOpen = window.ContourApp.El.primaryNav.classList.toggle('is-open');
      window.ContourApp.El.navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    window.ContourApp.Utils.qsa('a', window.ContourApp.El.primaryNav).forEach(function (link) {
      link.addEventListener('click', function () {
        window.ContourApp.El.primaryNav.classList.remove('is-open');
        window.ContourApp.El.navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function wireCalculatorForm() {
    window.ContourApp.El.calculatorForm.addEventListener('submit', function (event) {
      event.preventDefault();
      try {
        var validation = window.ContourApp.validateCalculatorForm(window.ContourApp.El.calculatorForm);
        if (!validation.valid) {
          window.ContourApp.El.formStatus.textContent = 'Please fix the highlighted fields before calculating.';
          if (validation.firstInvalidId) {
            var invalidEl = document.getElementById(validation.firstInvalidId);
            if (invalidEl) invalidEl.focus();
          }
          return;
        }

        window.ContourApp.El.formStatus.textContent = '';
        var result = window.ContourApp.computeFootprint(validation.values);
        window.ContourApp.state.inputs = validation.values;
        window.ContourApp.state.results = result;

        if (!window.ContourApp.state.calculatorCompleted) {
          window.ContourApp.state.calculatorCompleted = true;
          window.ContourApp.Gamification.addPoints(Data.ACTION_POINTS.calculatorCompleted);
          window.ContourApp.Toast.show('+' + Data.ACTION_POINTS.calculatorCompleted + ' pts \u2014 footprint calculated');
        } else {
          window.ContourApp.Toast.show('Footprint recalculated.');
        }

        if (window.ContourApp.state.firstBaselineAnnual === null) {
          window.ContourApp.state.firstBaselineAnnual = result.annual;
        }

        simulatorInitialized = false;
        window.ContourApp.Gamification.evaluateAchievements();
        window.ContourApp.Storage.save(window.ContourApp.state);
        renderAll();
      } catch (err) {
        window.ContourApp.Toast.show('Could not calculate your footprint. Please check your inputs and try again.', 'error');
      }
    });

    window.ContourApp.El.resetCalculatorBtn.addEventListener('click', function () {
      try {
        window.ContourApp.El.calculatorForm.reset();
        window.ContourApp.NUMBER_FIELDS.forEach(function (field) {
          var el = window.ContourApp.Utils.qs('#' + field.id, window.ContourApp.El.calculatorForm);
          el.setAttribute('aria-invalid', 'false');
          var errorEl = window.ContourApp.Utils.qs('#' + field.id + '-error', window.ContourApp.El.calculatorForm);
          if (errorEl) errorEl.textContent = '';
        });
        window.ContourApp.El.formStatus.textContent = '';
        window.ContourApp.Toast.show('Calculator form reset.');
      } catch (err) {
        window.ContourApp.Toast.show('Could not reset the form.', 'error');
      }
    });
  }

  function wireSimulator() {
    var controls = [window.ContourApp.El.simDriveLess, window.ContourApp.El.simRenewableTarget, window.ContourApp.El.simDietTarget, window.ContourApp.El.simWasteReduce];
    controls.forEach(function (control) {
      control.addEventListener('input', function () {
        try {
          updateSimulatorOutputs(true);
        } catch (err) {
          window.ContourApp.Toast.show('Could not update the simulator.', 'error');
        }
      });
    });

    window.ContourApp.El.resetSimulatorBtn.addEventListener('click', function () {
      window.ContourApp.El.simDriveLess.value = 0;
      window.ContourApp.El.simRenewableTarget.value = 0;
      window.ContourApp.El.simDietTarget.value = window.ContourApp.state.inputs ? window.ContourApp.state.inputs.dietType : 'mediumMeat';
      window.ContourApp.El.simWasteReduce.value = 0;
      updateSimulatorOutputs(false);
      window.ContourApp.Toast.show('Simulator reset to your baseline.');
    });
  }

  function wireChecklist() {
    window.ContourApp.El.dailyChecklist.addEventListener('change', function (event) {
      var target = event.target;
      if (!target || target.tagName !== 'INPUT' || target.type !== 'checkbox') return;
      try {
        var itemId = target.getAttribute('data-item-id');
        window.ContourApp.Gamification.toggleChecklistItem(itemId, target.checked);
        window.ContourApp.Gamification.evaluateAchievements();
        window.ContourApp.Storage.save(window.ContourApp.state);
        renderGamification();
        renderBadges();
      } catch (err) {
        window.ContourApp.Toast.show('Could not update your checklist.', 'error');
      }
    });
  }

  function wireWeeklyChallenge() {
    window.ContourApp.El.completeChallengeBtn.addEventListener('click', function () {
      try {
        var outcome = window.ContourApp.Gamification.completeCurrentChallenge();
        if (outcome.alreadyDone) {
          window.ContourApp.Toast.show('You already completed this week\u2019s challenge.');
        } else {
          window.ContourApp.Gamification.evaluateAchievements();
          window.ContourApp.Storage.save(window.ContourApp.state);
        }
        renderGamification();
        renderWeeklyChallenge();
        renderBadges();
      } catch (err) {
        window.ContourApp.Toast.show('Could not update this week\u2019s challenge.', 'error');
      }
    });
  }

  function wireResetAllData() {
    window.ContourApp.El.resetAllDataBtn.addEventListener('click', function () {
      try {
        var confirmed = window.confirm('This will erase all Contour data saved on this device. Continue?');
        if (!confirmed) return;
        window.ContourApp.Storage.clear();
        window.ContourApp.state = window.ContourApp.defaultState();
        simulatorInitialized = false;
        selectedTipCategory = Data.CATEGORY_ORDER[0];
        window.ContourApp.El.calculatorForm.reset();
        renderAll();
        window.ContourApp.Toast.show('All local data cleared.');
      } catch (err) {
        window.ContourApp.Toast.show('Could not clear local data.', 'error');
      }
    });
  }

/* --- js/main.js --- */
function init() {
    try {
      cacheElements();
      window.ContourApp.state = window.ContourApp.loadState();
      window.ContourApp.Gamification.ensureChecklistFresh();
      window.ContourApp.Gamification.checkStreakBreak();
      populateFormFromState();
      wireNav();
      wireCalculatorForm();
      wireSimulator();
      wireChecklist();
      wireWeeklyChallenge();
      wireResetAllData();
      renderAll();
      window.ContourApp.Storage.save(window.ContourApp.state);
    } catch (err) {
      window.ContourApp.Toast.show('Contour had trouble loading your saved data, so it started fresh.', 'error');
      try {
        window.ContourApp.window.ContourApp.state = window.ContourApp.defaultState();
        renderAll();
      } catch (fatal) {
        /* If rendering itself fails there is nothing further we can safely do. */
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
