/**
 * gamification.js
 * ---------------------------------------------------------------------------
 * Ports the original `Gamification.getLevel` / `getCurrentChallenge` logic
 * unchanged, and adds the missing pieces that data.js already documents but
 * the original React port never wired up: a generic achievement evaluator,
 * daily checklist scoring, and streak tracking. The achievement comparator
 * contract below matches the comment already written in data.js:
 *   gte     -> metrics[metric] >= threshold
 *   lte     -> metrics[metric] <= threshold
 *   boolean -> metrics[metric] === threshold
 *   isIn    -> threshold.indexOf(metrics[metric]) !== -1
 * ---------------------------------------------------------------------------
 */
import { CarbonData as Data } from './data.js';
import { getTodayKey, getYesterdayKey, getCurrentWeekKey } from './format.js';

export function getLevel(ecoScore) {
  const levels = Data.LEVELS;
  let current = levels[0];
  for (let i = 0; i < levels.length; i++) {
    if (ecoScore >= levels[i].min) current = levels[i];
  }
  return current;
}

/** The level after `current`, or null if already at the top level. */
export function getNextLevel(ecoScore) {
  const levels = Data.LEVELS;
  const current = getLevel(ecoScore);
  const idx = levels.findIndex((l) => l.name === current.name);
  return idx >= 0 && idx < levels.length - 1 ? levels[idx + 1] : null;
}

export function getLevelProgress(ecoScore) {
  const current = getLevel(ecoScore);
  const next = getNextLevel(ecoScore);
  if (!next) return { current, next: null, percent: 100, pointsToNext: 0 };
  const span = next.min - current.min;
  const into = ecoScore - current.min;
  const percent = span > 0 ? Math.round((into / span) * 100) : 100;
  return { current, next, percent: Math.min(100, Math.max(0, percent)), pointsToNext: Math.max(0, next.min - ecoScore) };
}

export function getCurrentChallenge() {
  const weekKey = getCurrentWeekKey();
  const info = weekKey.split('-W');
  const weekNumber = Number(info[1]);
  const index = weekNumber % Data.CHALLENGES.length;
  return { weekKey, challenge: Data.CHALLENGES[index] };
}

function meetsCondition(achievement, metrics) {
  const value = metrics[achievement.metric];
  switch (achievement.comparator) {
    case 'gte':
      return typeof value === 'number' && value >= achievement.threshold;
    case 'lte':
      return typeof value === 'number' && value <= achievement.threshold;
    case 'boolean':
      return value === achievement.threshold;
    case 'isIn':
      return Array.isArray(achievement.threshold) && achievement.threshold.indexOf(value) !== -1;
    default:
      return false;
  }
}

/** Builds the "metrics snapshot" object the achievement rules are evaluated against. */
export function buildMetricsSnapshot(state) {
  const todayKey = getTodayKey();
  const checklistToday = state.checklist && state.checklist.date === todayKey ? state.checklist : null;
  const completedToday = checklistToday ? Object.values(checklistToday.completed).filter(Boolean).length : 0;

  return {
    calculatorCompleted: !!state.calculatorCompleted,
    simulatorRun: !!state.simulatorRun,
    annualTotal: state.results ? state.results.annual : Infinity,
    dietType: state.inputs ? state.inputs.dietType : null,
    renewablePercent: state.inputs ? state.inputs.renewablePercent : 0,
    recycledPercent: state.inputs ? state.inputs.recycledPercent : 0,
    currentStreak: state.streak ? state.streak.current : 0,
    weeklyChallengesCompleted: state.weeklyChallenge ? state.weeklyChallenge.completedWeeks.length : 0,
    checklistAllCompletedToday: completedToday === Data.CHECKLIST_ITEMS.length,
    ecoScore: state.ecoScore || 0
  };
}

/** Returns the list of achievement definitions newly satisfied (not yet unlocked). */
export function evaluateNewAchievements(state) {
  const metrics = buildMetricsSnapshot(state);
  const unlocked = new Set(state.unlockedAchievements || []);
  return Data.ACHIEVEMENTS.filter((a) => !unlocked.has(a.id) && meetsCondition(a, metrics));
}

/**
 * Applies newly-earned achievements to a state slice: adds their ids to
 * unlockedAchievements and credits ecoScore. Returns { unlockedAchievements,
 * ecoScore, newlyUnlocked } — pure, no mutation of the input state.
 */
export function applyAchievements(state) {
  const newly = evaluateNewAchievements(state);
  if (newly.length === 0) {
    return { unlockedAchievements: state.unlockedAchievements, ecoScore: state.ecoScore, newlyUnlocked: [] };
  }
  const unlockedAchievements = [...state.unlockedAchievements, ...newly.map((a) => a.id)];
  const ecoScore = state.ecoScore + newly.length * Data.ACTION_POINTS.achievementUnlock;
  return { unlockedAchievements, ecoScore, newlyUnlocked: newly };
}

/**
 * Toggles one daily checklist item. Handles the daily rollover (a new
 * calendar day clears yesterday's checked state), awards points once per
 * item per day, and advances the current/longest streak the first time any
 * item is completed on a new day. Pure function — returns a new state
 * object, achievements are applied separately by the caller so toast/score
 * side-effects stay in one place.
 */
export function toggleChecklistItem(state, itemId) {
  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();
  const item = Data.CHECKLIST_ITEMS.find((i) => i.id === itemId);
  if (!item) return state;

  const isNewDay = state.checklist.date !== todayKey;
  const baseChecklist = isNewDay
    ? { date: todayKey, completed: {}, awarded: {} }
    : state.checklist;

  const wasCompleted = !!baseChecklist.completed[itemId];
  const nowCompleted = !wasCompleted;

  const completed = { ...baseChecklist.completed, [itemId]: nowCompleted };
  const awarded = { ...baseChecklist.awarded };

  let ecoScore = state.ecoScore;
  let streak = state.streak;

  if (nowCompleted && !awarded[itemId]) {
    awarded[itemId] = true;
    ecoScore += item.points;

    if (state.streak.lastActiveDate !== todayKey) {
      const continuing = state.streak.lastActiveDate === yesterdayKey;
      const current = continuing ? state.streak.current + 1 : 1;
      streak = {
        current,
        longest: Math.max(state.streak.longest, current),
        lastActiveDate: todayKey
      };
    }
  }

  return {
    ...state,
    checklist: { date: todayKey, completed, awarded },
    ecoScore,
    streak
  };
}

/** Marks this week's challenge complete (idempotent — one award per ISO week). */
export function completeWeeklyChallenge(state) {
  const { weekKey } = getCurrentChallenge();
  if (state.weeklyChallenge.completedWeeks.includes(weekKey)) return state;
  return {
    ...state,
    weeklyChallenge: {
      completedWeeks: [...state.weeklyChallenge.completedWeeks, weekKey]
    },
    ecoScore: state.ecoScore + Data.ACTION_POINTS.weeklyChallenge
  };
}
