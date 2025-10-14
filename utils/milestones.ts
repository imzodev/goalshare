import type { MilestoneItem } from "@/types/goals";

export function sumWeights(items: MilestoneItem[]): number {
  return items.reduce((acc, m) => acc + (Number(m.weight) || 0), 0);
}

export function redistributeWeightsEvenly(items: MilestoneItem[]): MilestoneItem[] {
  const n = items.length;
  if (n === 0) return items;
  const base = Math.floor(100 / n);
  const remainder = 100 - base * n;
  return items.map((m, i) => ({
    ...m,
    weight: i < remainder ? base + 1 : base,
  }));
}

export function applyWeightWithConstraint(items: MilestoneItem[], index: number, desired: number): MilestoneItem[] {
  const next = [...items];
  if (index < 0 || index >= next.length) return next;

  const current = next[index]?.weight ?? 0;
  const target = Math.max(0, Math.min(100, Math.round(desired)));
  if (target === current) return next;

  const sumOthers = next.reduce((acc, m, i) => (i === index ? acc : acc + (Number(m.weight) || 0)), 0);
  const maxAllowed = Math.max(0, 100 - sumOthers);

  if (target <= current || target <= maxAllowed) {
    next[index] = { ...next[index]!, weight: target };
    return next;
  }

  let need = Math.max(0, sumOthers + target - 100);
  if (need > 0) {
    const order = [...Array(next.length).keys()].filter((i) => i !== index);
    order.sort((a, b) => (next[b]?.weight ?? 0) - (next[a]?.weight ?? 0));
    for (const i of order) {
      if (need <= 0) break;
      const w = next[i]?.weight ?? 0;
      if (w <= 0) continue;
      const take = Math.min(w, need);
      next[i] = { ...next[i]!, weight: w - take };
      need -= take;
    }
  }

  const newSumOthers = next.reduce((acc, m, i) => (i === index ? acc : acc + (Number(m.weight) || 0)), 0);
  const capped = Math.min(target, 100 - newSumOthers);
  next[index] = { ...next[index]!, weight: capped };
  return next;
}
