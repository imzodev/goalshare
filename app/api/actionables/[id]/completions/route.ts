import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { parseJsonOr415 } from "@/lib/http/guards";
import { withUserContext } from "@/lib/db-context";
import { goalActionables, goalActionableCompletions, goals } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

const CompletionUpsertSchema = z.object({
  occurrenceStart: z.string().min(1),
  notes: z.string().optional().nullable(),
});

const CompletionDeleteSchema = z.object({
  occurrenceStart: z.string().min(1),
});

async function assertUserCanAccessActionable(userId: string, actionableId: string) {
  return withUserContext(userId, async (dbCtx) => {
    const [row] = await dbCtx
      .select({
        id: goalActionables.id,
      })
      .from(goalActionables)
      .innerJoin(goals, eq(goals.id, goalActionables.goalId))
      .where(and(eq(goalActionables.id, actionableId), eq(goals.ownerId, userId)))
      .limit(1);

    if (!row) {
      throw new Error("No tienes permisos para este accionable");
    }
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id: actionableId } = await params;
    if (!actionableId) {
      return NextResponse.json({ error: "ID de accionable requerido" }, { status: 400 });
    }

    const jsonOrRes = await parseJsonOr415<Record<string, unknown>>(req);
    if (jsonOrRes instanceof NextResponse) return jsonOrRes;

    const parsed = CompletionUpsertSchema.safeParse(jsonOrRes);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const occurrenceStart = new Date(parsed.data.occurrenceStart);
    if (Number.isNaN(occurrenceStart.getTime())) {
      return NextResponse.json({ error: "occurrenceStart inválido" }, { status: 400 });
    }

    await assertUserCanAccessActionable(user.id, actionableId);

    const [row] = await withUserContext(user.id, async (dbCtx) => {
      return dbCtx
        .insert(goalActionableCompletions)
        .values({
          actionableId,
          occurrenceStart,
          notes: parsed.data.notes ?? null,
        })
        .onConflictDoUpdate({
          target: [goalActionableCompletions.actionableId, goalActionableCompletions.occurrenceStart],
          set: {
            notes: parsed.data.notes ?? null,
            completedAt: sql`now()`,
          },
        })
        .returning();
    });

    return NextResponse.json({ completion: row }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    const code = message.includes("permisos") ? 403 : 400;
    return NextResponse.json({ error: message }, { status: code });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id: actionableId } = await params;
    if (!actionableId) {
      return NextResponse.json({ error: "ID de accionable requerido" }, { status: 400 });
    }

    const jsonOrRes = await parseJsonOr415<Record<string, unknown>>(req);
    if (jsonOrRes instanceof NextResponse) return jsonOrRes;

    const parsed = CompletionDeleteSchema.safeParse(jsonOrRes);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const occurrenceStart = new Date(parsed.data.occurrenceStart);
    if (Number.isNaN(occurrenceStart.getTime())) {
      return NextResponse.json({ error: "occurrenceStart inválido" }, { status: 400 });
    }

    await assertUserCanAccessActionable(user.id, actionableId);

    await withUserContext(user.id, async (dbCtx) => {
      await dbCtx
        .delete(goalActionableCompletions)
        .where(
          and(
            eq(goalActionableCompletions.actionableId, actionableId),
            eq(goalActionableCompletions.occurrenceStart, occurrenceStart)
          )
        );
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    const code = message.includes("permisos") ? 403 : 400;
    return NextResponse.json({ error: message }, { status: code });
  }
}
