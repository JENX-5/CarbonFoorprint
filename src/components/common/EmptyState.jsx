import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Calculator } from "@/components/icons/index.jsx";

/**
 * @typedef {Object} EmptyStateProps
 * @property {React.ComponentType<{ size: number }>} [icon=Calculator] - Icon component shown at the top.
 * @property {string} [title="Calculate your footprint to unlock this view"] - Title heading.
 * @property {string} [description] - Body context explaining how to unlock or proceed.
 * @property {string} [actionLabel="Start the calculator"] - Button label text.
 * @property {string} [actionTo="/calculator"] - Navigation route path for the CTA button.
 */

/**
 * Consistent "you need to calculate your footprint first" state. Treats the
 * empty screen as an invitation to act (a clear CTA), rather than a dead
 * end — the original app just printed a sentence with nowhere to go.
 *
 * @param {EmptyStateProps} props
 */
export function EmptyState({
  icon: Icon = Calculator,
  title = "Calculate your footprint to unlock this view",
  description = "Answer a few questions about your transport, energy, diet, waste, and water use — it takes about two minutes.",
  actionLabel = "Start the calculator",
  actionTo = "/calculator",
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        <Icon size={28} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {actionTo ? (
        <Link to={actionTo} className="button button--primary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  actionTo: PropTypes.string,
};
