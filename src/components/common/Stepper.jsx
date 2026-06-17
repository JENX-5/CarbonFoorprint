import { Check } from "../icons/index.jsx";

/**
 * Horizontal step indicator for the calculator wizard. Steps before the
 * current one render as completed (checkmark); the current step is
 * highlighted; later steps are dimmed. Clicking a completed step jumps
 * back to it — clicking ahead is disabled until the form is valid.
 */
export function Stepper({
  steps,
  currentIndex,
  furthestAllowedIndex,
  onStepClick,
}) {
  return (
    <ol className="stepper" aria-label="Calculator steps">
      {steps.map((step, index) => {
        const status =
          index < currentIndex
            ? "done"
            : index === currentIndex
              ? "current"
              : "upcoming";
        const clickable = index <= furthestAllowedIndex;
        return (
          <li
            key={step.id}
            className={`stepper__item stepper__item--${status}`}
          >
            <button
              type="button"
              className="stepper__button"
              onClick={() => clickable && onStepClick(index)}
              disabled={!clickable}
              aria-current={status === "current" ? "step" : undefined}
            >
              <span className="stepper__index" aria-hidden="true">
                {status === "done" ? <Check size={14} /> : index + 1}
              </span>
              <span className="stepper__label">
                {step.label}
                <span className="visually-hidden"> ({status} step)</span>
              </span>
            </button>
            {index < steps.length - 1 ? (
              <span className="stepper__connector" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
