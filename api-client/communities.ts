import type { CommunitySummary } from "@/types/communities";

export async function getCommunitiesTopics(): Promise<CommunitySummary[]> {
  const res = await fetch("/api/communities/topics", { method: "GET" });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (json as any)?.error || "No se pudieron cargar comunidades";
    throw new Error(typeof msg === "string" ? msg : "No se pudieron cargar comunidades");
  }

  return Array.isArray((json as any)?.communities) ? ((json as any).communities as CommunitySummary[]) : [];
}
