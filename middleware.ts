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

export async function middleware(req: NextRequest) {
  // Update Supabase session
  const { supabaseResponse, user } = await updateSession(req);

  const userId = user?.id;
  const url = new URL(req.url);

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
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
