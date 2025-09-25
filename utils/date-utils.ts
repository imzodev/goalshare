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

export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0] ?? date.toISOString();
}

export function calculateDaysLeft(deadline: Date, reference: Date): number {
  const diff = deadline.getTime() - reference.getTime();
  return Math.max(Math.ceil(diff / MS_IN_DAY), 0);
}
