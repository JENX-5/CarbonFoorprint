import { describe, it, expect } from "vitest";
import { generateInsights } from "../src/lib/insightsEngine.js";

describe("Insights Engine", () => {
  it("should generate relevant recommendations and top drivers", () => {
    const inputs = {
      commuteKmPerDay: 50,
      transitKmPerWeek: 0,
      flightsShortHaulPerYear: 0,
      flightsLongHaulPerYear: 0,
      electricityKwhPerMonth: 500,
      renewablePercent: 0,
      wasteKgPerWeek: 15,
      recycledPercent: 10,
      waterLitersPerDay: 300,
      vehicleType: "petrolCar",
      dietType: "heavyMeat",
      waterHeatedMostly: true,
    };

    const byCategoryAnnual = {
      transportation: 3102.5, // 50 * 0.17 * 365
      electricity: 2280, // 500 * 12 * 0.38
      diet: 912.5, // 2.5 * 365
      waste: 298.0,
      water: 45,
    };

    const report = generateInsights(inputs, byCategoryAnnual);

    expect(report.annualTotal).toBeGreaterThan(0);
    expect(report.topCategory).toBe("transportation");
    expect(report.topShare).toBeGreaterThan(0);
    expect(report.recommendations).toHaveLength(3); // top 3 recommendations sorted by savings

    // Recommendations should have savings details and descriptions
    const rec = report.recommendations[0];
    expect(rec).toHaveProperty("category");
    expect(rec).toHaveProperty("savingsKg");
    expect(rec).toHaveProperty("text");
    expect(rec).toHaveProperty("simulatorPreset");
  });

  it("should sort recommendations by highest carbon savings", () => {
    const inputs = {
      commuteKmPerDay: 5,
      transitKmPerWeek: 0,
      flightsShortHaulPerYear: 0,
      flightsLongHaulPerYear: 0,
      electricityKwhPerMonth: 800, // Very high energy consumption
      renewablePercent: 10,
      wasteKgPerWeek: 2,
      recycledPercent: 90,
      waterLitersPerDay: 100,
      vehicleType: "hybridCar",
      dietType: "vegan", // Low diet footprint
      waterHeatedMostly: false,
    };

    const byCategoryAnnual = {
      transportation: 182.5,
      electricity: 3283.2,
      diet: 365,
      waste: 18,
      water: 10,
    };

    const report = generateInsights(inputs, byCategoryAnnual);
    // Since energy consumption is huge, the Solar Swap recommendation should save the most
    expect(report.recommendations[0].category).toBe("electricity");
  });

  it("should handle zero annualTotal footprint without throwing", () => {
    const inputs = {
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

    const byCategoryAnnual = {
      transportation: 0,
      electricity: 0,
      diet: 0,
      waste: 0,
      water: 0,
    };

    const report = generateInsights(inputs, byCategoryAnnual);
    expect(report.annualTotal).toBe(0);
    expect(report.topShare).toBe(0);
  });
});
