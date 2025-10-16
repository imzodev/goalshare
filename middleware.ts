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
    // ===== CORS & CSRF handling =====
    // Allowed origins: main app URL and localhost for dev
    const requestOrigin = req.headers.get("origin") || "";
    const referer = req.headers.get("referer") || "";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const allowedOrigins = new Set([appUrl, "http://localhost:3000", "https://localhost:3000"]);

    const isAllowedOrigin = (origin: string) => {
      if (!origin) return false;
      try {
        const o = new URL(origin);
        for (const allowed of allowedOrigins) {
          const a = new URL(allowed);
          if (o.protocol === a.protocol && o.host === a.host) return true;
        }
      } catch {}
      return false;
    };

    // Preflight
    if (req.method === "OPTIONS") {
      const preflightHeaders: Record<string, string> = {
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers":
          req.headers.get("access-control-request-headers") || "content-type, authorization",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      };
      if (requestOrigin && isAllowedOrigin(requestOrigin)) {
        preflightHeaders["Access-Control-Allow-Origin"] = requestOrigin;
        preflightHeaders["Access-Control-Allow-Credentials"] = "true";
      } else {
        preflightHeaders["Access-Control-Allow-Origin"] = appUrl;
      }
      return new NextResponse(null, { status: 204, headers: preflightHeaders });
    }

    // CSRF: enforce same-origin for mutating methods from browsers
    const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
    if (isMutating) {
      // If Origin present, require it to be allowed. If no Origin, try Referer host match.
      if (requestOrigin) {
        if (!isAllowedOrigin(requestOrigin)) {
          return NextResponse.json({ error: "Origin no permitido" }, { status: 403 });
        }
      } else if (referer) {
        try {
          const ref = new URL(referer);
          const allowed = Array.from(allowedOrigins).some((o) => {
            const a = new URL(o);
            return ref.protocol === a.protocol && ref.host === a.host;
          });
          if (!allowed) {
            return NextResponse.json({ error: "Origin no permitido" }, { status: 403 });
          }
        } catch {
          // Malformed referer: block
          return NextResponse.json({ error: "Origin no permitido" }, { status: 403 });
        }
      }
    }

    // Attach CORS headers to downstream response
    const corsHeaders: Record<string, string> = { Vary: "Origin" };
    if (requestOrigin && isAllowedOrigin(requestOrigin)) {
      corsHeaders["Access-Control-Allow-Origin"] = requestOrigin;
      corsHeaders["Access-Control-Allow-Credentials"] = "true";
    } else {
      corsHeaders["Access-Control-Allow-Origin"] = appUrl;
    }

    // Clone supabaseResponse to add headers
    for (const [key, value] of Object.entries(corsHeaders)) {
      supabaseResponse.headers.set(key, value);
    }

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
