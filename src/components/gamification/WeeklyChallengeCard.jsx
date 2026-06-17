import { Trophy, CircleCheck } from "../icons/index.jsx";
import { Button } from "../common/Button.jsx";

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
