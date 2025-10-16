import { getRelativeTimeKey } from "@/utils/i18n-helpers";

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

/**
 * Formats a Date to an <input type="date" /> compatible string (YYYY-MM-DD).
 */
export function toInputDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 0-indexed -> 1..12
  const d = date.getDate();
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Adds a number of days to a base date (default: today). */
export function addDaysFrom(base: Date = new Date(), days: number = 0): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Adds months to a base date (default: today). If the target month has fewer days,
 * it will clamp to the last valid day of that month.
 */
export function addMonthsFrom(base: Date = new Date(), months: number = 0): Date {
  const d = new Date(base);
  const currentDate = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== currentDate) {
    // Overflowed (e.g., Jan 31 + 1 month -> Mar 3). Set to last day of previous month.
    d.setDate(0);
  }
  return d;
}

/**
 * Adds years to a base date (default: today). Handles Feb 29 and similar cases by
 * clamping to the last valid day of the month if needed.
 */
export function addYearsFrom(base: Date = new Date(), years: number = 0): Date {
  const d = new Date(base);
  const currentDate = d.getDate();
  d.setFullYear(d.getFullYear() + years);
  if (d.getDate() !== currentDate) {
    d.setDate(0);
  }
  return d;
}

export function calculateDaysLeft(deadline: Date, reference: Date): number {
  const diff = deadline.getTime() - reference.getTime();
  return Math.max(Math.ceil(diff / MS_IN_DAY), 0);
}

/**
 * Format deadline for display
 * Returns the translation key if no deadline, otherwise formats the date
 * using Intl.DateTimeFormat with the current locale
 */
export function formatDeadline(deadline: string | null, locale: string = "es-MX"): string {
  if (!deadline) {
    return "goals.labels.noDeadline"; // Return translation key
  }

  const [year, month, day] = deadline.split("-").map((value) => Number.parseInt(value, 10));
  if (!year || !month || !day) {
    return "goals.labels.noDeadline"; // Return translation key
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) {
    return "goals.labels.noDeadline"; // Return translation key
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit" as const,
    month: "short" as const,
    year: "numeric" as const,
  }).format(date);
}

/**
 * Format relative time using i18n
 * Returns an object with the translation key and optional value
 * Usage:
 * const { key, value } = formatRelativeTime(timestamp);
 * const label = value ? t(key, { count: value }) : t(key);
 */
export function formatRelativeTime(timestamp: string): { key: string; value?: number } {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return { key: "common.time.justNow" };
  }

  const diffMs = Date.now() - date.getTime();
  return getRelativeTimeKey(diffMs);
}

/**
 * Format relative time with translation function
 * Usage in components:
 * const t = useTranslations();
 * const label = formatRelativeTimeI18n(timestamp, t);
 */
export function formatRelativeTimeI18n(
  timestamp: string,
  t: (key: string, values?: Record<string, number>) => string
): string {
  const { key, value } = formatRelativeTime(timestamp);
  return value ? t(key, { count: value }) : t(key);
}
