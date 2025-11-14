import { describe, it, expect, beforeEach, vi } from "vitest";
import { enforceGeneralRateLimit } from "@/utils/middleware/rate-limit";

function makeRequest(method: string = "GET", headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/test", { method, headers });
}

// Minimal shim to NextRequest-like object for our helper (uses NextRequest type, but we just need .headers)
function toNextRequest(req: Request): any {
  return {
    headers: req.headers,
  } as any;
}

describe("utils/middleware/rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  it("limits anonymous and returns remaining/resetAt (memory fallback)", async () => {
    const nextReq = toNextRequest(makeRequest("GET", { "x-forwarded-for": "1.2.3.4" }));
    const windowSeconds = 60;
    const limitAnon = 3;

    // First 3 allowed
    for (let i = 0; i < 3; i++) {
      const res = await enforceGeneralRateLimit({
        req: nextReq,
        userId: null,
        windowSeconds,
        limitAuthed: 100,
        limitAnon,
        upstashUrl: undefined,
        upstashToken: undefined,
      });
      expect(res.limited).toBe(false);
      expect(res.limit).toBe(limitAnon);
      expect(res.remaining).toBe(Math.max(0, limitAnon - (i + 1)));
      expect(typeof res.resetAt).toBe("number");
    }

    // 4th should be limited
    const res4 = await enforceGeneralRateLimit({
      req: nextReq,
      userId: null,
      windowSeconds,
      limitAuthed: 100,
      limitAnon,
      upstashUrl: undefined,
      upstashToken: undefined,
    });
    expect(res4.limited).toBe(true);
    expect(res4.limit).toBe(limitAnon);
    expect(res4.remaining).toBe(0);
  });

  it("separates counters by userId (memory fallback)", async () => {
    const reqA = toNextRequest(makeRequest("GET", { "x-forwarded-for": "1.2.3.4" }));
    const reqB = toNextRequest(makeRequest("GET", { "x-forwarded-for": "1.2.3.4" }));
    const windowSeconds = 60;

    const a1 = await enforceGeneralRateLimit({
      req: reqA,
      userId: "userA",
      windowSeconds,
      limitAuthed: 2,
      limitAnon: 2,
      upstashUrl: undefined,
      upstashToken: undefined,
    });
    const b1 = await enforceGeneralRateLimit({
      req: reqB,
      userId: "userB",
      windowSeconds,
      limitAuthed: 2,
      limitAnon: 2,
      upstashUrl: undefined,
      upstashToken: undefined,
    });
    expect(a1.limited).toBe(false);
    expect(b1.limited).toBe(false);

    const a2 = await enforceGeneralRateLimit({
      req: reqA,
      userId: "userA",
      windowSeconds,
      limitAuthed: 2,
      limitAnon: 2,
      upstashUrl: undefined,
      upstashToken: undefined,
    });
    expect(a2.limited).toBe(false);

    const a3 = await enforceGeneralRateLimit({
      req: reqA,
      userId: "userA",
      windowSeconds,
      limitAuthed: 2,
      limitAnon: 2,
      upstashUrl: undefined,
      upstashToken: undefined,
    });
    expect(a3.limited).toBe(true);

    const b2 = await enforceGeneralRateLimit({
      req: reqB,
      userId: "userB",
      windowSeconds,
      limitAuthed: 2,
      limitAnon: 2,
      upstashUrl: undefined,
      upstashToken: undefined,
    });
    expect(b2.limited).toBe(false);
  });

  it("resets after window elapses (memory fallback)", async () => {
    const req = toNextRequest(makeRequest("GET", { "x-forwarded-for": "5.6.7.8" }));
    const windowSeconds = 60;
    const limit = 1;

    const first = await enforceGeneralRateLimit({
      req,
      userId: null,
      windowSeconds,
      limitAuthed: limit,
      limitAnon: limit,
      upstashUrl: undefined,
      upstashToken: undefined,
    });
    expect(first.limited).toBe(false);

    const second = await enforceGeneralRateLimit({
      req,
      userId: null,
      windowSeconds,
      limitAuthed: limit,
      limitAnon: limit,
      upstashUrl: undefined,
      upstashToken: undefined,
    });
    expect(second.limited).toBe(true);

    // Advance time beyond window and try again
    vi.setSystemTime(new Date("2025-01-01T00:01:01Z"));
    const third = await enforceGeneralRateLimit({
      req,
      userId: null,
      windowSeconds,
      limitAuthed: limit,
      limitAnon: limit,
      upstashUrl: undefined,
      upstashToken: undefined,
    });
    expect(third.limited).toBe(false);
  });
});
