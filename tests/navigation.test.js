import { describe, it, expect } from "vitest";
import { findNavItemByPath, NAV_ITEMS } from "../src/lib/navigation.js";

describe("Navigation config and utility", () => {
  it("should export list of valid navigation items", () => {
    expect(NAV_ITEMS).toBeInstanceOf(Array);
    expect(NAV_ITEMS.length).toBeGreaterThan(0);
    expect(NAV_ITEMS[0]).toHaveProperty("id");
    expect(NAV_ITEMS[0]).toHaveProperty("path");
    expect(NAV_ITEMS[0]).toHaveProperty("label");
  });

  it("should find active nav item based on route pathname prefix", () => {
    const matched = findNavItemByPath("/dashboard/stats");
    expect(matched).toBeDefined();
    expect(matched?.id).toBe("dashboard");

    const matchedLearn = findNavItemByPath("/learn");
    expect(matchedLearn).toBeDefined();
    expect(matchedLearn?.id).toBe("learn");
  });

  it("should return undefined for unmatched or invalid route pathnames", () => {
    expect(findNavItemByPath("/unknown-route")).toBeUndefined();
    expect(findNavItemByPath(null)).toBeUndefined();
    expect(findNavItemByPath(undefined)).toBeUndefined();
    expect(findNavItemByPath(123)).toBeUndefined();
  });
});
