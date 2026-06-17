/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { appReducer } from './appReducer.js';
import { loadState, Storage } from '../lib/storage.js';
import { computeFootprint } from '../lib/calculations.js';
import { computeScore, getRating, compareToGlobalAverage } from '../lib/scoring.js';
import { generateInsights } from '../lib/insightsEngine.js';
import { getLevel, getLevelProgress, getCurrentChallenge } from '../lib/gamification.js';
import { CarbonData as Data } from '../lib/data.js';
import { useToast } from '../components/common/Toast.jsx';
import {
  Award,
  Leaf,
  SlidersHorizontal,
  TrendingDown,
  Utensils,
  Sun,
  Trash2,
  Flame,
  Trophy,
  CircleCheck,
  TreePine
} from '../components/icons/index.jsx';

const ACHIEVEMENT_ICONS = {
  firstCalculation: Leaf,
  scenarioExplorer: SlidersHorizontal,
  lowCarbonLiving: TrendingDown,
  plantPowered: Utensils,
  renewableReady: Sun,
  zeroWasteHero: Trash2,
  weekWarrior: Flame,
  challengeChampion: Trophy,
  checklistPro: CircleCheck,
  forestGuardian: TreePine
};

const AppStateContext = createContext(null);

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);
  const { addToast } = useToast();
  const prevLevelRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const persisted = { ...state };
    delete persisted._meta;
    Storage.save(persisted);
  }, [state]);

  useEffect(() => {
    const meta = state._meta;
    if (!meta) return;

    meta.newlyUnlocked.forEach((achievement) => {
      const Icon = ACHIEVEMENT_ICONS[achievement.id] || Award;
      addToast({
        title: `Badge unlocked — ${achievement.title}`,
        description: achievement.description,
        icon: <Icon size={18} />,
        variant: 'achievement'
      });
    });

    if (meta.event === 'first-calculation') {
      addToast({ title: 'Footprint calculated', description: 'Your dashboard is ready.', icon: '\u2713' });
    } else if (meta.event === 'recalculated') {
      addToast({ title: 'Footprint updated', description: 'Your dashboard now reflects the new numbers.', icon: '\u2713' });
    } else if (meta.event === 'challenge-completed') {
      addToast({ title: 'Challenge complete', description: `+${Data.ACTION_POINTS.weeklyChallenge} points added to your eco score.` });
    } else if (meta.event === 'scenario-applied') {
      addToast({ title: 'Scenario applied', description: 'That scenario is now your baseline.' });
    } else if (meta.event === 'reset') {
      addToast({ title: 'Data reset', description: 'All saved progress was cleared from this browser.' });
    } else if (meta.event === 'imported') {
      addToast({ title: 'Data imported', description: 'Your exported progress has been restored.' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state._meta]);

  useEffect(() => {
    const level = getLevel(state.ecoScore).name;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevLevelRef.current = level;
      return;
    }
    if (prevLevelRef.current && prevLevelRef.current !== level) {
      addToast({ title: `Level up — ${level}`, description: 'Your eco score reached a new level.' });
    }
    prevLevelRef.current = level;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ecoScore]);

  const derived = useMemo(() => {
    const level = getLevel(state.ecoScore);
    const levelProgress = getLevelProgress(state.ecoScore);
    const challenge = getCurrentChallenge();

    if (!state.results || !state.inputs) {
      return { score: null, rating: null, comparison: null, insights: null, level, levelProgress, challenge };
    }

    const score = computeScore(state.results.annual);
    return {
      score,
      rating: getRating(score),
      comparison: compareToGlobalAverage(state.results.annual),
      insights: generateInsights(state.inputs, state.results.byCategoryAnnual),
      level,
      levelProgress,
      challenge
    };
  }, [state.results, state.inputs, state.ecoScore]);

  const actions = useMemo(() => ({
    calculate(inputs) {
      const results = computeFootprint(inputs);
      dispatch({ type: 'CALCULATE', payload: { inputs, results } });
      return results;
    },
    runSimulator() {
      dispatch({ type: 'RUN_SIMULATOR' });
    },
    applyScenario(inputs, results) {
      dispatch({ type: 'APPLY_SCENARIO', payload: { inputs, results } });
    },
    toggleChecklistItem(itemId) {
      dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', payload: { itemId } });
    },
    completeWeeklyChallenge() {
      dispatch({ type: 'COMPLETE_WEEKLY_CHALLENGE' });
    },
    setTheme(theme) {
      dispatch({ type: 'SET_THEME', payload: { theme } });
    },
    resetAll() {
      Storage.clear();
      dispatch({ type: 'RESET_ALL' });
    },
    exportData() {
      const persisted = { ...state };
      delete persisted._meta;
      downloadJson(`contour-data-${new Date().toISOString().slice(0, 10)}.json`, persisted);
    },
    importData(parsed) {
      dispatch({ type: 'IMPORT_STATE', payload: { state: parsed } });
    }
  }), [state]);

  const value = useMemo(() => ({ state, derived, actions }), [state, derived, actions]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within an AppStateProvider');
  return ctx;
}
