import type { RateLimiter, RateLimiterConsumeOptions } from "../../lib/ai/contracts/ops";
import { env } from "@/config/env";

class InMemoryRateLimiter implements RateLimiter {
  store = new Map<string, { count: number; resetAt: number }>();
  async consume(key: string, options?: RateLimiterConsumeOptions): Promise<boolean> {
    const points = Math.max(1, Math.floor(options?.points ?? 1));
    const windowMs = Math.max(1000, Math.floor(options?.windowMs ?? 60_000));
    const now = Date.now();
    const bucket = Math.floor(now / windowMs);
    const bucketKey = `${key}:${bucket}`;
    const current = this.store.get(bucketKey);
    if (!current) {
      this.store.set(bucketKey, { count: points, resetAt: bucket * windowMs + windowMs });
      return true;
    }
    current.count += points;
    this.store.set(bucketKey, current);
    const limit = Number(options?.limit ?? env.RATE_LIMIT_LIMIT_AUTHED ?? "60");
    return current.count <= limit;
  }
}

class UpstashRateLimiter implements RateLimiter {
  private url = env.UPSTASH_REDIS_REST_URL;
  private token = env.UPSTASH_REDIS_REST_TOKEN;

  async consume(key: string, options?: RateLimiterConsumeOptions): Promise<boolean> {
    const points = Math.max(1, Math.floor(options?.points ?? 1));
    const windowMs = Math.max(1000, Math.floor(options?.windowMs ?? 60_000));
    const windowSeconds = Math.ceil(windowMs / 1000);
    const now = Date.now();
    const bucket = Math.floor(now / windowMs);
    const bucketKey = `rl:ai:${key}:${bucket}`;

    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url: this.url, token: this.token });

    const count = await redis.incrby(bucketKey, points as number);
    if (count === points) {
      await redis.expire(bucketKey, windowSeconds);
    }

    const limit = Number(options?.limit ?? env.RATE_LIMIT_LIMIT_AUTHED ?? "60");
    return Number(count) <= limit;
  }
}

function makeDefaultLimiter(): RateLimiter {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return new UpstashRateLimiter();
  }
  return new InMemoryRateLimiter();
}

export const defaultRateLimiter: RateLimiter = makeDefaultLimiter();
