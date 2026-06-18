import PropTypes from "prop-types";
import { CarbonData as Data } from "@/lib/data.js";

/**
 * @typedef {Object} SimulatorSlidersProps
 * @property {Record<string, any>} sliders - The current slider levels.
 * @property {(field: string, value: any) => void} onSliderChange - Callback triggered when a slider is moved or dropdown changes.
 */

/**
 * SimulatorSliders Component.
 * Renders the input configuration controls (ranges and selectors) for the Scenario Simulator.
 *
 * @param {SimulatorSlidersProps} props
 */
export function SimulatorSliders({ sliders, onSliderChange }) {
  return (
    <div className="slider-card">
      <h3 className="slider-card__title">Adjust Scenario Sliders</h3>

      <div className="slider-group">
        <div className="slider-header">
          <label htmlFor="slider-drive-less">Reduce driving distance</label>
          <span className="slider-value">{sliders.driveLessPercent}% less</span>
        </div>
        <input
          id="slider-drive-less"
          type="range"
          min="0"
          max="100"
          step="5"
          value={sliders.driveLessPercent}
          onChange={(e) =>
            onSliderChange("driveLessPercent", Number(e.target.value))
          }
          className="range-input"
        />
        <p className="slider-card__desc">
          Avoid trips, work from home, walk, or cycle to lower transport
          emissions.
        </p>
      </div>

      <div className="slider-group">
        <div className="slider-header">
          <label htmlFor="slider-renewable-target">
            Renewable electricity share
          </label>
          <span className="slider-value">{sliders.renewableTarget}% share</span>
        </div>
        <input
          id="slider-renewable-target"
          type="range"
          min="0"
          max="100"
          step="5"
          value={sliders.renewableTarget}
          onChange={(e) =>
            onSliderChange("renewableTarget", Number(e.target.value))
          }
          className="range-input"
        />
        <p className="slider-card__desc">
          Increase your household electricity coming from solar panels or clean
          energy providers.
        </p>
      </div>

      <div className="slider-group">
        <div className="slider-header">
          <label htmlFor="slider-diet-target">Dietary patterns change</label>
        </div>
        <select
          id="slider-diet-target"
          value={sliders.dietTarget}
          onChange={(e) => onSliderChange("dietTarget", e.target.value)}
          className="select-input"
        >
          {Object.entries(Data.DIET_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <p className="slider-card__desc">
          Switch to lower carbon footprint meal plans (e.g. vegetarian, low
          meat, or vegan).
        </p>
      </div>

      <div className="slider-group slider-group--last">
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
            onSliderChange("wasteReducePercent", Number(e.target.value))
          }
          className="range-input"
        />
        <p className="slider-card__desc">
          Generate less waste or recycle/compost a larger portion.
        </p>
      </div>
    </div>
  );
}

SimulatorSliders.propTypes = {
  sliders: PropTypes.shape({
    driveLessPercent: PropTypes.number.isRequired,
    renewableTarget: PropTypes.number.isRequired,
    dietTarget: PropTypes.string.isRequired,
    wasteReducePercent: PropTypes.number.isRequired,
  }).isRequired,
  onSliderChange: PropTypes.func.isRequired,
};
