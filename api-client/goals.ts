import type { MilestoneItem, UserGoalSummary } from "@/types/goals";

export async function getGoals(): Promise<UserGoalSummary[]> {
  console.log("Fetching goals...");
  const res = await fetch("/api/goals", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error || "No se pudieron cargar las metas";
    throw new Error(typeof msg === "string" ? msg : "No se pudieron cargar las metas");
  }

  return Array.isArray(data?.goals) ? data.goals : [];
}

export async function createGoal(payload: {
  title: string;
  description: string;
  deadline: string | null;
  topicCommunityId: string;
  templateId: string | null;
}): Promise<{ id: string }> {
  const res = await fetch("/api/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.error || "No se pudo crear la meta";
    throw new Error(typeof msg === "string" ? msg : "No se pudo crear la meta");
  }
  const goalId = data?.goal?.id;
  if (!goalId) {
    throw new Error("Respuesta inválida del servidor (sin goal.id)");
  }
  return { id: goalId };
}

export async function createGoalMilestones(goalId: string, items: MilestoneItem[]): Promise<void> {
  const res = await fetch(`/api/goals/${goalId}/milestones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error || "No se pudieron guardar los milestones";
    throw new Error(typeof msg === "string" ? msg : "No se pudieron guardar los milestones");
  }
}

export async function getGoalMilestones(goalId: string): Promise<MilestoneItem[]> {
  const res = await fetch(`/api/goals/${goalId}/milestones`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error || "No se pudieron cargar los milestones";
    throw new Error(typeof msg === "string" ? msg : "No se pudieron cargar los milestones");
  }

  return Array.isArray(data?.milestones) ? data.milestones : [];
}
