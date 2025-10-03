import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import { env } from "@/config/env";
import { PostsService, createCommunityPostSchema } from "@/services/posts-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const postsService = new PostsService();

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[Auth] getUser failed:", authError?.message);
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = user.id;
    const { id: communityId } = await params;
    if (!communityId) {
      return NextResponse.json({ error: "ID de comunidad requerido" }, { status: 400 });
    }

    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
    const sanitizedLimit = Number.isFinite(limit) && limit! > 0 && limit! <= 100 ? limit! : 25;

    const posts = await postsService.listCommunityPosts(userId, communityId, sanitizedLimit);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[CommunityPosts GET]", error);
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    const status = message.includes("No eres miembro") || message.includes("Necesitas ser miembro") ? 403 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[Auth] getUser failed:", authError?.message);
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = user.id;
    // TODO: Refactorizar, esto no deberia estar aqui, esto debe ser manejado por un middleware
    const origin = request.headers.get("origin") || "";
    if (!origin || !origin.startsWith(env.NEXT_PUBLIC_APP_URL)) {
      return NextResponse.json({ error: "Origin no permitido" }, { status: 403 });
    }

    const contentType = (request.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type inválido" }, { status: 415 });
    }

    const { id: communityId } = await params;
    if (!communityId) {
      return NextResponse.json({ error: "ID de comunidad requerido" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createCommunityPostSchema.safeParse({ ...body, communityId });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const post = await postsService.createPost(userId, parsed.data);

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[CommunityPosts POST]", error);
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    const status =
      message.includes("No eres miembro") || message.includes("Necesitas ser miembro")
        ? 403
        : message.includes("vacío") || message.includes("caracteres")
          ? 400
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
