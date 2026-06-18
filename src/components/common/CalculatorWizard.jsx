import PropTypes from "prop-types";
import { Stepper } from "@/components/common/Stepper.jsx";
import { FieldRow } from "@/components/common/FieldRow.jsx";
import { Button } from "@/components/common/Button.jsx";
import { BrandMark } from "@/components/common/BrandMark.jsx";
import { ChevronLeft, ChevronRight, Check } from "@/components/icons/index.jsx";
import { CarbonData as Data } from "@/lib/data.js";

/**
 * @typedef {Object} CalculatorWizardProps
 * @property {Object} wizard - The state controller object returned by useCalculatorForm hook.
 * @property {(form: Record<string, any>) => void} onSubmit - Callback invoked on successful calculation.
 * @property {() => void} [onBackToIntro] - Optional callback to render and handle a back-to-intro link.
 * @property {boolean} [showBrandHeader=false] - Whether to show the branded "Contour Wizard" header.
 */

/**
 * Reusable Multi-Step Carbon Footprint Calculator Wizard Component.
 * Consolidates stepper navigation, validation state hooks, field input rows,
 * and the review page summary.
 *
 * @param {CalculatorWizardProps} props
 */
export function CalculatorWizard({
  wizard,
  onSubmit,
  onBackToIntro,
  showBrandHeader = false,
}) {
  const {
    form,
    currentIndex,
    furthestAllowedIndex,
    errors,
    steps,
    currentStep,
    handleChange,
    isStepValid,
    handleNext,
    handleBack,
    handleStepClick,
    isAllValid,
  } = wizard;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAllValid()) {
      onSubmit(form);
    }
  };

  return (
    <div className="calculator-wizard animate-fade-in">
      {showBrandHeader && (
        <div className="welcome-page__calc-header">
          {onBackToIntro && (
            <button className="welcome-page__back-link" onClick={onBackToIntro}>
              <ChevronLeft size={16} /> Back to Intro
            </button>
          )}
          <div className="welcome-page__calc-brand">
            <BrandMark size={32} />
            <span>Contour Wizard</span>
          </div>
        </div>
      )}

      <Stepper
        steps={steps}
        currentIndex={currentIndex}
        furthestAllowedIndex={furthestAllowedIndex}
        onStepClick={handleStepClick}
      />

      <div className="calculator-wizard__content">
        <div className="calculator-wizard__step-header">
          {currentStep.icon && (
            <currentStep.icon
              size={22}
              className="contour-ring--3 calculator-wizard__step-icon"
            />
          )}
          <h3 className="calculator-wizard__step-title">{currentStep.label}</h3>
        </div>
        <p className="hero__lede calculator-wizard__step-intro">
          {currentStep.intro}
        </p>

        {currentStep.id !== "review" ? (
          <div className="calc-fields">
            {currentStep.fields?.map((field) => (
              <FieldRow
                key={field.name}
                field={field}
                value={form[field.name]}
                error={errors[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>
        ) : (
          <div className="review-summary">
            <table className="review-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Input Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="review-category">Transportation</td>
                  <td>
                    Vehicle: {Data.VEHICLE_LABELS[form.vehicleType]} <br />
                    Commute: {form.commuteKmPerDay} km / day <br />
                    Transit: {form.transitKmPerWeek} km / week <br />
                    Flights: {form.flightsShortHaulPerYear} short / yr,{" "}
                    {form.flightsLongHaulPerYear} long / yr
                  </td>
                </tr>
                <tr>
                  <td className="review-category">Electricity</td>
                  <td>
                    Usage: {form.electricityKwhPerMonth} kWh / month <br />
                    Renewable: {form.renewablePercent}%
                  </td>
                </tr>
                <tr>
                  <td className="review-category">Diet</td>
                  <td>Diet: {Data.DIET_LABELS[form.dietType]}</td>
                </tr>
                <tr>
                  <td className="review-category">Waste & Water</td>
                  <td>
                    Waste: {form.wasteKgPerWeek} kg / week (
                    {form.recycledPercent}% recycled) <br />
                    Water: {form.waterLitersPerDay} L / day (
                    {form.waterHeatedMostly ? "heated mostly" : "cold mostly"})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="calc-form__actions">
          {currentIndex > 0 && (
            <Button variant="ghost" icon={ChevronLeft} onClick={handleBack}>
              Back
            </Button>
          )}

          {currentIndex < steps.length - 1 ? (
            <Button
              variant="primary"
              icon={ChevronRight}
              iconPosition="right"
              onClick={handleNext}
              disabled={!isStepValid(currentIndex)}
              className="calculator-wizard__btn-right"
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={Check}
              onClick={handleSubmit}
              className="calculator-wizard__btn-right"
            >
              Calculate Footprint
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

CalculatorWizard.propTypes = {
  wizard: PropTypes.shape({
    form: PropTypes.object.isRequired,
    currentIndex: PropTypes.number.isRequired,
    furthestAllowedIndex: PropTypes.number.isRequired,
    errors: PropTypes.object.isRequired,
    steps: PropTypes.array.isRequired,
    currentStep: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    isStepValid: PropTypes.func.isRequired,
    handleNext: PropTypes.func.isRequired,
    handleBack: PropTypes.func.isRequired,
    handleStepClick: PropTypes.func.isRequired,
    isAllValid: PropTypes.func.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBackToIntro: PropTypes.func,
  showBrandHeader: PropTypes.bool,
};
