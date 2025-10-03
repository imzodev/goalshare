import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

// Sencillo rate limiting en memoria (por IP/usuario) para /api/*
type Counter = { count: number; resetAt: number };
const WINDOW_MS = 60_000; // 1 minuto
const LIMIT = 60; // 60 req por minuto
const globalWithStore = globalThis as typeof globalThis & {
  __rateLimitStore?: Map<string, Counter>;
};
const store: Map<string, Counter> = globalWithStore.__rateLimitStore || new Map();
globalWithStore.__rateLimitStore = store;

function getClientKey(req: NextRequest, userId?: string | null): string {
  const ipHeader = req.headers.get("x-forwarded-for");
  const ip = ipHeader?.split(",")[0]?.trim() || "unknown";
  return userId ? `uid:${userId}` : `ip:${ip}`;
}

// Rutas protegidas y de autenticación
const protectedRoutes = ["/dashboard"];
const authRoutes = ["/auth/login", "/auth/sign-up"];

export async function middleware(req: NextRequest) {
  // Update Supabase session
  const { supabaseResponse, user } = await updateSession(req);

  const userId = user?.id;
  const url = new URL(req.url);
  const { pathname, search } = url;

  // Protección de rutas: redirigir si no autenticado
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname + (search || ""));
    const redirectResp = NextResponse.redirect(loginUrl);
    // Mantener cabeceras/cookies de supabaseResponse
    for (const [key, value] of supabaseResponse.headers) redirectResp.headers.set(key, value);
    return redirectResp;
  }

  // Redirigir a dashboard si ya está autenticado e intenta ir a páginas de auth
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && user) {
    const dest = new URL("/dashboard", req.url);
    const redirectResp = NextResponse.redirect(dest);
    for (const [key, value] of supabaseResponse.headers) redirectResp.headers.set(key, value);
    return redirectResp;
  }

  // Solo rate limit para /api/*
  if (url.pathname.startsWith("/api/")) {
    const key = getClientKey(req, userId);
    const now = Date.now();
    const current = store.get(key);
    if (!current || current.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      current.count += 1;
      if (current.count > LIMIT) {
        const retryAfter = Math.ceil((current.resetAt - now) / 1000);
        return NextResponse.json(
          { error: "Too Many Requests" },
          { status: 429, headers: { "Retry-After": String(retryAfter) } }
        );
      }
      store.set(key, current);
    }
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
