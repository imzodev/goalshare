import { useEffect, useState, useCallback } from "react";
import type { CommunitySummary } from "@/types/communities";
import { getCommunitiesTopics } from "@/api-client/communities";

export function useCommunitiesTopics(open: boolean) {
  const [data, setData] = useState<CommunitySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getCommunitiesTopics();
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  return { data, loading, error, reload: load };
}
