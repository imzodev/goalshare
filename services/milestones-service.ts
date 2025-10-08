import { goals, goalMilestones } from "@/db/schema";
import { withUserContext } from "@/lib/db-context";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import type { MilestoneItemSchema } from "@/lib/ai";

export type MilestoneItem = z.infer<typeof MilestoneItemSchema>;

export class MilestonesService {
  async createMilestonesForGoal(userId: string, goalId: string, items: MilestoneItem[]) {
    if (!userId || !goalId) throw new Error("userId y goalId son requeridos");
    if (!items?.length) throw new Error("Se requieren al menos 1 milestone");

    return withUserContext(userId, async (dbCtx) => {
      const [existing] = await dbCtx.select().from(goals).where(eq(goals.id, goalId)).limit(1);
      if (!existing) throw new Error("Meta no encontrada");
      if (existing.ownerId !== userId) throw new Error("No tienes permisos para agregar milestones a esta meta");

      const rows = items.map((m, idx) => ({
        goalId,
        title: m.title,
        description: m.description ?? null,
        sortOrder: idx + 1,
        weight: m.weight,
        targetDate: m.dueDate ? (m.dueDate as unknown as string) : null,
      }));

      const inserted = await dbCtx.insert(goalMilestones).values(rows).returning();
      return inserted;
    });
  }
}
