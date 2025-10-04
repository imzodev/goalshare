/**
 * No-op RateLimiter implementation.
 * Satisfies the RateLimiter contract and can be swapped for Redis later.
 */

import type { RateLimiter, RateLimiterConsumeOptions } from "../../lib/ai/contracts/ops";

class NoopRateLimiter implements RateLimiter {
  async consume(_key: string, _options?: RateLimiterConsumeOptions): Promise<boolean> {
    // Always allow in no-op mode
    return true;
  }
}

export const defaultRateLimiter: RateLimiter = new NoopRateLimiter();
