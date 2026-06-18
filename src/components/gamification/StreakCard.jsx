import PropTypes from "prop-types";
import { Flame } from "@/components/icons/index.jsx";

/**
 * @typedef {Object} StreakCardProps
 * @property {{ current: number, longest: number }} streak - User streak information tracking daily checklists.
 */

/**
 * StreakCard component. Renders the user's current and longest consecutive daily action streaks.
 *
 * @param {StreakCardProps} props
 */
export function StreakCard({ streak }) {
  return (
    <div className="eco-status__streak">
      <p className="eco-status__label">Current streak</p>
      <p className="eco-status__value">
        <Flame
          size={22}
          aria-hidden="true"
          className={streak.current > 0 ? "streak-flame--active" : ""}
        />
        {streak.current}
        <span className="eco-status__unit">
          {streak.current === 1 ? "day" : "days"}
        </span>
      </p>
      <p className="eco-status__level">
        Longest: {streak.longest} {streak.longest === 1 ? "day" : "days"}
      </p>
    </div>
  );
}

StreakCard.propTypes = {
  streak: PropTypes.shape({
    current: PropTypes.number.isRequired,
    longest: PropTypes.number.isRequired,
  }).isRequired,
};
