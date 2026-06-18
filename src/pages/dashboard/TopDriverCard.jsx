import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { CarbonData as Data } from "@/lib/data.js";
import { CATEGORY_ICONS, ArrowRight } from "@/components/icons/index.jsx";
import { formatNumber } from "@/lib/format.js";

/**
 * @typedef {Object} Recommendation
 * @property {string} category - Category identifier.
 * @property {number} savingsKg - Potential annual savings in kg CO2e.
 */

/**
 * @typedef {Object} InsightsSummary
 * @property {string} topCategory - The category contributing the most emissions.
 * @property {number} topShare - Percentage contribution of the top category.
 * @property {Recommendation[]} recommendations - Sorted list of potential category savings.
 */

/**
 * @typedef {Object} TopDriverCardProps
 * @property {InsightsSummary} insights - Emissions insights report summary.
 */

/**
 * TopDriverCard component. Displays user's single largest emission category and highlights top saving opportunities.
 *
 * @param {TopDriverCardProps} props
 */
export function TopDriverCard({ insights }) {
  const Icon = CATEGORY_ICONS[insights.topCategory];
  const topSaving = insights.recommendations[0];

  return (
    <div className="panel top-driver-card">
      <p className="top-driver-card__eyebrow">Biggest driver</p>
      <div className="top-driver-card__main">
        <span className="top-driver-card__icon" aria-hidden="true">
          <Icon size={22} />
        </span>
        <div>
          <p className="top-driver-card__category">
            {Data.CATEGORY_LABELS[insights.topCategory]}
          </p>
          <p className="top-driver-card__share">
            {Math.round(insights.topShare)}% of your annual footprint
          </p>
        </div>
      </div>
      {topSaving ? (
        <p className="top-driver-card__hint">
          Top opportunity: save ~{formatNumber(topSaving.savingsKg, 0)} kg
          CO2e/year in {Data.CATEGORY_LABELS[topSaving.category].toLowerCase()}.
        </p>
      ) : null}
      <Link to="/insights" className="top-driver-card__link">
        See all recommendations <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

TopDriverCard.propTypes = {
  insights: PropTypes.shape({
    topCategory: PropTypes.string.isRequired,
    topShare: PropTypes.number.isRequired,
    recommendations: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        savingsKg: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }).isRequired,
};
