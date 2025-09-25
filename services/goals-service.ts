import { db } from "@/db";
import { goals, goalEntries, communities } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { withUserContext } from "@/lib/db-context";
import type { UserGoalSummary } from "@/types/goals";
import { calculateDaysLeft, toDate, toISODate } from "@/utils/date-utils";
import { clampProgress } from "@/utils/progress-utils";

type Database = typeof db;

export class GoalsService {
  constructor(private readonly dbInstance: Database = db) {}

  async listUserGoals(userId: string): Promise<UserGoalSummary[]> {
    if (!userId) {
      throw new Error("userId es requerido para listar metas");
    }

    return withUserContext(userId, async () => {
      const rows = await this.dbInstance
        .select({
          goal: goals,
          topic: {
            id: communities.id,
            name: communities.name,
            slug: communities.slug,
          },
        })
        .from(goals)
        .leftJoin(communities, eq(communities.id, goals.topicCommunityId))
        .where(eq(goals.ownerId, userId))
        .orderBy(desc(goals.createdAt));

      const now = new Date();

      return rows.map((row) => {
        const { goal, topic } = row;

        const deadline = toDate(goal.deadline);
        const createdAt = toDate(goal.createdAt)!;
        const completedAt = toDate(goal.completedAt);
        const lastUpdateAt = completedAt ?? createdAt;
        // TODO: Crear constante o enum para "completed"
        return {
          id: goal.id,
          title: goal.title,
          description: goal.description,
          status: goal.status,
          deadline: deadline ? toISODate(deadline) : null,
          createdAt: createdAt.toISOString(),
          completedAt: completedAt?.toISOString() ?? null,
          progress: clampProgress(goal.status === "completed" ? 100 : 0),
          daysLeft: deadline ? calculateDaysLeft(deadline, now) : null,
          topicCommunity: goal.topicCommunityId
            ? {
                id: goal.topicCommunityId,
                name: topic?.name ?? "",
                slug: topic?.slug ?? "",
              }
            : null,
          lastUpdateAt: lastUpdateAt.toISOString(),
        };
      });
    });
  }
}
