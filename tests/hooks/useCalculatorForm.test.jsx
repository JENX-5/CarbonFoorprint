import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCalculatorForm } from "@/hooks/useCalculatorForm.js";
import { DEFAULT_INPUTS } from "@/lib/constants.js";

describe("useCalculatorForm hook", () => {
  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    expect(result.current.form).toEqual(DEFAULT_INPUTS);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.furthestAllowedIndex).toBe(0);
    expect(result.current.errors).toEqual({});
    expect(result.current.steps).toBeDefined();
    expect(result.current.currentStep).toBeDefined();
  });

  it("should handle standard field change and validate correct values", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    act(() => {
      result.current.handleChange({
        target: { name: "vehicleType", value: "hybridCar", type: "text" },
      });
    });

    expect(result.current.form.vehicleType).toBe("hybridCar");
  });

  it("should handle number field changes and convert strings to number", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    act(() => {
      result.current.handleChange({
        target: { name: "commuteKmPerDay", value: "25", type: "number" },
      });
    });

    expect(result.current.form.commuteKmPerDay).toBe(25);
    expect(result.current.errors.commuteKmPerDay).toBeUndefined();
  });

  it("should handle checkbox field changes", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    act(() => {
      result.current.handleChange({
        target: { name: "waterHeatedMostly", checked: true, type: "checkbox" },
      });
    });

    expect(result.current.form.waterHeatedMostly).toBe(true);
  });

  it("should validate empty number inputs", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    act(() => {
      result.current.handleChange({
        target: { name: "commuteKmPerDay", value: "", type: "number" },
      });
    });

    expect(result.current.errors.commuteKmPerDay).toBe(
      "This field is required",
    );
  });

  it("should validate number values out of bounds (above max)", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    // commuteKmPerDay step fields min is 0, max is 500
    act(() => {
      result.current.handleChange({
        target: { name: "commuteKmPerDay", value: "1000", type: "number" },
      });
    });

    expect(result.current.errors.commuteKmPerDay).toBe(
      "Must be between 0 and 500 km",
    );
  });

  it("should validate number values below min", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    act(() => {
      result.current.handleChange({
        target: { name: "commuteKmPerDay", value: "-10", type: "number" },
      });
    });

    expect(result.current.errors.commuteKmPerDay).toBe(
      "Must be between 0 and 500 km",
    );
  });

  it("should validate number values out of bounds on field without unit", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    // flightsShortHaulPerYear is in step 0, min is 0, max is 100, no unit
    act(() => {
      result.current.handleChange({
        target: {
          name: "flightsShortHaulPerYear",
          value: "150",
          type: "number",
        },
      });
    });

    expect(result.current.errors.flightsShortHaulPerYear).toBe(
      "Must be between 0 and 100 ",
    );
  });

  it("should navigate forward and backward", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    // default inputs should be valid, so handleNext should work
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.furthestAllowedIndex).toBe(1);

    act(() => {
      result.current.handleBack();
    });

    expect(result.current.currentIndex).toBe(0);

    // handleBack at 0 does nothing
    act(() => {
      result.current.handleBack();
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it("should allow step clicking within furthest allowed boundary", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(1);

    act(() => {
      result.current.handleStepClick(0);
    });

    expect(result.current.currentIndex).toBe(0);

    // cannot click step 2 because furthest allowed is 1
    act(() => {
      result.current.handleStepClick(2);
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("should validate steps properly via isStepValid and isAllValid", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    // Test successful validation of all steps
    let validSuccess;
    act(() => {
      validSuccess = result.current.isAllValid();
    });
    expect(validSuccess).toBe(true);

    // Make state invalid
    act(() => {
      result.current.handleChange({
        target: { name: "commuteKmPerDay", value: "1000", type: "number" },
      });
    });

    // Step 0 should be invalid now
    expect(result.current.isStepValid(0)).toBe(false);

    // Should not allow transitioning next
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.currentIndex).toBe(0);

    // isAllValid should return false and reset index to 0
    let validFailure;
    act(() => {
      validFailure = result.current.isAllValid();
    });
    expect(validFailure).toBe(false);
    expect(result.current.currentIndex).toBe(0);
  });

  it("should return true for isStepValid if step or step.fields is not defined", () => {
    const { result } = renderHook(() => useCalculatorForm(DEFAULT_INPUTS));

    // step 4 (the review step) has no fields, so it should be valid
    expect(result.current.isStepValid(4)).toBe(true);

    // step 999 does not exist, so it should return true
    expect(result.current.isStepValid(999)).toBe(true);
  });
});
