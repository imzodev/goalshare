import { describe, it, expect, vi, beforeEach } from "vitest";
import { deriveAiOp, planDailyLimit, enforceAiRateLimit } from "@/utils/middleware/ai";
import type { RateLimiter } from "@/lib/ai/contracts/ops";

describe("utils/middleware/ai", () => {
  it("deriveAiOp parses operation from pathname", () => {
    expect(deriveAiOp("/api/ai/milestones")).toBe("milestones");
    expect(deriveAiOp("/api/ai/advice")).toBe("advice");
    expect(deriveAiOp("/api/ai/")).toBe("unknown");
    expect(deriveAiOp("/api/ai")).toBe("unknown");
  });

  it("planDailyLimit maps plan to per-day limit", () => {
    expect(planDailyLimit("pro")).toBe(100);
    expect(planDailyLimit("PRO")).toBe(100);
    expect(planDailyLimit("free")).toBe(10);
    expect(planDailyLimit(undefined)).toBe(10);
    expect(planDailyLimit("other" as any)).toBe(10);
  });

  describe("enforceAiRateLimit", () => {
    let calls: Array<{ key: string; options?: any }>;
    let mockLimiter: RateLimiter;

    beforeEach(() => {
      calls = [];
      mockLimiter = {
        consume: vi.fn(async (key: string, options?: any) => {
          calls.push({ key, options });
          return true;
        }),
      };
    });

    it("uses per-user per-op key and returns allowed=true", async () => {
      const res = await enforceAiRateLimit({
        pathname: "/api/ai/milestones",
        userId: "user-1",
        planId: "pro",
        rateLimiter: mockLimiter,
      });
      expect(res.allowed).toBe(true);
      expect(res.limit).toBe(100);
      expect(typeof res.resetAt).toBe("number");
      const consumeCalls = (mockLimiter.consume as any).mock.calls as any[];
      expect(consumeCalls.length).toBe(1);
      const [key, options] = consumeCalls[0];
      expect(key).toBe("ai:milestones:uid:user-1");
      expect(options?.windowMs).toBe(86_400_000);
      expect(options?.limit).toBe(100);
    });

    it("returns allowed=false when limiter denies", async () => {
      (mockLimiter.consume as any).mockResolvedValueOnce(false);
      const res = await enforceAiRateLimit({
        pathname: "/api/ai/advice",
        userId: "user-2",
        planId: "free",
        rateLimiter: mockLimiter,
      });
      expect(res.allowed).toBe(false);
      expect(res.limit).toBe(10);
    });

    it("denies when userId missing", async () => {
      const res = await enforceAiRateLimit({
        pathname: "/api/ai/advice",
        userId: undefined as any,
        planId: "pro",
        rateLimiter: mockLimiter,
      });
      expect(res.allowed).toBe(false);
      expect(res.limit).toBe(0);
      expect((mockLimiter.consume as any).mock.calls.length).toBe(0);
    });
  });
});
