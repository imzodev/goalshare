import { DATE_FORMAT, RELATIVE_TIME_LABELS, DEADLINE_LABELS, TIME_THRESHOLDS } from "@/constants/goals";

const MS_IN_DAY = 1000 * 60 * 60 * 24;

export function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Returns the number of weeks (ceil) from `from` to the `dueDate` string (YYYY-MM-DD).
 * If `dueDate` is falsy or invalid, returns null.
 */
export function weeksUntil(dueDate?: string | null, from: Date = new Date()): number | null {
  if (!dueDate) return null;
  const parsed = toDate(`${dueDate}T00:00:00`);
  if (!parsed) return null;
  const diffMs = parsed.getTime() - from.getTime();
  const weeks = Math.ceil(diffMs / (MS_IN_DAY * 7));
  return weeks;
}

export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0] ?? date.toISOString();
}

export function calculateDaysLeft(deadline: Date, reference: Date): number {
  const diff = deadline.getTime() - reference.getTime();
  return Math.max(Math.ceil(diff / MS_IN_DAY), 0);
}

export function formatDeadline(deadline: string | null): string {
  if (!deadline) {
    return DEADLINE_LABELS.NO_DEADLINE;
  }

  const [year, month, day] = deadline.split("-").map((value) => Number.parseInt(value, 10));
  if (!year || !month || !day) {
    return DEADLINE_LABELS.NO_DEADLINE;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) {
    return DEADLINE_LABELS.NO_DEADLINE;
  }

  return new Intl.DateTimeFormat(DATE_FORMAT.LOCALE, {
    day: DATE_FORMAT.DAY,
    month: DATE_FORMAT.MONTH,
    year: DATE_FORMAT.YEAR,
  }).format(date);
}

export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Date.now() - date.getTime();
  if (diffMs < TIME_THRESHOLDS.JUST_NOW_MS) {
    return RELATIVE_TIME_LABELS.JUST_NOW;
  }

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) {
    return `${RELATIVE_TIME_LABELS.MINUTES_PREFIX} ${minutes} ${RELATIVE_TIME_LABELS.MINUTES_SUFFIX}`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${RELATIVE_TIME_LABELS.HOURS_PREFIX} ${hours} ${RELATIVE_TIME_LABELS.HOURS_SUFFIX}`;
  }

  const days = Math.round(hours / 24);
  if (days < 30) {
    return `${RELATIVE_TIME_LABELS.DAYS_PREFIX} ${days} ${RELATIVE_TIME_LABELS.DAYS_SUFFIX}`;
  }

  const months = Math.round(days / 30);
  if (months < 12) {
    return `${RELATIVE_TIME_LABELS.MONTHS_PREFIX} ${months} ${RELATIVE_TIME_LABELS.MONTHS_SUFFIX}`;
  }

  const years = Math.round(months / 12);
  return `${RELATIVE_TIME_LABELS.YEARS_PREFIX} ${years} ${RELATIVE_TIME_LABELS.YEARS_SUFFIX}`;
}
