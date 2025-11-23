import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseJsonOr415 } from "@/lib/http/guards";
import { ActionablesService } from "@/services/actionables-service";
import { UpdateActionableSchema } from "@/types/actionables";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: actionableId } = await params;
    if (!actionableId) {
      return NextResponse.json({ error: "ID de accionable requerido" }, { status: 400 });
    }

    const jsonOrRes = await parseJsonOr415<Record<string, unknown>>(req);
    if (jsonOrRes instanceof NextResponse) return jsonOrRes;
    const parsed = UpdateActionableSchema.safeParse(jsonOrRes);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updates = parsed.data;

    const service = new ActionablesService();
    try {
      const updated = await service.updateActionable(userId, actionableId, updates);
      return NextResponse.json({ actionable: updated }, { status: 200 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al actualizar accionable";
      const code = msg.includes("permisos") ? 403 : msg.includes("no encontrado") ? 404 : 400;
      return NextResponse.json({ error: msg }, { status: code });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: actionableId } = await params;
    if (!actionableId) {
      return NextResponse.json({ error: "ID de accionable requerido" }, { status: 400 });
    }

    const service = new ActionablesService();
    try {
      await service.deleteActionable(userId, actionableId);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al eliminar accionable";
      const code = msg.includes("permisos") ? 403 : msg.includes("no encontrado") ? 404 : 400;
      return NextResponse.json({ error: msg }, { status: code });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
