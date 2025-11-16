"use client";

import { useCallback, useState } from "react";
import type { MilestoneItem } from "@/types/goals";
import { getGoalMilestones } from "@/api-client/goals";

interface UseGoalMilestonesResult {
  milestones: MilestoneItem[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  load: () => Promise<void>;
}

export function useGoalMilestones(goalId: string | undefined | null): UseGoalMilestonesResult {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!goalId || loading || loaded) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getGoalMilestones(goalId);
      setMilestones(data ?? []);
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los milestones");
    } finally {
      setLoading(false);
    }
  }, [goalId, loading, loaded]);

  return { milestones, loading, error, loaded, load };
}
