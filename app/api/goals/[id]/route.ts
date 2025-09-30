import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { env } from "@/config/env";
import { GoalsService } from "@/services/goals-service";

const UpdateGoalSchema = z.object({
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
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID de meta requerido" }, { status: 400 });
    }

    const json = await req.json();
    const parsed = UpdateGoalSchema.safeParse(json);
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
