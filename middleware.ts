import { updateSession } from "@/lib/supabase/middleware";
import { defaultRateLimiter } from "./utils/ai-ops/rate-limit";
// AI rate limiting handled via handler helper
import { buildCorsHeaders, handlePreflight, enforceCsrf } from "@/utils/middleware/http";
import { isApiRoute, isAiRoute, isProtectedRoute, isAuthRoute } from "@/utils/middleware/routes";
import { handleAiRequest, handleGeneralApiRequest } from "@/utils/middleware/handlers";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/env";
import {
  DEFAULT_APP_URL,
  ALLOWED_ORIGINS,
  GENERAL_WINDOW_SECONDS,
  GENERAL_LIMIT_AUTHED,
  GENERAL_LIMIT_ANON,
} from "@/config/middleware";
import { ROUTES } from "@/config/constants";

export async function middleware(req: NextRequest) {
  // Update Supabase session
  const { supabaseResponse, user, planId } = await updateSession(req);

  const userId = user?.id;
  const url = new URL(req.url);
  const { pathname, search } = url;

  // Protección de rutas: redirigir si no autenticado
  const isProtected = isProtectedRoute(pathname);
  if (isProtected && !user) {
    const loginUrl = new URL(ROUTES.AUTH_LOGIN, req.url);
    loginUrl.searchParams.set("redirect", pathname + (search || ""));
    const redirectResp = NextResponse.redirect(loginUrl);
    // Mantener cabeceras/cookies de supabaseResponse
    for (const [key, value] of supabaseResponse.headers) redirectResp.headers.set(key, value);
    return redirectResp;
  }

  // Redirigir a dashboard si ya está autenticado e intenta ir a páginas de auth
  const isAuth = isAuthRoute(pathname);
  if (isAuth && user) {
    const dest = new URL(ROUTES.DASHBOARD, req.url);
    const redirectResp = NextResponse.redirect(dest);
    for (const [key, value] of supabaseResponse.headers) redirectResp.headers.set(key, value);
    return redirectResp;
  }

  // Solo lógica API para /api/*
  if (isApiRoute(url.pathname)) {
    // ===== CORS & CSRF handling =====
    const appUrl = DEFAULT_APP_URL;
    const allowedOrigins = new Set(ALLOWED_ORIGINS);

    const preflight = handlePreflight(req, allowedOrigins, appUrl);
    if (preflight) return preflight;

    const csrf = enforceCsrf(req, allowedOrigins);
    if (csrf) return csrf;

    // Attach CORS headers to downstream response
    const requestOrigin = req.headers.get("origin") || "";
    const corsHeaders = buildCorsHeaders(requestOrigin, appUrl, allowedOrigins);

    // Clone supabaseResponse to add headers
    for (const [key, value] of Object.entries(corsHeaders)) {
      supabaseResponse.headers.set(key, value);
    }

    // Enforce auth for all API routes (no anonymous access)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // AI routes: delegate to handler
    // EXCEPTION: GET requests (like fetching history) should use the general rate limit
    // so they don't consume the strict AI generation quota.
    if (isAiRoute(url.pathname) && req.method !== "GET") {
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return handleAiRequest({
        req,
        pathname: url.pathname,
        userId,
        planId,
        supabaseResponse,
        rateLimiter: defaultRateLimiter,
      });
    }

    const windowSeconds = GENERAL_WINDOW_SECONDS;
    const limitAuthed = GENERAL_LIMIT_AUTHED;
    const limitAnon = GENERAL_LIMIT_ANON;
    const backendMode: "memory" | "upstash" = env.GENERAL_RATE_LIMIT_BACKEND === "upstash" ? "upstash" : "memory";

    return handleGeneralApiRequest({
      req,
      userId,
      supabaseResponse,
      windowSeconds,
      limitAuthed,
      limitAnon,
      upstashUrl: env.UPSTASH_REDIS_REST_URL,
      upstashToken: env.UPSTASH_REDIS_REST_TOKEN,
      backendMode,
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Ejecutar para todo excepto estáticos y rutas internas
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // Siempre para API
    "/(api|trpc)(.*)",
  ],
};
