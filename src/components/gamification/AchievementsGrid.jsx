import { CarbonData as Data } from '../../lib/data.js';
import {
  Lock,
  Leaf,
  SlidersHorizontal,
  TrendingDown,
  Utensils,
  Sun,
  Trash2,
  Flame,
  Trophy,
  CircleCheck,
  TreePine,
  Award
} from '../icons/index.jsx';

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

export function AchievementsGrid({ unlockedAchievements }) {
  const unlockedSet = new Set(unlockedAchievements);

  return (
    <ul className="badges-grid">
      {Data.ACHIEVEMENTS.map((achievement) => {
        const unlocked = unlockedSet.has(achievement.id);
        const Icon = ACHIEVEMENT_ICONS[achievement.id] || Award;
        return (
          <li key={achievement.id} className={`badge ${unlocked ? '' : 'badge--locked'}`}>
            <span className="badge__icon" aria-hidden="true">
              {unlocked ? <Icon size={24} /> : <Lock size={20} />}
            </span>
            <div>
              <p className="badge__title">{achievement.title}</p>
              <p className="badge__desc">{achievement.description}</p>
              <p className="badge__state">{unlocked ? 'Unlocked' : 'Locked'}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
