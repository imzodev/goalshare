import { NextResponse } from "next/server";
import { MilestonesRequestSchema } from "@/lib/ai";
import { defaultTracer } from "../../../../utils/ai-ops/trace";

/**
 * POST /api/ai/milestones
 * Validates input and returns a DUMMY milestones response (temporary, until planner agent is wired).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = MilestonesRequestSchema.parse(body);

    // DUMMY generation (no agent). Build 4 milestones with weights and date-only due dates.
    const traceId = input.traceId || `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const goalText = input.goal;

    // Helper to format YYYY-MM-DD
    const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);

    const now = new Date();
    let dates: Array<string | undefined> = [undefined, undefined, undefined, undefined];
    const deadlineStr = (input.context as Record<string, unknown> | undefined)?.deadline;
    if (typeof deadlineStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(deadlineStr)) {
      const deadline = new Date(`${deadlineStr}T00:00:00.000Z`);
      const start = now.getTime();
      const end = deadline.getTime();
      const q = [0.25, 0.5, 0.75, 1];
      dates = q.map((p) => {
        const t = new Date(start + (end - start) * p);
        return toDateOnly(t);
      });
    } else {
      // Weekly stagger from today
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

    // Optional trace hook
    const span = await defaultTracer.startSpan("ai.milestones.dummy", { traceId });
    await defaultTracer.annotate?.(span, { count: milestones.length });
    await defaultTracer.endSpan(span);
    return NextResponse.json({ milestones, traceId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
