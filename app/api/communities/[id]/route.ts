import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CommunitiesService } from "@/services/communities-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    const { id: communityId } = await params;

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = user.id;
    const communitiesService = new CommunitiesService();

    // Obtener detalles de la comunidad con información de membresía
    const community = await communitiesService.getCommunityWithDetails(userId, communityId);

    if (!community) {
      return NextResponse.json({ error: "Comunidad no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ community });
  } catch (error) {
    console.error("[Community API]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    const { id: communityId } = await params;

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = user.id;
    const communitiesService = new CommunitiesService();

    // Unirse a la comunidad
    await communitiesService.joinCommunity(userId, communityId);

    // Obtener la comunidad actualizada
    const community = await communitiesService.getCommunityWithDetails(userId, communityId);

    return NextResponse.json({
      message: "Te has unido a la comunidad exitosamente",
      community,
    });
  } catch (error) {
    console.error("[Community Join API]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    const { id: communityId } = await params;

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = user.id;
    const communitiesService = new CommunitiesService();

    // Salir de la comunidad
    await communitiesService.leaveCommunity(userId, communityId);

    return NextResponse.json({
      message: "Has salido de la comunidad exitosamente",
    });
  } catch (error) {
    console.error("[Community Leave API]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}
