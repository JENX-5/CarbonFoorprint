import PropTypes from "prop-types";
import { TreePine, Route, Check } from "@/components/icons/index.jsx";
import { Button } from "@/components/common/Button.jsx";
import { formatNumber } from "@/lib/format.js";

/**
 * @typedef {Object} SimulatorResultsProps
 * @property {Object} simResult - The mathematical projection output from runSimulation.
 * @property {() => void} onApplyScenario - Callback triggered to persist simulation as new baseline.
 */

/**
 * SimulatorResults Component.
 * Displays projected totals, tree absorption offsets, travel offsets, and the apply action.
 *
 * @param {SimulatorResultsProps} props
 */
export function SimulatorResults({ simResult, onApplyScenario }) {
  return (
    <div className="results-card">
      <div className="projection-header">
        <h3 className="results-card__title">Projected Annual Footprint</h3>
        <p className="big-projection">
          {formatNumber(simResult.newTotal, 0)} kg CO2e
        </p>
        <p className="baseline-comparison">
          {simResult.savedKg > 0 ? (
            <>
              Saves{" "}
              <strong>
                {formatNumber(simResult.savedKg, 0)} kg CO2e / year
              </strong>{" "}
              (~
              {Math.round((simResult.savedKg / simResult.baselineTotal) * 100)}%
              reduction)
            </>
          ) : (
            "No changes from current baseline."
          )}
        </p>
      </div>

      {simResult.savedKg > 0 && (
        <div className="projections-equivalent">
          <h4 className="results-card__sub-title">Equivalent Carbon Savings</h4>

          <div className="equivalent-stat">
            <div className="equivalent-icon">
              <TreePine size={20} />
            </div>
            <p className="equivalent-text">
              Equivalent to planting{" "}
              <strong>
                {formatNumber(simResult.equivalentTrees, 0)} trees
              </strong>{" "}
              absorbing carbon for a whole year.
            </p>
          </div>

          <div className="equivalent-stat">
            <div className="equivalent-icon">
              <Route size={20} />
            </div>
            <p className="equivalent-text">
              Equivalent to driving{" "}
              <strong>
                {formatNumber(simResult.equivalentKm, 0)} fewer kilometers
              </strong>{" "}
              in an average gasoline car.
            </p>
          </div>

          <Button
            variant="secondary"
            icon={Check}
            onClick={onApplyScenario}
            className="results-card__apply-btn"
          >
            Apply Scenario as Dashboard Baseline
          </Button>
        </div>
      )}
    </div>
  );
}

SimulatorResults.propTypes = {
  simResult: PropTypes.shape({
    newTotal: PropTypes.number.isRequired,
    savedKg: PropTypes.number.isRequired,
    baselineTotal: PropTypes.number.isRequired,
    equivalentTrees: PropTypes.number.isRequired,
    equivalentKm: PropTypes.number.isRequired,
  }).isRequired,
  onApplyScenario: PropTypes.func.isRequired,
};
