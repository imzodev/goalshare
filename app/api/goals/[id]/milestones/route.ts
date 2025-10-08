import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/config/env";
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

    // CSRF / Origin check (solo aceptar same-origin)
    const origin = req.headers.get("origin") || "";
    if (!origin || !origin.startsWith(env.NEXT_PUBLIC_APP_URL)) {
      return NextResponse.json({ error: "Origin no permitido" }, { status: 403 });
    }

    // Content-Type check (solo application/json)
    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type inválido" }, { status: 415 });
    }

    const { id: goalId } = await params;
    if (!goalId) {
      return NextResponse.json({ error: "ID de meta requerido" }, { status: 400 });
    }

    const json = await req.json();
    const parsed = PersistMilestonesSchema.safeParse(json);
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
