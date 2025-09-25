import type { UserGoalSummary } from "@/types/goals";
import { GOAL_STATUS, DAYS_LEFT_LABELS } from "@/constants/goals";

export function getDaysLeftLabel(status: UserGoalSummary["status"], daysLeft: number | null): string {
  if (status === GOAL_STATUS.COMPLETED) {
    return DAYS_LEFT_LABELS.COMPLETED;
  }

  if (daysLeft === null) {
    return DAYS_LEFT_LABELS.NO_DEADLINE;
  }

  if (daysLeft <= 0) {
    return DAYS_LEFT_LABELS.DUE_TODAY;
  }

  if (daysLeft === 1) {
    return DAYS_LEFT_LABELS.SINGLE_DAY;
  }

  return `${daysLeft} ${DAYS_LEFT_LABELS.MULTIPLE_DAYS_SUFFIX}`;
}
