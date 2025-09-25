export function clampProgress(value: unknown): number {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.min(Math.max(Math.round(numeric), 0), 100);
}
