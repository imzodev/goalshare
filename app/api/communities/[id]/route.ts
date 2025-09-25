import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CommunitiesService } from "@/services/communities-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id: communityId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id: communityId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const communitiesService = new CommunitiesService();

    // Unirse a la comunidad
    await communitiesService.joinCommunity(userId, communityId);

    // Obtener la comunidad actualizada
    const community = await communitiesService.getCommunityWithDetails(userId, communityId);

    return NextResponse.json({
      message: "Te has unido a la comunidad exitosamente",
      community
    });
  } catch (error) {
    console.error("[Community Join API]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id: communityId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const communitiesService = new CommunitiesService();

    // Salir de la comunidad
    await communitiesService.leaveCommunity(userId, communityId);

    return NextResponse.json({
      message: "Has salido de la comunidad exitosamente"
    });
  } catch (error) {
    console.error("[Community Leave API]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}
