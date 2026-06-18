import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { ScoreRing } from "@/components/common/ScoreRing.jsx";
import { formatNumber } from "@/lib/format.js";

/**
 * @typedef {Object} ScoreCardProps
 * @property {number} score - The user's Eco Score from 0 to 100.
 * @property {{ label: string, className: string }} rating - The rating description and CSS class wrapper.
 * @property {{ name: string, min: number }} level - The current Eco Level name and minimum requirements.
 * @property {{ next: { name: string, min: number } | null, percent: number, pointsToNext: number }} levelProgress - Details about progress to the next level.
 */

/**
 * ScoreCard component. Displays circular gauge Eco Score, rating string, and level progress bar.
 *
 * @param {ScoreCardProps} props
 */
export function ScoreCard({ score, rating, level, levelProgress }) {
  return (
    <div className="score-panel">
      <ScoreRing score={score} ratingClassName={rating.className} />
      <p className={`score-panel__rating ${rating.className}`}>
        {rating.label}
      </p>

      <div className="score-panel__level">
        <div className="score-panel__level-row">
          <span>{level.name}</span>
          {levelProgress.next ? (
            <span className="score-panel__level-next">
              {levelProgress.next.name}
            </span>
          ) : (
            <span>Top level</span>
          )}
        </div>
        <progress
          value={levelProgress.percent}
          max="100"
          aria-label={`Progress to ${levelProgress.next ? levelProgress.next.name : "max level"}`}
        />
        <p className="score-panel__level-hint">
          {levelProgress.next
            ? `${formatNumber(levelProgress.pointsToNext, 0)} points to ${levelProgress.next.name}`
            : "You\u2019ve reached the highest level."}
        </p>
      </div>

      <Link
        to="/progress"
        className="button button--ghost button--small score-panel__link"
      >
        View eco score & badges
      </Link>
    </div>
  );
}

ScoreCard.propTypes = {
  score: PropTypes.number.isRequired,
  rating: PropTypes.shape({
    label: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
  }).isRequired,
  level: PropTypes.shape({
    name: PropTypes.string.isRequired,
    min: PropTypes.number.isRequired,
  }).isRequired,
  levelProgress: PropTypes.shape({
    next: PropTypes.shape({
      name: PropTypes.string.isRequired,
      min: PropTypes.number.isRequired,
    }),
    percent: PropTypes.number.isRequired,
    pointsToNext: PropTypes.number.isRequired,
  }).isRequired,
};
