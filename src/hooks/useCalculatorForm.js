import { useState } from "react";
import { CALCULATOR_STEPS } from "../pages/calculator/calculatorSteps.js";

/**
 * Custom hook to manage the state and logic of the carbon calculator wizard.
 *
 * @param {Object} initialForm - The initial values for the calculator form inputs.
 * @returns {Object} An object containing wizard states, steps, handlers, and validation methods.
 */
export function useCalculatorForm(initialForm) {
  const [form, setForm] = useState(initialForm);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [furthestAllowedIndex, setFurthestAllowedIndex] = useState(0);
  const [errors, setErrors] = useState({});

  const steps = CALCULATOR_STEPS;
  const currentStep = steps[currentIndex];

  /**
   * Handles changes for input fields, including standardizing types and validating number ranges.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The change event.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val =
      type === "checkbox"
        ? checked
        : type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value;

    // Update form state
    const updatedForm = { ...form, [name]: val };
    setForm(updatedForm);

    // Validate the field on change if configuration exists
    const fieldConf = currentStep.fields?.find((f) => f.name === name);
    if (fieldConf && type === "number") {
      if (value === "") {
        setErrors((prev) => ({
          ...prev,
          [name]: "This field is required",
        }));
      } else if (val < fieldConf.min || val > fieldConf.max) {
        setErrors((prev) => ({
          ...prev,
          [name]: `Must be between ${fieldConf.min} and ${fieldConf.max} ${fieldConf.unit || ""}`,
        }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    }
  };

  /**
   * Checks if all fields in a specific step index are valid.
   *
   * @param {number} index - The index of the step to validate.
   * @returns {boolean} True if the step is valid; otherwise false.
   */
  const isStepValid = (index) => {
    const step = steps[index];
    if (!step || !step.fields) return true; // Steps without fields (e.g. review step) are valid.

    for (const field of step.fields) {
      if (field.type === "number") {
        const val = form[field.name];
        if (
          val === "" ||
          val === undefined ||
          val === null ||
          isNaN(val) ||
          val < field.min ||
          val > field.max
        ) {
          return false;
        }
      }
    }
    return true;
  };

  /**
   * Transitions to the next step if the current step is valid.
   */
  const handleNext = () => {
    if (isStepValid(currentIndex)) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setFurthestAllowedIndex((prev) => Math.max(prev, nextIndex));
    }
  };

  /**
   * Transitions back to the previous step if not at the start.
   */
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  /**
   * Navigates to a specific step index if it is within the furthest allowed boundary.
   *
   * @param {number} index - The step index to navigate to.
   */
  const handleStepClick = (index) => {
    if (index <= furthestAllowedIndex) {
      setCurrentIndex(index);
    }
  };

  /**
   * Validates all wizard steps.
   * If an invalid step is found, redirects the wizard to that step.
   *
   * @returns {boolean} True if all steps are valid; otherwise false.
   */
  const isAllValid = () => {
    for (let i = 0; i < steps.length - 1; i++) {
      if (!isStepValid(i)) {
        setCurrentIndex(i);
        return false;
      }
    }
    return true;
  };

  return {
    form,
    setForm,
    currentIndex,
    setCurrentIndex,
    furthestAllowedIndex,
    setFurthestAllowedIndex,
    errors,
    setErrors,
    steps,
    currentStep,
    handleChange,
    isStepValid,
    handleNext,
    handleBack,
    handleStepClick,
    isAllValid,
  };
}
