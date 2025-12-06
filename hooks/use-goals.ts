"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import type { UserGoalSummary } from "@/types/goals";
import { goalsCacheService } from "@/services/goals-cache-service";

/**
 * Cache key for the current user's goals.
 * We use a simple key since the API returns goals for the authenticated user.
 */
const CURRENT_USER_CACHE_KEY = "current";

export function useGoals() {
  const [goals, setGoals] = useState<UserGoalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  // Load from cache on mount (only in browser)
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const cached = goalsCacheService.getGoals(CURRENT_USER_CACHE_KEY);
    if (cached && cached.length > 0) {
      console.log(`[useGoals] Loaded ${cached.length} goals from cache`);
      setGoals(cached);
      // Set loading to false since we have cached data
      // The background fetch will update if needed
      setLoading(false);
    }
  }, []);

  const fetchGoals = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      // If we have cached data and this is the initial load, treat it as silent
      const hasCachedData = goals.length > 0;
      const effectiveSilent = silent || (hasCachedData && loading === false);

      if (effectiveSilent) {
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

        // Update cache with fresh data
        goalsCacheService.cacheGoals(CURRENT_USER_CACHE_KEY, nextGoals);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar las metas");
        // Only clear goals if we don't have cached data
        if (!hasCachedData) {
          setGoals([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [goals.length, loading]
  );

  /**
   * Invalidates the local cache.
   * Call this when goals are created, updated, or deleted.
   */
  const invalidateCache = useCallback(() => {
    goalsCacheService.invalidateCache(CURRENT_USER_CACHE_KEY);
  }, []);

  return { goals, setGoals, loading, refreshing, error, fetchGoals, invalidateCache };
}
