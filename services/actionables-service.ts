import { goals, goalActionables, goalMilestones } from "@/db/schema";
import { withUserContext } from "@/lib/db-context";
import { eq } from "drizzle-orm";

export interface ActionableInput {
  title: string;
  description?: string;
  recurrence?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  durationMinutes?: number;
  timezone?: string;
  isPaused?: boolean;
  pausedUntil?: string;
  isArchived?: boolean;
  color?: string;
  category?: string;
  priority?: number;
  reminderMinutesBefore?: number;
  exDates?: string;
  milestoneId?: string | null;
}

export class ActionablesService {
  async createForGoal(userId: string, goalId: string, items: ActionableInput[]) {
    if (!userId || !goalId) throw new Error("userId y goalId son requeridos");
    if (!items?.length) throw new Error("Se requiere al menos 1 accionable");

    return withUserContext(userId, async (dbCtx) => {
      const [existingGoal] = await dbCtx.select().from(goals).where(eq(goals.id, goalId)).limit(1);
      if (!existingGoal) throw new Error("Meta no encontrada");
      if (existingGoal.ownerId !== userId) throw new Error("No tienes permisos para agregar accionables a esta meta");

      const rows = items.map((item) => ({
        goalId,
        milestoneId: item.milestoneId ?? null,
        title: item.title,
        description: item.description ?? null,
        recurrence: item.recurrence ?? null,
        startDate: item.startDate ?? null,
        endDate: item.endDate ?? null,
        startTime: item.startTime ?? null,
        durationMinutes: item.durationMinutes ?? null,
        timezone: item.timezone ?? null,
        isPaused: item.isPaused ?? null,
        pausedUntil: item.pausedUntil ? new Date(item.pausedUntil) : null,
        isArchived: item.isArchived ?? null,
        color: item.color ?? null,
        category: item.category ?? null,
        priority: item.priority ?? null,
        reminderMinutesBefore: item.reminderMinutesBefore ?? null,
        exDates: item.exDates ?? null,
      }));

      const inserted = await dbCtx.insert(goalActionables).values(rows).returning();
      return inserted;
    });
  }

  async listForGoal(userId: string, goalId: string) {
    if (!userId || !goalId) throw new Error("userId y goalId son requeridos");

    return withUserContext(userId, async (dbCtx) => {
      const [existingGoal] = await dbCtx.select().from(goals).where(eq(goals.id, goalId)).limit(1);
      if (!existingGoal) throw new Error("Meta no encontrada");
      if (existingGoal.ownerId !== userId) throw new Error("No tienes permisos para ver accionables de esta meta");

      const rows = await dbCtx.select().from(goalActionables).where(eq(goalActionables.goalId, goalId));

      return rows;
    });
  }

  async listForMilestone(userId: string, milestoneId: string) {
    if (!userId || !milestoneId) throw new Error("userId y milestoneId son requeridos");

    return withUserContext(userId, async (dbCtx) => {
      const [existingMilestone] = await dbCtx
        .select()
        .from(goalMilestones)
        .where(eq(goalMilestones.id, milestoneId))
        .limit(1);
      if (!existingMilestone) throw new Error("Hito no encontrado");

      const [goalRow] = await dbCtx.select().from(goals).where(eq(goals.id, existingMilestone.goalId)).limit(1);
      if (!goalRow) throw new Error("Meta asociada no encontrada");
      if (goalRow.ownerId !== userId) throw new Error("No tienes permisos para ver accionables de este hito");

      const rows = await dbCtx.select().from(goalActionables).where(eq(goalActionables.milestoneId, milestoneId));

      return rows;
    });
  }

  async updateActionable(
    userId: string,
    actionableId: string,
    updates: Partial<
      Pick<
        ActionableInput,
        | "title"
        | "description"
        | "recurrence"
        | "startDate"
        | "endDate"
        | "startTime"
        | "durationMinutes"
        | "timezone"
        | "isPaused"
        | "pausedUntil"
        | "isArchived"
        | "color"
        | "category"
        | "priority"
        | "reminderMinutesBefore"
        | "exDates"
        | "milestoneId"
      >
    >
  ) {
    if (!userId || !actionableId) throw new Error("userId y actionableId son requeridos");

    return withUserContext(userId, async (dbCtx) => {
      const [existing] = await dbCtx
        .select({
          id: goalActionables.id,
          goalId: goalActionables.goalId,
        })
        .from(goalActionables)
        .where(eq(goalActionables.id, actionableId))
        .limit(1);

      if (!existing) throw new Error("Accionable no encontrado");

      const [goalRow] = await dbCtx.select().from(goals).where(eq(goals.id, existing.goalId)).limit(1);
      if (!goalRow) throw new Error("Meta asociada no encontrada");
      if (goalRow.ownerId !== userId) throw new Error("No tienes permisos para editar este accionable");

      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.recurrence !== undefined) updateData.recurrence = updates.recurrence;
      if (updates.startDate !== undefined) updateData.startDate = updates.startDate;
      if (updates.endDate !== undefined) updateData.endDate = updates.endDate;
      if (updates.startTime !== undefined) updateData.startTime = updates.startTime;
      if (updates.durationMinutes !== undefined) updateData.durationMinutes = updates.durationMinutes;
      if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
      if (updates.isPaused !== undefined) updateData.isPaused = updates.isPaused;
      if (updates.pausedUntil !== undefined)
        updateData.pausedUntil = updates.pausedUntil ? new Date(updates.pausedUntil) : null;
      if (updates.isArchived !== undefined) updateData.isArchived = updates.isArchived;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.reminderMinutesBefore !== undefined) updateData.reminderMinutesBefore = updates.reminderMinutesBefore;
      if (updates.exDates !== undefined) updateData.exDates = updates.exDates;
      if (updates.milestoneId !== undefined) updateData.milestoneId = updates.milestoneId;

      if (Object.keys(updateData).length === 0) {
        throw new Error("Debe proporcionar al menos un campo para actualizar");
      }

      const [updated] = await dbCtx
        .update(goalActionables)
        .set(updateData)
        .where(eq(goalActionables.id, actionableId))
        .returning();

      return updated;
    });
  }

  async deleteActionable(userId: string, actionableId: string) {
    if (!userId || !actionableId) throw new Error("userId y actionableId son requeridos");

    return withUserContext(userId, async (dbCtx) => {
      const [existing] = await dbCtx
        .select({
          id: goalActionables.id,
          goalId: goalActionables.goalId,
        })
        .from(goalActionables)
        .where(eq(goalActionables.id, actionableId))
        .limit(1);

      if (!existing) throw new Error("Accionable no encontrado");

      const [goalRow] = await dbCtx.select().from(goals).where(eq(goals.id, existing.goalId)).limit(1);
      if (!goalRow) throw new Error("Meta asociada no encontrada");
      if (goalRow.ownerId !== userId) throw new Error("No tienes permisos para eliminar este accionable");

      await dbCtx.delete(goalActionables).where(eq(goalActionables.id, actionableId));
    });
  }
}
