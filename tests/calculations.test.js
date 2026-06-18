import { describe, it, expect } from "vitest";
import {
  computeFootprint,
  validateField,
  DEFAULT_CALCULATOR_INPUTS,
} from "@/lib/calculations.js";

describe("Calculations Engine", () => {
  describe("validateField", () => {
    it("should validate commute distance driven per day", () => {
      expect(validateField("commuteKmPerDay", "")).toContain("required");
      expect(validateField("commuteKmPerDay", "abc")).toContain(
        "must be a number",
      );
      expect(validateField("commuteKmPerDay", -10)).toContain(
        "Enter a value between",
      );
      expect(validateField("commuteKmPerDay", 600)).toContain(
        "Enter a value between",
      );
      expect(validateField("commuteKmPerDay", 100)).toBe("");
    });

    it("should validate renewable electricity percentage", () => {
      expect(validateField("renewablePercent", -5)).toContain(
        "Enter a value between",
      );
      expect(validateField("renewablePercent", 105)).toContain(
        "Enter a value between",
      );
      expect(validateField("renewablePercent", 50)).toBe("");
    });

    it("should return empty string for unknown field", () => {
      expect(validateField("unknownField", 100)).toBe("");
    });
  });

  describe("computeFootprint", () => {
    it("should calculate footprint correctly for default values", () => {
      const results = computeFootprint(DEFAULT_CALCULATOR_INPUTS);
      expect(results).toHaveProperty("annual");
      expect(results).toHaveProperty("monthly");
      expect(results).toHaveProperty("daily");
      expect(results).toHaveProperty("byCategoryAnnual");

      // The calculations should be mathematically sound and above 0
      expect(results.annual).toBeGreaterThan(0);
      expect(results.byCategoryAnnual.transportation).toBeGreaterThan(0);
      expect(results.byCategoryAnnual.electricity).toBeGreaterThan(0);
      expect(results.byCategoryAnnual.diet).toBeGreaterThan(0);
      expect(results.byCategoryAnnual.waste).toBeGreaterThan(0);
      expect(results.byCategoryAnnual.water).toBeGreaterThan(0);
    });

    it("should handle zero emissions inputs", () => {
      const zeroInputs = {
        commuteKmPerDay: 0,
        transitKmPerWeek: 0,
        flightsShortHaulPerYear: 0,
        flightsLongHaulPerYear: 0,
        electricityKwhPerMonth: 0,
        renewablePercent: 100,
        wasteKgPerWeek: 0,
        recycledPercent: 100,
        waterLitersPerDay: 0,
        vehicleType: "electricCar",
        dietType: "vegan",
        waterHeatedMostly: false,
      };

      const results = computeFootprint(zeroInputs);
      expect(results.byCategoryAnnual.transportation).toBe(0);
      expect(results.byCategoryAnnual.electricity).toBe(0);
      // Vegan diet factor is 2.89 * 365
      expect(results.byCategoryAnnual.diet).toBe(2.89 * 365);
      expect(results.byCategoryAnnual.waste).toBe(0);
      expect(results.byCategoryAnnual.water).toBe(0);
    });

    it("should fallback for invalid vehicleType and dietType", () => {
      const invalidInputs = {
        ...DEFAULT_CALCULATOR_INPUTS,
        vehicleType: "nonExistentVehicle",
        dietType: "nonExistentDiet",
      };
      const results = computeFootprint(invalidInputs);
      expect(results.byCategoryAnnual.transportation).toBe(
        invalidInputs.transitKmPerWeek * 0.1 * 52, // publicTransit = 0.1 usually, transitKmPerWeek is 0
      );
      expect(results.byCategoryAnnual.diet).toBeGreaterThan(0);
    });

    it("should calculate footprint when waterHeatedMostly is true", () => {
      const inputs = {
        ...DEFAULT_CALCULATOR_INPUTS,
        waterHeatedMostly: true,
      };
      const results = computeFootprint(inputs);
      expect(results.byCategoryAnnual.water).toBeGreaterThan(0);
    });
  });
});
