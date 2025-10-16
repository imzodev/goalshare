import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { goals, profiles } from "@/db/schema";
import { eq, sql as dsql } from "drizzle-orm";
import { withUserContext } from "@/lib/db-context";
import { GoalsService } from "@/services/goals-service";
import { toNumericString } from "@/utils/type-converters";
import { parseJsonOr415 } from "@/lib/http/guards";

const CreateGoalSchema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    // Validar que metas metric/checkin tengan targetValue y targetUnit
    if (data.goalType === "metric" || data.goalType === "checkin") {
      if (!data.targetValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Las metas de tipo "${data.goalType}" requieren un valor objetivo (targetValue)`,
          path: ["targetValue"],
        });
      }
      if (!data.targetUnit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Las metas de tipo "${data.goalType}" requieren una unidad (targetUnit)`,
          path: ["targetUnit"],
        });
      }
    }

    // Validar que metas manual no tengan targetValue ni currentValue
    if (data.goalType === "manual") {
      if (data.targetValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Las metas manuales no deben tener targetValue",
          path: ["targetValue"],
        });
      }
      if (data.currentValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Las metas manuales no deben tener currentValue",
          path: ["currentValue"],
        });
      }
    }

    // Validar que metas milestone no tengan targetValue ni currentProgress
    if (data.goalType === "milestone") {
      if (data.targetValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Las metas de tipo milestone no deben tener targetValue",
          path: ["targetValue"],
        });
      }
      if (data.currentProgress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Las metas de tipo milestone no deben tener currentProgress",
          path: ["currentProgress"],
        });
      }
    }
  });

export async function POST(req: NextRequest) {
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

    const jsonOrRes = await parseJsonOr415<Record<string, unknown>>(req);
    if (jsonOrRes instanceof NextResponse) return jsonOrRes;
    const parsed = CreateGoalSchema.safeParse(jsonOrRes);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const {
      title,
      description,
      deadline,
      topicCommunityId,
      templateId,
      goalType,
      targetValue,
      targetUnit,
      currentValue,
      currentProgress,
    } = parsed.data;

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
      const currentCount = Number((result as Array<{ count?: number }>)?.[0]?.count ?? 0);

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

    if ("limitExceeded" in created && created.limitExceeded) {
      return NextResponse.json({ error: "Límite alcanzado: el plan Free permite hasta 5 metas." }, { status: 403 });
    }

    return NextResponse.json({ goal: "row" in created ? created.row : null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/goals]", err);
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
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
    const goalsService = new GoalsService();
    const data = await goalsService.listUserGoals(userId);

    return NextResponse.json({ goals: data }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/goals]", err);
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
