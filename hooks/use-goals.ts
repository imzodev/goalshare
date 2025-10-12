"use client";

import { useCallback, useState } from "react";
import type { UserGoalSummary } from "@/types/goals";

export function useGoals() {
  const [goals, setGoals] = useState<UserGoalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/goals", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudieron cargar las metas");
      }

      const nextGoals = Array.isArray(data?.goals) ? data.goals : [];
      setGoals(nextGoals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las metas");
      setGoals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  return { goals, setGoals, loading, refreshing, error, fetchGoals };
}
