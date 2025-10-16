/**
 * Helper functions for i18n translations
 * These functions help translate dynamic content like goal types, statuses, etc.
 */

import { GOAL_TYPE, GOAL_STATUS } from "@/constants/goals";

/**
 * Get the translation key for a goal type
 */
export function getGoalTypeKey(type: string): string {
  switch (type) {
    case GOAL_TYPE.METRIC:
      return "metric";
    case GOAL_TYPE.MILESTONE:
      return "milestone";
    case GOAL_TYPE.CHECKIN:
      return "checkin";
    case GOAL_TYPE.MANUAL:
      return "manual";
    default:
      return "manual";
  }
}

/**
 * Get the translation key for a goal type description
 */
export function getGoalTypeDescriptionKey(type: string): string {
  switch (type) {
    case GOAL_TYPE.METRIC:
      return "metric";
    case GOAL_TYPE.MILESTONE:
      return "milestone";
    case GOAL_TYPE.CHECKIN:
      return "checkin";
    case GOAL_TYPE.MANUAL:
      return "manual";
    default:
      return "manual";
  }
}

/**
 * Get the translation key for a goal status
 */
export function getGoalStatusKey(status: string): string {
  switch (status) {
    case GOAL_STATUS.PENDING:
      return "pending";
    case GOAL_STATUS.COMPLETED:
      return "completed";
    default:
      return "pending";
  }
}

/**
 * Get the translation key for days left label
 */
export function getDaysLeftKey(daysLeft: number | null, isCompleted: boolean): string {
  if (isCompleted) {
    return "completed";
  }
  if (daysLeft === null) {
    return "noDeadline";
  }
  if (daysLeft === 0) {
    return "dueToday";
  }
  if (daysLeft === 1) {
    return "singleDay";
  }
  return "multipleDays";
}

/**
 * Get the translation key for relative time
 */
export function getRelativeTimeKey(ms: number): { key: string; value?: number } {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (ms < 60000) {
    return { key: "common.time.justNow" };
  }
  if (minutes < 60) {
    return { key: "common.time.minutesAgo", value: minutes };
  }
  if (hours < 24) {
    return { key: "common.time.hoursAgo", value: hours };
  }
  if (days < 30) {
    return { key: "common.time.daysAgo", value: days };
  }
  if (months < 12) {
    return { key: "common.time.monthsAgo", value: months };
  }
  return { key: "common.time.yearsAgo", value: years };
}
