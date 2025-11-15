import type { RateLimiter } from "@/lib/ai/contracts/ops";

export function deriveAiOp(pathname: string): string {
  const segments = pathname.split("/");
  // e.g., /api/ai/milestones -> "milestones"
  return segments[3] || "unknown";
}

export function planDailyLimit(planId?: string): number {
  const plan = (planId || "free").toLowerCase();
  return plan === "pro" ? 100 : 10;
}

export async function enforceAiRateLimit(params: {
  pathname: string;
  userId?: string | null;
  planId?: string | null;
  rateLimiter: RateLimiter;
}): Promise<{ allowed: boolean; limit: number; remaining?: number; resetAt?: number }> {
  const { pathname, userId, planId, rateLimiter } = params;
  if (!userId) return { allowed: false, limit: 0 };
  const op = deriveAiOp(pathname);
  const limit = planDailyLimit(planId || undefined);
  const windowMs = 86_400_000;
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const key = `ai:${op}:uid:${userId}`;
  const allowed = await rateLimiter.consume(key, { windowMs, limit });
  // We cannot know remaining without extra reads; compute optimistic remaining when allowed.
  // As an approximation, omit remaining/resetAt unless we implement a Read op in RateLimiter.
  const resetAt = Math.floor((bucket + 1) * (windowMs / 1000));
  return { allowed, limit, remaining: undefined, resetAt };
}
