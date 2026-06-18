import PropTypes from "prop-types";
import { Trophy, CircleCheck } from "@/components/icons/index.jsx";
import { Button } from "@/components/common/Button.jsx";

/**
 * @typedef {Object} WeeklyChallenge
 * @property {string} weekKey - The current ISO week key.
 * @property {{ title: string, description: string, points: number }} challenge - The challenge details object.
 */

/**
 * @typedef {Object} WeeklyChallengeCardProps
 * @property {WeeklyChallenge} challenge - The current week's active challenge data.
 * @property {string[]} completedWeeks - List of completed week keys.
 * @property {() => void} onComplete - Callback when the challenge is marked complete.
 */

/**
 * WeeklyChallengeCard component. Displays current active challenge details, points, and completion status.
 *
 * @param {WeeklyChallengeCardProps} props
 */
export function WeeklyChallengeCard({ challenge, completedWeeks, onComplete }) {
  const isComplete = completedWeeks.includes(challenge.weekKey);

  return (
    <div className="panel challenge-card">
      <div className="challenge-card__icon" aria-hidden="true">
        <Trophy size={20} />
      </div>
      <div className="challenge-card__body">
        <p className="challenge-title">{challenge.challenge.title}</p>
        <p>{challenge.challenge.description}</p>
        <p className="challenge-points">
          Worth {challenge.challenge.points} points
        </p>
        <p className="challenge-status">
          {isComplete ? (
            <span className="challenge-status--done">
              <CircleCheck size={16} aria-hidden="true" /> Completed this week
            </span>
          ) : (
            <Button variant="primary" size="sm" onClick={onComplete}>
              Mark as complete
            </Button>
          )}
        </p>
      </div>
      <p className="challenge-card__total">
        {completedWeeks.length} challenge
        {completedWeeks.length === 1 ? "" : "s"} completed all-time
      </p>
    </div>
  );
}

WeeklyChallengeCard.propTypes = {
  challenge: PropTypes.shape({
    weekKey: PropTypes.string.isRequired,
    challenge: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      points: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  completedWeeks: PropTypes.arrayOf(PropTypes.string).isRequired,
  onComplete: PropTypes.func.isRequired,
};
