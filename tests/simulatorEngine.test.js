import { describe, it, expect } from "vitest";
import { runSimulation } from "../src/lib/simulatorEngine.js";

describe("Simulator Engine", () => {
  it("should project footprint after adjusting sliders", () => {
    const inputs = {
      commuteKmPerDay: 40,
      transitKmPerWeek: 0,
      flightsShortHaulPerYear: 0,
      flightsLongHaulPerYear: 0,
      electricityKwhPerMonth: 300,
      renewablePercent: 0,
      wasteKgPerWeek: 10,
      recycledPercent: 20,
      waterLitersPerDay: 150,
      vehicleType: "petrolCar",
      dietType: "mediumMeat",
      waterHeatedMostly: false,
    };

    const byCategoryAnnual = {
      transportation: 2482,
      electricity: 1368,
      diet: 730,
      waste: 218,
      water: 16,
    };

    const sliders = {
      driveLessPercent: 50, // 50% driving reduction
      renewableTarget: 100, // Swap to 100% renewables
      dietTarget: "vegetarian", // Swap diet to vegetarian
      wasteReducePercent: 20, // 20% waste reduction
    };

    const projection = runSimulation(inputs, byCategoryAnnual, sliders);

    expect(projection.baselineTotal).toBeGreaterThan(0);
    expect(projection.newTotal).toBeLessThan(projection.baselineTotal);
    expect(projection.savedKg).toBeGreaterThan(0);

    // Projected category emissions should reflect reductions
    expect(projection.byCategory.transportation).toBe(
      byCategoryAnnual.transportation * 0.5,
    );
    expect(projection.byCategory.electricity).toBe(0);
    expect(projection.byCategory.waste).toBe(byCategoryAnnual.waste * 0.8);

    // Tree and Km conversion calculations should match expect values
    expect(projection.equivalentTrees).toBeGreaterThan(0);
    expect(projection.equivalentKm).toBeGreaterThan(0);
  });

  it("should fall back to original baseline diet type when dietTarget is invalid", () => {
    const inputs = {
      commuteKmPerDay: 40,
      transitKmPerWeek: 0,
      flightsShortHaulPerYear: 0,
      flightsLongHaulPerYear: 0,
      electricityKwhPerMonth: 300,
      renewablePercent: 0,
      wasteKgPerWeek: 10,
      recycledPercent: 20,
      waterLitersPerDay: 150,
      vehicleType: "petrolCar",
      dietType: "mediumMeat",
      waterHeatedMostly: false,
    };

    const byCategoryAnnual = {
      transportation: 2482,
      electricity: 1368,
      diet: 730,
      waste: 218,
      water: 16,
    };

    const sliders = {
      driveLessPercent: 50,
      renewableTarget: 100,
      dietTarget: "invalidDietKey",
      wasteReducePercent: 20,
    };

    const projection = runSimulation(inputs, byCategoryAnnual, sliders);
    // Medium meat is 5.63 * 365 = 2054.95
    expect(projection.byCategory.diet).toBeCloseTo(5.63 * 365, 2);
  });
});
