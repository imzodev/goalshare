import { db } from "@/db";
import { goals, goalEntries, communities } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { withUserContext } from "@/lib/db-context";
import type { UserGoalSummary } from "@/types/goals";
import { calculateDaysLeft, toDate, toISODate } from "@/utils/date-utils";
import { clampProgress } from "@/utils/progress-utils";
import { GOAL_STATUS } from "@/constants/goals";

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
        return {
          id: goal.id,
          title: goal.title,
          description: goal.description,
          status: goal.status,
          deadline: deadline ? toISODate(deadline) : null,
          createdAt: createdAt.toISOString(),
          completedAt: completedAt?.toISOString() ?? null,
          progress: clampProgress(goal.status === GOAL_STATUS.COMPLETED ? 100 : 0),
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

  async updateGoal(userId: string, goalId: string, updates: {
    title?: string;
    description?: string;
    deadline?: string | null;
    status?: "pending" | "completed";
    topicCommunityId?: string;
  }): Promise<UserGoalSummary> {
    if (!userId || !goalId) {
      throw new Error("userId y goalId son requeridos para actualizar una meta");
    }

    return withUserContext(userId, async () => {
      // Primero verificar que el goal pertenece al usuario
      const existingGoal = await this.dbInstance
        .select()
        .from(goals)
        .where(eq(goals.id, goalId))
        .limit(1);

      if (!existingGoal.length || existingGoal[0].ownerId !== userId) {
        throw new Error("Meta no encontrada o no tienes permisos para editarla");
      }

      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.deadline !== undefined) updateData.deadline = updates.deadline ? sql`${updates.deadline}::date` : null;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.topicCommunityId !== undefined) updateData.topicCommunityId = updates.topicCommunityId;

      // Si se marca como completada, actualizar completedAt
      if (updates.status === GOAL_STATUS.COMPLETED && existingGoal[0].status !== GOAL_STATUS.COMPLETED) {
        updateData.completedAt = sql`NOW()`;
      } else if (updates.status === GOAL_STATUS.PENDING && existingGoal[0].status === GOAL_STATUS.COMPLETED) {
        updateData.completedAt = null;
      }

      await this.dbInstance
        .update(goals)
        .set(updateData)
        .where(eq(goals.id, goalId));

      // Retornar el goal actualizado
      const updatedGoals = await this.listUserGoals(userId);
      const updatedGoal = updatedGoals.find(g => g.id === goalId);

      if (!updatedGoal) {
        throw new Error("Error al recuperar la meta actualizada");
      }

      return updatedGoal;
    });
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    if (!userId || !goalId) {
      throw new Error("userId y goalId son requeridos para eliminar una meta");
    }

    return withUserContext(userId, async () => {
      // Primero verificar que el goal pertenece al usuario
      const existingGoal = await this.dbInstance
        .select()
        .from(goals)
        .where(eq(goals.id, goalId))
        .limit(1);

      if (!existingGoal.length || existingGoal[0].ownerId !== userId) {
        throw new Error("Meta no encontrada o no tienes permisos para eliminarla");
      }

      // Eliminar el goal (las entradas relacionadas se eliminarán automáticamente por CASCADE)
      await this.dbInstance
        .delete(goals)
        .where(eq(goals.id, goalId));
    });
  }

  async getGoalById(userId: string, goalId: string): Promise<UserGoalSummary | null> {
    if (!userId || !goalId) {
      throw new Error("userId y goalId son requeridos para obtener una meta");
    }

    return withUserContext(userId, async () => {
      const goals = await this.listUserGoals(userId);
      return goals.find(g => g.id === goalId) || null;
    });
  }

  async getUserGoalsSummary(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
  }> {
    if (!userId) {
      throw new Error("userId es requerido para obtener el resumen de metas");
    }

    return withUserContext(userId, async () => {
      const result = await this.dbInstance
        .select({
          total: sql<number>`cast(count(*) as integer)`,
          completed: sql<number>`cast(sum(case when ${goals.status} = ${GOAL_STATUS.COMPLETED} then 1 else 0 end) as integer)`,
          pending: sql<number>`cast(sum(case when ${goals.status} = ${GOAL_STATUS.PENDING} then 1 else 0 end) as integer)`,
        })
        .from(goals)
        .where(eq(goals.ownerId, userId));

      const summary = result[0];
      
      return {
        total: summary?.total ?? 0,
        completed: summary?.completed ?? 0,
        pending: summary?.pending ?? 0,
      };
    });
  }
}
