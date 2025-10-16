/**
 * Tests for i18n helper functions
 * Validates that helper functions return correct translation keys
 */

import { describe, it, expect } from "vitest";
import {
  getGoalTypeKey,
  getGoalTypeDescriptionKey,
  getGoalStatusKey,
  getDaysLeftKey,
  getRelativeTimeKey,
} from "@/utils/i18n-helpers";
import { GOAL_TYPE, GOAL_STATUS } from "@/constants/goals";

describe("i18n Helper Functions", () => {
  describe("getGoalTypeKey", () => {
    it("should return 'metric' for GOAL_TYPE.METRIC", () => {
      expect(getGoalTypeKey(GOAL_TYPE.METRIC)).toBe("metric");
    });

    it("should return 'milestone' for GOAL_TYPE.MILESTONE", () => {
      expect(getGoalTypeKey(GOAL_TYPE.MILESTONE)).toBe("milestone");
    });

    it("should return 'checkin' for GOAL_TYPE.CHECKIN", () => {
      expect(getGoalTypeKey(GOAL_TYPE.CHECKIN)).toBe("checkin");
    });

    it("should return 'manual' for GOAL_TYPE.MANUAL", () => {
      expect(getGoalTypeKey(GOAL_TYPE.MANUAL)).toBe("manual");
    });

    it("should return 'manual' for unknown type", () => {
      expect(getGoalTypeKey("unknown")).toBe("manual");
    });
  });

  describe("getGoalStatusKey", () => {
    it("should return 'pending' for GOAL_STATUS.PENDING", () => {
      expect(getGoalStatusKey(GOAL_STATUS.PENDING)).toBe("pending");
    });

    it("should return 'completed' for GOAL_STATUS.COMPLETED", () => {
      expect(getGoalStatusKey(GOAL_STATUS.COMPLETED)).toBe("completed");
    });

    it("should return 'pending' for unknown status", () => {
      expect(getGoalStatusKey("unknown")).toBe("pending");
    });
  });

  describe("getDaysLeftKey", () => {
    it("should return 'completed' when isCompleted is true", () => {
      expect(getDaysLeftKey(10, true)).toBe("completed");
      expect(getDaysLeftKey(null, true)).toBe("completed");
    });

    it("should return 'noDeadline' when daysLeft is null", () => {
      expect(getDaysLeftKey(null, false)).toBe("noDeadline");
    });

    it("should return 'dueToday' when daysLeft is 0", () => {
      expect(getDaysLeftKey(0, false)).toBe("dueToday");
    });

    it("should return 'singleDay' when daysLeft is 1", () => {
      expect(getDaysLeftKey(1, false)).toBe("singleDay");
    });

    it("should return 'multipleDays' when daysLeft is greater than 1", () => {
      expect(getDaysLeftKey(2, false)).toBe("multipleDays");
      expect(getDaysLeftKey(10, false)).toBe("multipleDays");
      expect(getDaysLeftKey(100, false)).toBe("multipleDays");
    });
  });

  describe("getRelativeTimeKey", () => {
    it("should return 'justNow' for time less than 1 minute", () => {
      const result = getRelativeTimeKey(30000); // 30 seconds
      expect(result.key).toBe("common.time.justNow");
      expect(result.value).toBeUndefined();
    });

    it("should return 'minutesAgo' for time less than 1 hour", () => {
      const result = getRelativeTimeKey(5 * 60 * 1000); // 5 minutes
      expect(result.key).toBe("common.time.minutesAgo");
      expect(result.value).toBe(5);
    });

    it("should return 'hoursAgo' for time less than 1 day", () => {
      const result = getRelativeTimeKey(3 * 60 * 60 * 1000); // 3 hours
      expect(result.key).toBe("common.time.hoursAgo");
      expect(result.value).toBe(3);
    });

    it("should return 'daysAgo' for time less than 30 days", () => {
      const result = getRelativeTimeKey(7 * 24 * 60 * 60 * 1000); // 7 days
      expect(result.key).toBe("common.time.daysAgo");
      expect(result.value).toBe(7);
    });
  });

  describe("Helper functions return valid keys", () => {
    it("should return keys without namespace prefix", () => {
      expect(getGoalTypeKey(GOAL_TYPE.METRIC)).not.toContain("goals.types");
      expect(getGoalStatusKey(GOAL_STATUS.PENDING)).not.toContain("goals.status");
      expect(getDaysLeftKey(5, false)).not.toContain("goals.labels");
    });

    it("should return consistent key format", () => {
      const typeKey = getGoalTypeKey(GOAL_TYPE.METRIC);
      const statusKey = getGoalStatusKey(GOAL_STATUS.PENDING);
      const daysKey = getDaysLeftKey(5, false);

      expect(typeKey).toMatch(/^[a-z][a-zA-Z]*$/);
      expect(statusKey).toMatch(/^[a-z][a-zA-Z]*$/);
      expect(daysKey).toMatch(/^[a-z][a-zA-Z]*$/);
    });
  });
});
