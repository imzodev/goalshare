import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseJsonOr415 } from "@/lib/http/guards";
import { ActionablesService } from "@/services/actionables-service";
import { PersistActionablesSchema } from "@/types/actionables";

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
    const parsed = PersistActionablesSchema.safeParse(jsonOrRes);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { items } = parsed.data;

    const service = new ActionablesService();
    try {
      const inserted = await service.createForGoal(userId, goalId, items);
      return NextResponse.json({ actionables: inserted }, { status: 201 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear accionables";
      const code = msg.includes("permisos") ? 403 : msg.includes("no encontrada") ? 404 : 400;
      return NextResponse.json({ error: msg }, { status: code });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

    const service = new ActionablesService();

    try {
      const rows = await service.listForGoal(userId, goalId);
      return NextResponse.json({ actionables: rows }, { status: 200 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener accionables";
      const code = msg.includes("permisos") ? 403 : msg.includes("no encontrada") ? 404 : 400;
      return NextResponse.json({ error: msg }, { status: code });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
