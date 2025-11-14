import type { NextRequest } from "next/server";

type Counter = { count: number; resetAt: number };

// Internal module-level store for fallback memory-based rate limiting
const globalWithStore = globalThis as typeof globalThis & {
  __rlStore?: Map<string, Counter>;
};
const rlStore: Map<string, Counter> = globalWithStore.__rlStore || new Map();
globalWithStore.__rlStore = rlStore;

function getClientKey(req: NextRequest, userId?: string | null): string {
  const ipHeader = req.headers.get("x-forwarded-for");
  const ip = ipHeader?.split(",")[0]?.trim() || "unknown";
  return userId ? `uid:${userId}` : `ip:${ip}`;
}

export async function enforceGeneralRateLimit(params: {
  req: NextRequest;
  userId?: string | null;
  windowSeconds: number;
  limitAuthed: number;
  limitAnon: number;
  upstashUrl?: string | null;
  upstashToken?: string | null;
}): Promise<{ limited: boolean; limit: number; remaining: number; resetAt: number }> {
  const { req, userId, windowSeconds, limitAuthed, limitAnon, upstashUrl, upstashToken } = params;
  const keyIdentity = getClientKey(req, userId || undefined);
  const limit = userId ? limitAuthed : limitAnon;

  const useUpstash = Boolean(upstashUrl && upstashToken);
  if (useUpstash) {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url: upstashUrl as string, token: upstashToken as string });
    const windowKey = `rl:${keyIdentity}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;
    const count = await redis.incr(windowKey as string);
    if (count === 1) await redis.expire(windowKey as string, windowSeconds);
    const limited = Number(count) > limit;
    const remaining = Math.max(0, limit - Number(count));
    const ttl = await redis.ttl(windowKey as string);
    const resetAt = Math.floor(Date.now() / 1000) + (typeof ttl === "number" ? ttl : windowSeconds);
    return { limited, limit, remaining, resetAt };
  }

  const now = Date.now();
  const current = rlStore.get(keyIdentity);
  if (!current || current.resetAt <= now) {
    const resetAt = now + windowSeconds * 1000;
    rlStore.set(keyIdentity, { count: 1, resetAt });
    const remaining = Math.max(0, limit - 1);
    return { limited: false, limit, remaining, resetAt: Math.floor(resetAt / 1000) };
  } else {
    current.count += 1;
    rlStore.set(keyIdentity, current);
    const limited = current.count > limit;
    const remaining = Math.max(0, limit - current.count);
    const resetAt = Math.floor(current.resetAt / 1000);
    return { limited, limit, remaining, resetAt };
  }
}
