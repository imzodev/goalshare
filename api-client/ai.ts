import type { MilestoneItem } from "@/types/goals";

export async function generateDescription(title: string): Promise<string> {
  const res = await fetch("/api/ai/autocomplete/description", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title.trim() }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error || "No se pudo generar la descripción";
    throw new Error(typeof msg === "string" ? msg : "No se pudo generar la descripción");
  }
  const suggestion = typeof data?.suggestion === "string" ? data.suggestion.trim() : "";
  return suggestion;
}

export async function generateMilestones(args: {
  goalText: string;
  context?: { deadline?: string };
}): Promise<MilestoneItem[]> {
  const res = await fetch("/api/ai/milestones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal: args.goalText, context: args.context ?? {} }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error || "No se pudieron generar milestones";
    throw new Error(typeof msg === "string" ? msg : "No se pudieron generar milestones");
  }
  const items = Array.isArray(data?.milestones) ? (data.milestones as MilestoneItem[]) : [];
  return items;
}
