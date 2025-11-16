import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { parseJsonOr415 } from "@/lib/http/guards";
import { MilestoneItemSchema } from "@/lib/ai";
import { MilestonesService } from "@/services/milestones-service";

const PersistMilestonesSchema = z.object({
  items: z.array(MilestoneItemSchema).min(1),
});

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

    const userId = user.id;

    const { id: goalId } = await params;
    if (!goalId) {
      return NextResponse.json({ error: "ID de meta requerido" }, { status: 400 });
    }

    const jsonOrRes = await parseJsonOr415<Record<string, unknown>>(req);
    if (jsonOrRes instanceof NextResponse) return jsonOrRes;
    const parsed = PersistMilestonesSchema.safeParse(jsonOrRes);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { items } = parsed.data;

    const service = new MilestonesService();
    try {
      const inserted = await service.createMilestonesForGoal(userId, goalId, items);
      return NextResponse.json({ milestones: inserted }, { status: 201 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear milestones";
      const code = msg.includes("permisos") ? 403 : msg.includes("no encontrada") ? 404 : 400;
      return NextResponse.json({ error: msg }, { status: code });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Lista milestones de una meta (lectura para lazy loading)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = user.id;
    const { id: goalId } = await params;
    if (!goalId) {
      return NextResponse.json({ error: "ID de meta requerido" }, { status: 400 });
    }

    const service = new MilestonesService();

    try {
      const rows = await service.listMilestonesForGoal(userId, goalId);
      const milestones = rows.map((m) => ({
        title: m.title,
        description: m.description ?? undefined,
        dueDate: m.targetDate ? String(m.targetDate) : undefined,
        weight: m.weight ?? 0,
      }));
      return NextResponse.json({ milestones }, { status: 200 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener milestones";
      const code = msg.includes("permisos") ? 403 : msg.includes("no encontrada") ? 404 : 400;
      return NextResponse.json({ error: msg }, { status: code });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
