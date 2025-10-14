import { useMemo, useCallback } from "react";
import type { MilestoneItem } from "@/types/goals";
import { applyWeightWithConstraint, redistributeWeightsEvenly, sumWeights } from "@/utils/milestones";

export function useMilestoneWeights(milestones: MilestoneItem[], setMilestones: (next: MilestoneItem[]) => void) {
  const weightSum = useMemo(() => sumWeights(milestones), [milestones]);

  const setWeightWithConstraint = useCallback(
    (index: number, desired: number) => {
      const next = applyWeightWithConstraint(milestones, index, desired);
      setMilestones(next);
    },
    [milestones, setMilestones]
  );

  const redistributeWeights = useCallback(() => {
    setMilestones(redistributeWeightsEvenly(milestones));
  }, [milestones, setMilestones]);

  return {
    weightSum,
    setWeightWithConstraint,
    redistributeWeights,
  };
}
