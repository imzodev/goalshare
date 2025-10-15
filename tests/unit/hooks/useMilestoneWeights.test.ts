import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMilestoneWeights } from "@/hooks/useMilestoneWeights";
import type { MilestoneItem } from "@/types/goals";
import { useState } from "react";

function setup(initial: MilestoneItem[] = []) {
  const { result } = renderHook(
    ({ init }) => {
      const [items, setItems] = useState<MilestoneItem[]>(init);
      const hook = useMilestoneWeights(items, setItems);
      return { hook, items };
    },
    { initialProps: { init: initial } }
  );
  return result;
}

describe("useMilestoneWeights", () => {
  it("calcula weightSum correctamente", () => {
    const result = setup([
      { title: "M1", weight: 20 },
      { title: "M2", weight: 30 },
      { title: "M3", weight: 50 },
    ]);
    expect(result.current.hook.weightSum).toBe(100);
  });

  it("setWeightWithConstraint mantiene 0-100 y redistribuye si excede", () => {
    const result = setup([
      { title: "M1", weight: 60 },
      { title: "M2", weight: 30 },
      { title: "M3", weight: 10 },
    ]);

    act(() => result.current.hook.setWeightWithConstraint(0, 90));

    const sum = result.current.items.reduce((a, m) => a + (m.weight || 0), 0);
    expect(sum).toBe(100);
    expect(result.current.items[0].weight).toBeGreaterThanOrEqual(60);
    expect(result.current.items[0].weight).toBeLessThanOrEqual(100);
  });

  it("setWeightWithConstraint limita valores negativos y mayores a 100", () => {
    const result = setup([
      { title: "M1", weight: 50 },
      { title: "M2", weight: 50 },
    ]);

    act(() => result.current.hook.setWeightWithConstraint(0, -20));
    expect(result.current.items[0].weight).toBe(0);

    act(() => result.current.hook.setWeightWithConstraint(1, 999));
    const sum = result.current.items[0].weight + result.current.items[1].weight;
    expect(sum).toBe(100);
    expect(result.current.items[1].weight).toBeLessThanOrEqual(100);
  });

  it("redistributeWeights reparte equitativamente y suma 100%", () => {
    const result = setup([
      { title: "M1", weight: 10 },
      { title: "M2", weight: 10 },
      { title: "M3", weight: 10 },
      { title: "M4", weight: 70 },
    ]);

    act(() => result.current.hook.redistributeWeights());

    const sum = result.current.items.reduce((a, m) => a + (m.weight || 0), 0);
    expect(sum).toBe(100);
    // 4 items => distribución equitativa (25 cada uno)
    result.current.items.forEach((m) => expect(m.weight).toBe(25));
  });

  it("maneja array vacío y un solo milestone", () => {
    const empty = setup([]);
    expect(empty.current.hook.weightSum).toBe(0);

    const single = setup([{ title: "M1", weight: 100 }]);
    expect(single.current.hook.weightSum).toBe(100);
  });
});
