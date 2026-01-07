"use client";

import { useCallback, useState } from "react";
import type { UserGoalSummary } from "@/types/goals";
import { goalsRepository } from "@/lib/client/repositories/goals-repository";

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
      // If silent refresh, force fetch from API (bypass cache check, update cache)
      // If not silent (initial load), try cache first
      const nextGoals = await goalsRepository.getGoals(silent);
      setGoals(nextGoals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las metas");
      // Keep existing goals if refresh failed, or empty if initial load failed?
      // Original logic set goals to empty on error.
      // Maybe better to keep stale data if refresh fails?
      // But let's stick to original behavior for now or improve it?
      // "setGoals([])" was in catch block.
      // If we have cache and it fails? Repository throws if both cache missing and API fails.
      // If we are refreshing (silent=true) and API fails, we might still have old goals in state.
      // But here we are setting goals to [] on error.
      // If I want to be robust: if silent refresh fails, maybe don't clear goals?
      // But strictly following previous behavior:
      if (!silent) {
        setGoals([]);
      }
      // If silent, we just show error and keep old state?
      // The original code:
      // setGoals([]);
      // This means if refresh fails, user sees empty list + error.
      // I will keep it consistent with original code for now, but usually keeping stale data is better.
      // Let's stick to original behavior to avoid behavior changes not requested.
      setGoals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  return { goals, setGoals, loading, refreshing, error, fetchGoals };
}
