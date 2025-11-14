import { NextResponse } from "next/server";
import { MilestonesRequestSchema, MilestonesResponseSchema, AgentFactory } from "@/lib/ai";
import { defaultTracer } from "../../../../utils/ai-ops/trace";

// TODO: Manejar de mejor manera los errores, por ejemplo obtuve esto en el frontend: Incorrect API key provided: sk-proj-********************************************************************************************************************************************************kwgA. You can find your API key at https://platform.openai.com/account/api-keys.
/**
 * POST /api/ai/milestones
 * Validates input and returns a DUMMY milestones response (temporary, until planner agent is wired).
 */
export async function POST(req: Request) {
  try {
    const h = new Headers();
    // auth and rate limiting handled in middleware
    const body = await req.json();
    console.log("body", body);
    const input = MilestonesRequestSchema.parse(body);
    console.log("input", input);
    const traceId = input.traceId || `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    // Build user content only; system instructions come from AgentFactory via AI_CONFIG
    const deadline = typeof (input.context as any)?.deadline === "string" ? (input.context as any).deadline : undefined;
    const locale = input.locale || "es";
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
    const userContent = `Objetivo: ${input.goal}\nHoy: ${today}\n${deadline ? `Fecha límite de la meta: ${deadline}` : "Sin fecha límite especificada"}\nIdioma: ${locale}`;

    // Execute planner agent
    const agent = AgentFactory.create("planner");
    const result = await agent.execute({ payload: userContent }, { traceId, locale });
    console.log("result", result);
    // Best-effort parse of agent output
    const raw = (result as any)?.data?.finalOutput ?? (result as any)?.data ?? result;
    let parsed: unknown = undefined;
    try {
      if (typeof raw === "string") {
        // Try direct JSON, or extract JSON block
        const trimmed = raw.trim();
        const jsonMatch = trimmed.match(/\{[\s\S]*\}$/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : trimmed);
      } else if (typeof raw === "object" && raw) {
        // Some SDKs return { type, content } or similar
        const maybeText = (raw as any).text || (raw as any).content || (raw as any).output || (raw as any).json;
        if (typeof maybeText === "string") {
          parsed = JSON.parse(maybeText);
        } else {
          parsed = raw;
        }
      }
    } catch {
      parsed = undefined;
    }

    // Validate against schema; if invalid, fallback to dummy but keep traceId
    const safe = MilestonesResponseSchema.safeParse(parsed);
    if (safe.success) {
      return NextResponse.json({ ...safe.data, traceId: safe.data.traceId || traceId }, { headers: h });
    }

    // Fallback DUMMY (same behavior as antes) para resiliencia
    const goalText = input.goal;
    const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);
    const now = new Date();
    let dates: Array<string | undefined> = [undefined, undefined, undefined, undefined];
    if (typeof deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      const dl = new Date(`${deadline}T00:00:00.000Z`);
      const start = now.getTime();
      const end = dl.getTime();
      const q = [0.25, 0.5, 0.75, 1];
      dates = q.map((p) => toDateOnly(new Date(start + (end - start) * p)));
    } else {
      dates = [0, 7, 14, 21].map((d) => {
        const t = new Date(now);
        t.setDate(t.getDate() + d);
        return toDateOnly(t);
      });
    }
    const base = goalText.replace(/\s+/g, " ").trim();
    const milestones = [
      {
        title: `Hito 1: Definir alcance`,
        description: `Delimitar el objetivo basado en: ${base.substring(0, 80)}`,
        dueDate: dates[0],
        weight: 30,
      },
      {
        title: `Hito 2: Plan base`,
        description: `Listar tareas clave y recursos necesarios`,
        dueDate: dates[1],
        weight: 25,
      },
      {
        title: `Hito 3: Ejecución inicial`,
        description: `Completar la primera fase (50%)`,
        dueDate: dates[2],
        weight: 25,
      },
      {
        title: `Hito 4: Cierre y retro`,
        description: `Validar resultados y siguientes pasos`,
        dueDate: dates[3],
        weight: 20,
      },
    ];

    const span = await defaultTracer.startSpan("ai.milestones.fallback", { traceId });
    await defaultTracer.annotate?.(span, { count: milestones.length });
    await defaultTracer.endSpan(span);
    return NextResponse.json({ milestones, traceId }, { headers: h });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
