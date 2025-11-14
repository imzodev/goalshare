// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/server minimal API
vi.mock("next/server", () => {
  class MockNextResponse {
    url?: string;
    status?: number;
    headers = new Headers();
    static redirect(url: URL) {
      const r = new MockNextResponse();
      r.url = url.toString();
      r.status = 307;
      return r as unknown as Response;
    }
    static json(_body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      const r = new MockNextResponse();
      r.status = init?.status ?? 200;
      if (init?.headers) {
        for (const [k, v] of Object.entries(init.headers)) r.headers.set(k, v);
      }
      return r as unknown as Response;
    }
  }
  return {
    NextResponse: MockNextResponse,
    // We don't use NextRequest constructor in our middleware tests
    NextRequest: class {},
  };
});

// Provide a controllable mock for @upstash/redis at top-level (Vitest hoists vi.mock)
const __redisMockStore = { incr: vi.fn(), expire: vi.fn(), ttl: vi.fn() };
vi.mock("@upstash/redis", () => ({
  Redis: class {
    incr = __redisMockStore.incr;
    expire = __redisMockStore.expire;
    ttl = __redisMockStore.ttl;
  },
  __mock: __redisMockStore,
}));

declare module "@upstash/redis" {
  // Extra export only used in tests to reach the vi.fn() mocks
  export const __mock: {
    incr: ReturnType<typeof vi.fn>;
    expire: ReturnType<typeof vi.fn>;
    ttl: ReturnType<typeof vi.fn>;
  };
}

beforeEach(() => {
  // Reset env to default (disable Upstash unless a test enables it)
  (env as any).UPSTASH_REDIS_REST_URL = "";
  (env as any).UPSTASH_REDIS_REST_TOKEN = "";
  (env as any).RATE_LIMIT_WINDOW_SECONDS = "60";
  (env as any).RATE_LIMIT_LIMIT_ANON = "60";
  (env as any).RATE_LIMIT_LIMIT_AUTHED = "60";
  __redisMockStore.incr.mockReset();
  __redisMockStore.expire.mockReset();
  __redisMockStore.ttl.mockReset();
});

// Upstash-backed rate limiting tests
describe("middleware rate limiting with Upstash", () => {
  it("allows request within limit and sets X-RateLimit headers (authenticated)", async () => {
    // Configure env to enable Upstash path and low limits
    (env as any).UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    (env as any).UPSTASH_REDIS_REST_TOKEN = "token";
    (env as any).RATE_LIMIT_WINDOW_SECONDS = "60";
    (env as any).GENERAL_RATE_LIMIT_BACKEND = "upstash";

    // Mock updateSession for authenticated flow
    (updateSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      supabaseResponse: { headers: new Headers() } as unknown as Response,
      user: { id: "u1" },
    });

    const { __mock } = await import("@upstash/redis");
    __mock.incr.mockResolvedValueOnce(1);
    __mock.expire.mockResolvedValueOnce("OK");
    __mock.ttl.mockResolvedValueOnce(59);

    const req = makeRequest("http://localhost:3000/api/test", { ip: "1.2.3.4" });
    const res = (await middleware(req as any)) as TestResponse;

    expect(res.headers.get("X-RateLimit-Limit")).toBe("60");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("59");
    expect(Number(res.headers.get("X-RateLimit-Reset"))).toBeGreaterThan(0);
  });

  it("blocks with 429 and Retry-After when over limit (authenticated)", async () => {
    (env as any).UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    (env as any).UPSTASH_REDIS_REST_TOKEN = "token";
    (env as any).RATE_LIMIT_WINDOW_SECONDS = "60";
    (env as any).GENERAL_RATE_LIMIT_BACKEND = "upstash";

    (updateSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      supabaseResponse: { headers: new Headers() } as unknown as Response,
      user: { id: "u1" },
    });

    const { __mock } = await import("@upstash/redis");
    __mock.incr.mockResolvedValueOnce(61); // over limit for limit=60
    __mock.expire.mockResolvedValueOnce("OK");
    __mock.ttl.mockResolvedValueOnce(30);

    const req = makeRequest("http://localhost:3000/api/test", { ip: "4.3.2.1" });
    const res = (await middleware(req as any)) as TestResponse;

    expect((res as any).status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeDefined();
    expect(res.headers.get("X-RateLimit-Limit")).toBe("60");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(Number(res.headers.get("X-RateLimit-Reset"))).toBeGreaterThan(0);
  });
});

// Mock updateSession to control auth state and response headers
const makeUpdateSessionMock = (user: { id: string } | null, headers?: Headers) => {
  const supabaseResponse = { headers: headers ?? new Headers([["set-cookie", "sb=token"]]) } as unknown as Response;
  return { supabaseResponse, user };
};

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn(),
}));

import { updateSession } from "@/lib/supabase/middleware";
import { middleware } from "@/middleware";

// Allow adjusting env at runtime for limiter configuration
import { env } from "@/config/env";

// In tests we sometimes read a "url" property from our mocked Response
// object returned by the mocked NextResponse helpers. Make it optional.
type TestResponse = Response & { url?: string };

function makeRequest(url: string, opts?: { ip?: string }) {
  const headers = new Headers();
  if (opts?.ip) headers.set("x-forwarded-for", opts.ip);
  return { url, headers } as unknown as Request;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("middleware route protection", () => {
  it("redirects unauthenticated user to /auth/login with redirect param when accessing protected route", async () => {
    (updateSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeUpdateSessionMock(null, new Headers([["set-cookie", "sb=abc"]]))
    );

    const req = makeRequest("http://localhost:3000/dashboard");
    const res = await middleware(req as any);

    // ensure redirect and cookie header preserved
    expect((res as TestResponse).url!).toContain("/auth/login");
    expect((res as TestResponse).url!).toContain("redirect=%2Fdashboard");
    expect(res.headers.get("set-cookie")).toBeDefined();
  });

  it("redirects authenticated user from auth route to /dashboard", async () => {
    (updateSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeUpdateSessionMock({ id: "u1" }, new Headers([["set-cookie", "sb=def"]]))
    );

    const req = makeRequest("http://localhost:3000/auth/login");
    const res = await middleware(req as any);

    expect((res as TestResponse).url!).toContain("/dashboard");
    expect(res.headers.get("set-cookie")).toBeDefined();
  });

  it("passes through for public route when unauthenticated", async () => {
    (updateSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeUpdateSessionMock(null));

    const req = makeRequest("http://localhost:3000/");
    const res = await middleware(req as any);

    // Should be the original supabaseResponse object (no redirect url on our mock)
    expect((res as TestResponse).url).toBeUndefined();
  });

  it("preserves search in redirect param when present", async () => {
    (updateSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeUpdateSessionMock(null));
    const req = makeRequest("http://localhost:3000/dashboard?tab=goals");
    const res = await middleware(req as any);
    expect((res as TestResponse).url!).toContain("redirect=%2Fdashboard%3Ftab%3Dgoals");
  });
});
