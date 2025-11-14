import { NextResponse, type NextRequest } from "next/server";
import { enforceAiRateLimit } from "@/utils/middleware/ai";
import { enforceGeneralRateLimit } from "@/utils/middleware/rate-limit";

function copyHeaders(from: Headers | Record<string, string>, to: Headers) {
  if (from instanceof Headers) {
    for (const [k, v] of from) to.set(k, v);
  } else {
    for (const [k, v] of Object.entries(from)) to.set(k, v);
  }
}

export async function handleAiRequest(params: {
  req: NextRequest;
  pathname: string;
  userId: string;
  planId?: string | null;
  supabaseResponse: NextResponse;
  rateLimiter: { consume: (key: string, opts?: any) => Promise<boolean> };
}) {
  const { req, pathname, userId, planId, supabaseResponse, rateLimiter } = params;

  const requestHeaders = new Headers(req.headers);
  // strip client-provided sensitive headers and inject trusted values
  requestHeaders.delete("x-user-id");
  requestHeaders.delete("x-user-plan");
  requestHeaders.set("x-user-id", userId);
  if (planId) requestHeaders.set("x-user-plan", planId);

  const { allowed, limit, resetAt } = await enforceAiRateLimit({ pathname, userId, planId, rateLimiter });
  if (!allowed) {
    const headers: Record<string, string> = {};
    if (typeof limit === "number") headers["X-RateLimit-Limit"] = String(limit);
    if (typeof resetAt === "number") headers["X-RateLimit-Reset"] = String(resetAt);
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers });
  }

  const next = NextResponse.next({ request: { headers: requestHeaders } });
  copyHeaders(supabaseResponse.headers, next.headers);
  if (typeof limit === "number") next.headers.set("X-RateLimit-Limit", String(limit));
  if (typeof resetAt === "number") next.headers.set("X-RateLimit-Reset", String(resetAt));
  return next;
}

export async function handleGeneralApiRequest(params: {
  req: NextRequest;
  userId?: string | null;
  supabaseResponse: NextResponse;
  windowSeconds: number;
  limitAuthed: number;
  limitAnon: number;
  upstashUrl?: string | null;
  upstashToken?: string | null;
}) {
  const { req, userId, supabaseResponse, windowSeconds, limitAuthed, limitAnon, upstashUrl, upstashToken } = params;

  const { limited, limit, remaining, resetAt } = await enforceGeneralRateLimit({
    req,
    userId,
    windowSeconds,
    limitAuthed,
    limitAnon,
    upstashUrl,
    upstashToken,
  });

  supabaseResponse.headers.set("X-RateLimit-Limit", String(limit));
  supabaseResponse.headers.set("X-RateLimit-Remaining", String(remaining));
  supabaseResponse.headers.set("X-RateLimit-Reset", String(resetAt));

  if (limited) {
    const retryAfter = Math.max(1, resetAt - Math.floor(Date.now() / 1000));
    return NextResponse.json(
      { error: "Too Many Requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(resetAt),
        },
      }
    );
  }

  return supabaseResponse;
}
