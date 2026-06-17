import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../state/AppStateContext.jsx";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import {
  SlidersHorizontal,
  TreePine,
  Route,
  Check,
} from "../../components/icons/index.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CarbonData as Data } from "../../lib/data.js";
import { runSimulation } from "../../lib/simulatorEngine.js";
import { formatNumber } from "../../lib/format.js";

export function SimulatorPage() {
  const { state, actions } = useAppState();
  useDocumentTitle("Scenario Simulator");
  const navigate = useNavigate();

  // Initialize sliders based on existing state inputs if they exist
  const [sliders, setSliders] = useState(() => ({
    driveLessPercent: 0,
    renewableTarget: state.inputs?.renewablePercent || 0,
    dietTarget: state.inputs?.dietType || "mediumMeat",
    wasteReducePercent: 0,
  }));

  if (!state.results || !state.inputs) {
    return (
      <div className="simulator-page-empty">
        <PageHeader
          icon={SlidersHorizontal}
          eyebrow="What-if Analysis"
          title="Scenario simulator"
          description="Model changes to your daily lifestyle to project your potential carbon savings."
        />
        <EmptyState />
      </div>
    );
  }

  const handleSliderChange = (field, value) => {
    const nextSliders = { ...sliders, [field]: value };
    setSliders(nextSliders);

    // Dispatch run simulator action to award points if first time
    if (!state.simulatorRun) {
      actions.runSimulator();
    }
  };

  const simResult = runSimulation(
    state.inputs,
    state.results.byCategoryAnnual,
    sliders,
  );

  const handleApplyScenario = () => {
    const newInputs = {
      ...state.inputs,
      commuteKmPerDay: Number(
        (
          state.inputs.commuteKmPerDay *
          (1 - sliders.driveLessPercent / 100)
        ).toFixed(1),
      ),
      renewablePercent: Number(sliders.renewableTarget),
      dietType: sliders.dietTarget,
      wasteKgPerWeek: Number(
        (
          state.inputs.wasteKgPerWeek *
          (1 - sliders.wasteReducePercent / 100)
        ).toFixed(1),
      ),
    };
    const newResults = {
      annual: simResult.newTotal,
      monthly: simResult.newTotal / 12,
      daily: simResult.newTotal / 365,
      byCategoryAnnual: simResult.byCategory,
    };
    actions.applyScenario(newInputs, newResults);
    navigate("/dashboard");
  };

  return (
    <div className="simulator-page">
      <PageHeader
        icon={SlidersHorizontal}
        eyebrow="What-if Analysis"
        title="Scenario simulator"
        description="Model changes to your daily lifestyle to project your potential carbon savings."
      />

      <style>{`
        .simulator-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          margin-top: 2rem;
        }
        @media (min-width: 1024px) {
          .simulator-layout {
            grid-template-columns: 1.2fr 1fr;
          }
        }
        .slider-card {
          background: var(--color-paper);
          border: 1px solid var(--color-line);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          box-shadow: var(--shadow-card);
        }
        .slider-group {
          margin-bottom: 2rem;
        }
        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .slider-header label {
          font-weight: 700;
          color: var(--color-canopy-dark);
        }
        .slider-value {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--color-clay);
        }
        .range-input {
          width: 100%;
          height: 6px;
          border-radius: 9999px;
          accent-color: var(--color-canopy);
          background: var(--color-mist);
          outline: none;
        }
        .select-input {
          width: 100%;
          padding: 0.6rem;
          border: 1.5px solid var(--color-line);
          border-radius: var(--radius-sm);
          background: var(--color-mist);
          font-family: var(--font-body);
        }
        .results-card {
          background: var(--color-canopy);
          color: #ffffff;
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          box-shadow: var(--shadow-card);
          align-self: start;
        }
        .projection-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }
        .big-projection {
          font-family: var(--font-mono);
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin: 0.5rem 0;
          color: var(--color-sun);
        }
        .baseline-comparison {
          font-size: 0.9rem;
          opacity: 0.85;
          margin: 0;
        }
        .equivalent-stat {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
        }
        .equivalent-icon {
          background: rgba(255, 255, 255, 0.12);
          padding: 8px;
          border-radius: 50%;
          color: var(--color-sun);
        }
        .equivalent-text {
          font-size: 0.9rem;
          line-height: 1.4;
          margin: 0;
        }
      `}</style>

      <div className="simulator-layout">
        <div className="slider-card">
          <h3 style={{ marginBottom: "2rem", fontSize: "1.2rem" }}>
            Adjust Scenario Sliders
          </h3>

          <div className="slider-group">
            <div className="slider-header">
              <label htmlFor="slider-drive-less">Reduce driving distance</label>
              <span className="slider-value">
                {sliders.driveLessPercent}% less
              </span>
            </div>
            <input
              id="slider-drive-less"
              type="range"
              min="0"
              max="100"
              step="5"
              value={sliders.driveLessPercent}
              onChange={(e) =>
                handleSliderChange("driveLessPercent", Number(e.target.value))
              }
              className="range-input"
            />
            <p
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.82rem",
                color: "var(--color-charcoal-soft)",
              }}
            >
              Avoid trips, work from home, walk, or cycle to lower transport
              emissions.
            </p>
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <label htmlFor="slider-renewable-target">
                Renewable electricity share
              </label>
              <span className="slider-value">
                {sliders.renewableTarget}% share
              </span>
            </div>
            <input
              id="slider-renewable-target"
              type="range"
              min="0"
              max="100"
              step="5"
              value={sliders.renewableTarget}
              onChange={(e) =>
                handleSliderChange("renewableTarget", Number(e.target.value))
              }
              className="range-input"
            />
            <p
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.82rem",
                color: "var(--color-charcoal-soft)",
              }}
            >
              Increase your household electricity coming from solar panels or
              clean energy providers.
            </p>
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <label htmlFor="slider-diet-target">
                Dietary patterns change
              </label>
            </div>
            <select
              id="slider-diet-target"
              value={sliders.dietTarget}
              onChange={(e) => handleSliderChange("dietTarget", e.target.value)}
              className="select-input"
            >
              {Object.entries(Data.DIET_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <p
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.82rem",
                color: "var(--color-charcoal-soft)",
              }}
            >
              Switch to lower carbon footprint meal plans (e.g. vegetarian, low
              meat, or vegan).
            </p>
          </div>

          <div className="slider-group" style={{ marginBottom: 0 }}>
            <div className="slider-header">
              <label htmlFor="slider-waste-reduce">Waste reduction</label>
              <span className="slider-value">
                {sliders.wasteReducePercent}% less
              </span>
            </div>
            <input
              id="slider-waste-reduce"
              type="range"
              min="0"
              max="100"
              step="5"
              value={sliders.wasteReducePercent}
              onChange={(e) =>
                handleSliderChange("wasteReducePercent", Number(e.target.value))
              }
              className="range-input"
            />
            <p
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.82rem",
                color: "var(--color-charcoal-soft)",
              }}
            >
              Generate less waste or recycle/compost a larger portion.
            </p>
          </div>
        </div>

        <div className="results-card">
          <div className="projection-header">
            <h3
              style={{
                color: "#ffffff",
                margin: 0,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Projected Annual Footprint
            </h3>
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
                  {Math.round(
                    (simResult.savedKg / simResult.baselineTotal) * 100,
                  )}
                  % reduction)
                </>
              ) : (
                "No changes from current baseline."
              )}
            </p>
          </div>

          {simResult.savedKg > 0 && (
            <div className="projections-equivalent">
              <h4
                style={{
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "1rem",
                }}
              >
                Equivalent Carbon Savings
              </h4>

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
                onClick={handleApplyScenario}
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  background: "var(--color-sun)",
                  color: "var(--color-canopy-dark)",
                  border: "none",
                  fontWeight: 700,
                }}
              >
                Apply Scenario as Dashboard Baseline
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
