import { useCallback, useEffect, useState } from "react";

export interface GoalsSummary {
  total: number;
  completed: number;
  pending: number;
}

export function useGoalsSummary() {
  const [data, setData] = useState<GoalsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/goals/summary", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error ?? "No se pudo cargar el resumen de metas");
      }

      const summary: GoalsSummary = await response.json();
      setData(summary);
    } catch (err) {
      console.error("[useGoalsSummary]", err);
      setError(err instanceof Error ? err.message : "Error al cargar el resumen");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    data,
    loading,
    error,
    refetch: fetchSummary,
  } as const;
}
