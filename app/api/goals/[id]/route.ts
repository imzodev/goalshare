import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { parseJsonOr415 } from "@/lib/http/guards";
import { GoalsService } from "@/services/goals-service";

const UpdateGoalSchema = z
  .object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(120).optional(),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(2000).optional(),
    deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullish()
      .or(z.literal("") as unknown as z.ZodType<string | null>)
      .transform((v) => (v ? v : null))
      .optional(),
    topicCommunityId: z.string().uuid({ message: "topicCommunityId debe ser un UUID válido" }).optional(),
    status: z.enum(["pending", "completed"]).optional(),
    goalType: z.enum(["metric", "milestone", "checkin", "manual"]).optional(),
    targetValue: z.number().positive().nullish(),
    targetUnit: z.string().max(50).nullish(),
    currentValue: z.number().min(0).nullish(),
    currentProgress: z.number().min(0).max(100).int().nullish(),
  })
  .superRefine((data, ctx) => {
    // Solo validar si se está cambiando el goalType
    if (data.goalType) {
      // Validar que metas metric/checkin tengan targetValue y targetUnit
      if (data.goalType === "metric" || data.goalType === "checkin") {
        if (data.targetValue !== undefined && !data.targetValue) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Las metas de tipo "${data.goalType}" requieren un valor objetivo (targetValue)`,
            path: ["targetValue"],
          });
        }
        if (data.targetUnit !== undefined && !data.targetUnit) {
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
    }
  });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID de meta requerido" }, { status: 400 });
    }

    const jsonOrRes = await parseJsonOr415<Record<string, unknown>>(req);
    if (jsonOrRes instanceof NextResponse) return jsonOrRes;
    const parsed = UpdateGoalSchema.safeParse(jsonOrRes);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updateData = parsed.data;

    // Validar que al menos un campo se está actualizando
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Debe proporcionar al menos un campo para actualizar" }, { status: 400 });
    }

    const goalsService = new GoalsService();

    try {
      const updatedGoal = await goalsService.updateGoal(userId, id, updateData);
      return NextResponse.json({ goal: updatedGoal });
    } catch (error) {
      console.error("[API] Error updating goal:", error);
      const message = error instanceof Error ? error.message : "Error interno del servidor";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] Unexpected error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
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
      console.error("[Auth] getUser failed:", authError?.message);
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = user.id;

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID de meta requerido" }, { status: 400 });
    }

    const goalsService = new GoalsService();

    try {
      await goalsService.deleteGoal(userId, id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("[API] Error deleting goal:", error);
      const message = error instanceof Error ? error.message : "Error interno del servidor";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] Unexpected error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
