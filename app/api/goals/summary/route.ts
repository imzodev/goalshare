import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoalsService } from "@/services/goals-service";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const goalsService = new GoalsService();
    const summary = await goalsService.getUserGoalsSummary(userId);

    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    console.error("[GET /api/goals/summary]", err);
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
