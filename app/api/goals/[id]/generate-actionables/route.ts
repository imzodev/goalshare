import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AgentFactory } from "@/lib/ai";
import { GoalsService } from "@/services/goals-service";
import { ActionablesService } from "@/services/actionables-service";
import type { AgentPayload } from "@/types/ai";

/**
 * POST /api/goals/[id]/generate-actionables
 * Genera sugerencias de accionables para una meta usando el agente "actionable".
 *
 * No persiste nada en la base de datos; solo devuelve sugerencias para que el
 * cliente las revise y eventualmente las cree vía los endpoints de accionables.
 */
// TODO: Hacer la validacion de parametros enviados desde el frontend
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[Auth] getUser failed:", authError?.message);
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = user.id;
    const { id: goalId } = await params;
    if (!goalId) {
      return NextResponse.json({ error: "ID de meta requerido" }, { status: 400 });
    }

    const goalsService = new GoalsService();
    const goal = await goalsService.getGoalById(userId, goalId);
    if (!goal) {
      return NextResponse.json({ error: "Meta no encontrada o no tienes permisos" }, { status: 404 });
    }

    const actionablesService = new ActionablesService();
    const existing = await actionablesService.listForGoal(userId, goalId);

    // Read optional body for custom instructions
    let count = 3; // default
    try {
      const body = await _req.json();
      if (body.count) count = Math.max(1, Math.min(5, Number(body.count)));
    } catch {
      // ignore JSON parse error (body might be empty)
    }

    const locale = "es";
    const traceId = `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const lines: string[] = [];
    lines.push(`Meta: ${goal.title}`);
    if (goal.description) {
      lines.push(`Descripcion: ${goal.description}`);
    }
    if (goal.deadline) {
      lines.push(`Fecha limite: ${goal.deadline}`);
    }
    lines.push(`Idioma: ${locale}`);
    lines.push("Contexto: Esta meta pertenece al usuario autenticado en GoalShare.");
    
    if (existing.length > 0) {
      lines.push("Accionables ya existentes para esta meta (NO debes repetirlos ni generar variantes casi iguales):");
      for (const a of existing) {
        const title = a.title;
        const desc = a.description ?? "";
        lines.push(`- ${title}${desc ? `: ${desc}` : ""}`);
      }
    } else {
      lines.push("Actualmente la meta no tiene accionables guardados.");
    }
    lines.push("Tarea: actionables");
    lines.push(
      `Instrucciones: Genera una lista de ${count} accionables recurrentes segun el esquema JSON indicado por el sistema. ` +
        "No repitas ningun accionable existente ni generes items con titulo o descripcion muy parecidos (near-duplicates). " +
        "Si una idea ya esta cubierta por un accionable existente, inventa otra distinta."
    );

    const userContent = lines.join("\n");

    const agent = AgentFactory.create("actionable");
    const result = await agent.execute({ payload: userContent }, { traceId, locale, userId, meta: { goalId } });

    const typedResult = result as AgentPayload;
    const raw =
      typeof typedResult === "object" && typedResult !== null && "data" in typedResult
        ? (typedResult.data as { finalOutput?: unknown } | unknown) &&
          (typedResult as { data?: { finalOutput?: unknown } }).data?.finalOutput !== undefined
          ? (typedResult as { data?: { finalOutput?: unknown } }).data?.finalOutput
          : (typedResult as { data?: unknown }).data
        : typedResult;

    let parsed: unknown = undefined;
    try {
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        parsed = JSON.parse(trimmed);
      } else if (raw && typeof raw === "object") {
        const obj = raw as {
          text?: string;
          content?: string;
          output?: string;
        };
        const maybeText = obj.text ?? obj.content ?? obj.output;
        if (typeof maybeText === "string") {
          parsed = JSON.parse(maybeText);
        } else {
          parsed = raw;
        }
      }
    } catch {
      parsed = undefined;
    }

    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 502 });
    }

    return NextResponse.json({ ...(parsed as Record<string, unknown>), traceId });
  } catch (err) {
    console.error("[POST /api/goals/[id]/generate-actionables]", err);
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
