import { describe, it, expect } from "vitest";
import {
  clamp,
  formatNumber,
  formatSigned,
  getDateKey,
  getTodayKey,
  getYesterdayKey,
  getISOWeekInfo,
  getCurrentWeekKey,
  formatHistoryDate,
} from "@/lib/format.js";

describe("format utilities", () => {
  it("clamp works within bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(NaN, 0, 10)).toBe(0);
  });

  it("formatNumber formats with decimals", () => {
    expect(formatNumber(1234.5678, 2)).toBe("1,234.57");
    expect(formatNumber(1000, 0)).toBe("1,000");
    expect(formatNumber(NaN, 2)).toBe("0.00");
    // Test default decimals (undefined)
    expect(formatNumber(1234.5678)).toBe("1,235");
  });

  it("formatSigned adds proper sign", () => {
    expect(formatSigned(5, 0)).toBe("+5");
    expect(formatSigned(-3, 1)).toBe("−3.0");
    expect(formatSigned(0, 2)).toBe("+0.00");
    // Test default decimals (undefined)
    expect(formatSigned(5.2)).toBe("+5");
  });

  it("date helpers generate correct keys", () => {
    const date = new Date("2023-03-15T12:00:00Z");
    expect(getDateKey(date)).toBe("2023-03-15");
    const today = new Date();
    expect(getTodayKey()).toBe(getDateKey(today));
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(getYesterdayKey()).toBe(getDateKey(yesterday));
  });

  it("ISO week info works", () => {
    const info = getISOWeekInfo(new Date("2023-01-04")); // first Wednesday of 2023, week 1
    expect(info.isoYear).toBe(2023);
    expect(info.week).toBe(1);

    // Test Sunday (getUTCDay() === 0)
    const SundayInfo = getISOWeekInfo(new Date("2023-01-08")); // first Sunday of 2023
    expect(SundayInfo.isoYear).toBe(2023);
    expect(SundayInfo.week).toBe(1);

    expect(getCurrentWeekKey()).toMatch(/\d{4}-W\d{2}/);
  });

  it("formatHistoryDate formats ISO strings", () => {
    expect(formatHistoryDate("2023-03-15T00:00:00Z")).toBe("Mar 15");
    expect(formatHistoryDate("invalid")).toBe("");
  });

  it("formatNumber falls back to toFixed on toLocaleString error", () => {
    const originalToLocaleString = Number.prototype.toLocaleString;
    Number.prototype.toLocaleString = function () {
      throw new Error("mock error");
    };
    try {
      expect(formatNumber(1234.5678, 2)).toBe("1234.57");
    } finally {
      Number.prototype.toLocaleString = originalToLocaleString;
    }
  });
});
