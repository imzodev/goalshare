import type { UserGoalSummary } from "@/types/goals";
import { GOAL_STATUS } from "@/constants/goals";
import { getDaysLeftKey } from "@/utils/i18n-helpers";

/**
 * Get the translation key for days left label
 * Use with useTranslations or getTranslations:
 *
 * const t = useTranslations();
 * const key = getDaysLeftLabel(status, daysLeft);
 * const label = key.includes("{count}")
 *   ? t(key, { count: daysLeft })
 *   : t(key);
 */
export function getDaysLeftLabel(status: UserGoalSummary["status"], daysLeft: number | null): string {
  const isCompleted = status === GOAL_STATUS.COMPLETED;
  return getDaysLeftKey(daysLeft, isCompleted);
}

/**
 * Get the translated days left label with translation function
 * Usage in components:
 *
 * const t = useTranslations();
 * const label = getDaysLeftLabelI18n(status, daysLeft, t);
 */
export function getDaysLeftLabelI18n(
  status: UserGoalSummary["status"],
  daysLeft: number | null,
  t: (key: string, values?: Record<string, number>) => string
): string {
  const key = getDaysLeftLabel(status, daysLeft);
  // Translator must be scoped to 'goals.labels'
  if (key === "multipleDays" && daysLeft !== null) {
    return t(key, { count: daysLeft });
  }
  return t(key);
}
