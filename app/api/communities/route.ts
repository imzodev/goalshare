import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CommunitiesService } from "@/services/communities-service";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = user.id;
    const communitiesService = new CommunitiesService();

    // Obtener todas las comunidades disponibles con información de membresía
    const communities = await communitiesService.listCommunities(userId);

    return NextResponse.json({
      communities,
    });
  } catch (error) {
    console.error("[Communities API]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}
