import { NextResponse } from "next/server";
import { AutocompleteDescriptionRequestSchema, AutocompleteDescriptionResponseSchema, AgentFactory } from "@/lib/ai";

/**
 * POST /api/ai/autocomplete/description
 * Suggests a short description based on a goal title.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = AutocompleteDescriptionRequestSchema.parse(body);
    const traceId = input.traceId || `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const locale = input.locale || "es";
    const lines: string[] = [];
    lines.push(`Meta: ${input.title}`);
    if (input.tone) lines.push(`Tono: ${input.tone}`);
    if (input.audience) lines.push(`Audiencia: ${input.audience}`);
    lines.push(`Idioma: ${locale}`);
    lines.push(`Tarea: description`);
    lines.push("Instrucciones: Sugiere una descripción inicial para la meta proporcionada. Devuelve solo el texto.");
    const user = lines.join("\n");

    const agent = AgentFactory.create("autocomplete");
    const result = await agent.execute({ payload: user }, { traceId, locale });
    const raw = (result as any)?.data?.finalOutput ?? (result as any)?.data ?? result;

    let suggestion = "";
    if (typeof raw === "string") {
      suggestion = raw.trim();
    } else if (raw && typeof raw === "object") {
      const maybeText = (raw as any).text || (raw as any).content || (raw as any).output || (raw as any).json;
      if (typeof maybeText === "string") suggestion = maybeText.trim();
      else suggestion = JSON.stringify(raw);
    } else {
      suggestion = String(raw ?? "");
    }

    // Validate response shape (best-effort)
    const safe = AutocompleteDescriptionResponseSchema.safeParse({ suggestion, traceId });
    if (!safe.success) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 502 });
    }
    return NextResponse.json(safe.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
