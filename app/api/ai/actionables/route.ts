import { NextResponse } from "next/server";
import { AgentFactory, ActionablesRequestSchema, ActionablesResponseSchema } from "@/lib/ai";
import type { AgentPayload } from "@/types/ai";

/**
 * POST /api/ai/actionables
 * Genera sugerencias de accionables recurrentes a partir de una meta o hito.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = ActionablesRequestSchema.parse(body);

    const traceId = input.traceId || `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const locale = input.locale || "es";

    const lines: string[] = [];
    lines.push(`Objetivo: ${input.goal}`);
    if (input.context) {
      lines.push(`Contexto: ${JSON.stringify(input.context)}`);
    }
    lines.push(`Idioma: ${locale}`);
    lines.push("Tarea: actionables");
    lines.push(
      "Instrucciones: Genera una lista de accionables recurrentes según el esquema JSON indicado por el sistema."
    );

    const userContent = lines.join("\n");

    const agent = AgentFactory.create("actionable");
    const result = await agent.execute({ payload: userContent }, { traceId, locale });

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

    const safe = ActionablesResponseSchema.safeParse(parsed);
    if (!safe.success) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 502 });
    }

    const payload = {
      ...safe.data,
      traceId: safe.data.traceId || traceId,
    };

    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
