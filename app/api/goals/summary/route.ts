import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoalsService } from "@/services/goals-service";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = user.id;
    const goalsService = new GoalsService();
    const summary = await goalsService.getUserGoalsSummary(userId);

    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    console.error("[GET /api/goals/summary]", err);
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
