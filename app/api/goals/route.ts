import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { goals, profiles } from "@/db/schema";
import { eq, sql as dsql } from "drizzle-orm";
import { withUserContext } from "@/lib/db-context";
import { env } from "@/config/env";
import { GoalsService } from "@/services/goals-service";
import { toNumericString } from "@/utils/type-converters";

const CreateGoalSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(120),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(2000),
  // Usamos string en formato YYYY-MM-DD para coincidir con el tipo 'date' de Drizzle
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish()
    .or(z.literal("") as unknown as z.ZodType<string | null>)
    .transform((v) => (v ? v : null)),
  topicCommunityId: z.string().uuid({ message: "topicCommunityId debe ser un UUID válido" }),
  templateId: z.string().uuid().nullish(),
  goalType: z.enum(["metric", "milestone", "checkin", "manual"]).optional().default("manual"),
  targetValue: z.number().positive().nullish(),
  targetUnit: z.string().max(50).nullish(),
  currentValue: z.number().min(0).nullish(),
  currentProgress: z.number().min(0).max(100).int().nullish(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

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

    const json = await req.json();
    const parsed = CreateGoalSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { title, description, deadline, topicCommunityId, templateId, goalType, targetValue, targetUnit, currentValue, currentProgress } = parsed.data;

    // Ejecutar con contexto de usuario para que apliquen políticas RLS si existieran
    const created = await withUserContext(userId, async (dbCtx) => {
      // Leer plan del perfil; si no existe, crear uno mínimo
      const existing = await dbCtx.query.profiles.findFirst({
        where: eq(profiles.userId, userId),
        columns: { planId: true },
      });
      let plan = existing?.planId ?? "free";
      if (!existing) {
        await dbCtx
          .insert(profiles)
          .values({ userId, planId: "free" })
          .onConflictDoNothing({ target: profiles.userId });
        plan = "free";
      }

      // Contar metas existentes del usuario
      const result = await dbCtx.execute(
        dsql`select count(*)::int as count from ${goals} where ${goals.ownerId} = ${userId}`
      );
      const currentCount = Number((result as any)?.[0]?.count ?? 0);

      if (plan === "free" && currentCount >= 5) {
        return { limitExceeded: true } as const;
      }

      const [row] = await dbCtx
        .insert(goals)
        .values({
          ownerId: userId,
          title,
          description,
          deadline: deadline ?? null,
          topicCommunityId,
          templateId: templateId ?? null,
          goalType: goalType ?? "manual",
          targetValue: toNumericString(targetValue),
          targetUnit: targetUnit ?? null,
          currentValue: toNumericString(currentValue),
          currentProgress: currentProgress ?? null,
        })
        .returning();

      return { row } as const;
    });

    if ((created as any).limitExceeded) {
      return NextResponse.json(
        { error: "Límite alcanzado: el plan Free permite hasta 5 metas." },
        { status: 403 }
      );
    }

    return NextResponse.json({ goal: (created as any).row }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/goals]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const goalsService = new GoalsService();
    const data = await goalsService.listUserGoals(userId);

    return NextResponse.json({ goals: data }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/goals]", err);
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
