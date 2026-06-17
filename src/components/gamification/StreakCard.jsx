import { Flame } from '../icons/index.jsx';

export function StreakCard({ streak }) {
  return (
    <div className="eco-status__streak">
      <p className="eco-status__label">Current streak</p>
      <p className="eco-status__value">
        <Flame size={22} aria-hidden="true" className={streak.current > 0 ? 'streak-flame--active' : ''} />
        {streak.current}
        <span className="eco-status__unit">{streak.current === 1 ? 'day' : 'days'}</span>
      </p>
      <p className="eco-status__level">Longest: {streak.longest} {streak.longest === 1 ? 'day' : 'days'}</p>
    </div>
  );
}
