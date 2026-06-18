import PropTypes from "prop-types";

/**
 * @typedef {Object} BenchmarkBarProps
 * @property {number} annual - Annual carbon footprint in kg CO2e.
 */

/**
 * BenchmarkBar component. Displays a colored bar comparing user's footprint to standard benchmarks.
 *
 * @param {BenchmarkBarProps} props
 */
export function BenchmarkBar({ annual }) {
  const maxScale = 10000;
  const percentage = Math.min((annual / maxScale) * 100, 100);

  // Define benchmarks in kg
  const sustainableTarget = 1500;
  const globalAverage = 4700;

  const sustainablePct = (sustainableTarget / maxScale) * 100;
  const globalAveragePct = (globalAverage / maxScale) * 100;

  return (
    <div className="benchmark-container">
      <style>{`
        .benchmark-container {
          padding: 1rem 0;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .benchmark-track-wrapper {
          position: relative;
          margin: 2.5rem 0 1.5rem;
          height: 12px;
        }
        .benchmark-track {
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background: linear-gradient(
            to right,
            #52b788 0%, 
            #52b788 ${sustainablePct}%, 
            #f3a712 ${sustainablePct}%, 
            #f3a712 ${globalAveragePct}%, 
            #d90429 ${globalAveragePct}%, 
            #d90429 100%
          );
          opacity: 0.85;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
        }
        .benchmark-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-moss, #1b4332);
          border: 3px solid #ffffff;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          transition: left 0.5s ease-out;
          z-index: 10;
        }
        .benchmark-marker::after {
          content: '';
          position: absolute;
          width: 2px;
          height: 24px;
          background: var(--color-moss, #1b4332);
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
        }
        .benchmark-tooltip {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-moss, #1b4332);
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        .benchmark-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: var(--color-moss, #1b4332);
        }
        .benchmark-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--color-muted, #666);
          position: relative;
          padding-top: 4px;
        }
        .benchmark-label-item {
          position: absolute;
          transform: translateX(-50%);
          text-align: center;
          white-space: nowrap;
        }
        .benchmark-label-item--start {
          left: 0;
          transform: none;
          text-align: left;
        }
        .benchmark-label-item--end {
          right: 0;
          transform: none;
          text-align: right;
        }
        .benchmark-label-item--sust {
          left: ${sustainablePct}%;
        }
        .benchmark-label-item--avg {
          left: ${globalAveragePct}%;
        }
        .benchmark-summary {
          margin-top: 1.5rem;
          font-size: 0.85rem;
          line-height: 1.4;
          color: var(--color-text, #333);
        }
        .rating-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
      `}</style>
      <div className="benchmark-track-wrapper">
        <div className="benchmark-track" />
        <div className="benchmark-marker" style={{ left: `${percentage}%` }}>
          <div className="benchmark-tooltip">
            You: {annual.toLocaleString()} kg
          </div>
        </div>
      </div>
      <div className="benchmark-labels">
        <span className="benchmark-label-item benchmark-label-item--start">
          0 kg
        </span>
        <span className="benchmark-label-item benchmark-label-item--sust">
          <strong>Sustainable</strong>
          <br />
          1,500 kg
        </span>
        <span className="benchmark-label-item benchmark-label-item--avg">
          <strong>Global Avg</strong>
          <br />
          4,700 kg
        </span>
        <span className="benchmark-label-item benchmark-label-item--end">
          10,000+ kg
        </span>
      </div>

      <div className="benchmark-summary">
        {annual <= sustainableTarget ? (
          <p>
            Outstanding! Your footprint is below the sustainable target of{" "}
            {sustainableTarget.toLocaleString()} kg CO2e. You are living within
            safe planetary boundaries.
          </p>
        ) : annual <= globalAverage ? (
          <p>
            Good job! Your footprint is above the sustainable target but below
            the global average of {globalAverage.toLocaleString()} kg CO2e. Keep
            making improvements to reach the green zone.
          </p>
        ) : (
          <p>
            Alert: Your footprint is above the global average of{" "}
            {globalAverage.toLocaleString()} kg CO2e. Explore the **AI
            Insights** or **Scenario Simulator** to find impactful reductions.
          </p>
        )}
      </div>
    </div>
  );
}

BenchmarkBar.propTypes = {
  annual: PropTypes.number.isRequired,
};
