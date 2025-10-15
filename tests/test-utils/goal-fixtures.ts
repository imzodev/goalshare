import type { UserGoalSummary } from "@/types/goals";

export function makeUserGoal(overrides: Partial<UserGoalSummary> = {}): UserGoalSummary {
  const base: UserGoalSummary = {
    id: "g1",
    title: "Leer 12 libros",
    description: "Meta de lectura anual",
    status: "pending",
    goalType: "metric",
    deadline: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    progress: 25,
    daysLeft: 1,
    topicCommunity: { id: "t1", name: "Lectura", slug: "lectura" },
    lastUpdateAt: new Date().toISOString(),
    targetValue: 12,
    targetUnit: "libros",
    currentValue: 3,
    currentProgress: null,
  };
  return { ...base, ...overrides };
}

export const sampleUserGoal: UserGoalSummary = makeUserGoal({});
