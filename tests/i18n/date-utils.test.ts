/**
 * Tests for date utility functions with i18n
 */

import { describe, it, expect } from "vitest";
import { formatDeadline, formatRelativeTimeI18n } from "@/utils/date-utils";

describe("Date Utils with i18n", () => {
  describe("formatDeadline", () => {
    it("should return translation key for null deadline", () => {
      expect(formatDeadline(null)).toBe("goals.labels.noDeadline");
    });

    it("should format valid date string", () => {
      const result = formatDeadline("2025-12-31");
      expect(result).not.toBe("goals.labels.noDeadline");
      expect(typeof result).toBe("string");
    });

    it("should return translation key for invalid date", () => {
      expect(formatDeadline("invalid-date")).toBe("goals.labels.noDeadline");
    });

    it("should format date with custom locale", () => {
      const resultES = formatDeadline("2025-12-31", "es-MX");
      const resultEN = formatDeadline("2025-12-31", "en-US");

      expect(resultES).toBeTruthy();
      expect(resultEN).toBeTruthy();
      expect(typeof resultES).toBe("string");
      expect(typeof resultEN).toBe("string");
    });
  });

  describe("formatRelativeTimeI18n", () => {
    const mockT = (key: string, values?: Record<string, number>) => {
      // Remove 'common.time.' prefix if present
      const cleanKey = key.replace("common.time.", "");
      if (values?.count !== undefined) {
        return `${cleanKey}:${values.count}`;
      }
      return cleanKey;
    };

    it("should format recent time as 'just now'", () => {
      const now = new Date();
      const result = formatRelativeTimeI18n(now.toISOString(), mockT);
      expect(result).toBe("justNow");
    });

    it("should format time in minutes", () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatRelativeTimeI18n(fiveMinutesAgo.toISOString(), mockT);
      expect(result).toContain("minutesAgo");
      expect(result).toContain("5");
    });

    it("should format time in hours", () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const result = formatRelativeTimeI18n(threeHoursAgo.toISOString(), mockT);
      expect(result).toContain("hoursAgo");
      expect(result).toContain("3");
    });

    it("should format time in days", () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTimeI18n(sevenDaysAgo.toISOString(), mockT);
      expect(result).toContain("daysAgo");
      expect(result).toContain("7");
    });

    it("should handle invalid date string", () => {
      const result = formatRelativeTimeI18n("invalid-date", mockT);
      expect(result).toBe("justNow");
    });
  });
});
