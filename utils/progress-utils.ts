/**
 * Clamps a given value between 0 and 100.
 * If the value is not a finite number, returns 0.
 * @param value - The value to clamp.
 * @returns The clamped value.
 */
export function clampProgress(value: unknown): number {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.min(Math.max(Math.round(numeric), 0), 100);
}
