import { goals, goalActionables, goalMilestones } from "@/db/schema";
import { withUserContext } from "@/lib/db-context";
import { eq } from "drizzle-orm";

export interface ActionableInput {
  title: string;
  description?: string;
  recurrence?: string;
  startDate?: string;
  endDate?: string;
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
      Pick<ActionableInput, "title" | "description" | "recurrence" | "startDate" | "endDate" | "milestoneId">
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
