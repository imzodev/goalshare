import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CommunitiesService } from "@/services/communities-service";

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const communitiesService = new CommunitiesService();

    // Obtener comunidades del usuario
    const communities = await communitiesService.listUserCommunities(userId);

    return NextResponse.json({
      communities,
    });
  } catch (error) {
    console.error("[User Communities API]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}
