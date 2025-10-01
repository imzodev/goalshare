import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CommunitiesService } from "@/services/communities-service";
import { auth } from "@/auth";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1, "La consulta de búsqueda es requerida"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: "Parámetro 'q' es requerido para la búsqueda" }, { status: 400 });
    }

    // Validar el esquema
    const validationResult = searchSchema.safeParse({ query });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Datos de búsqueda inválidos", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const communitiesService = new CommunitiesService();
    const communities = await communitiesService.searchCommunities(query, userId);

    return NextResponse.json({
      communities,
      query: query.trim(),
    });
  } catch (error) {
    console.error("[API/communities/search]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
