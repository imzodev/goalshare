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
    expect((res as TestResponse).url).toContain("/auth/login");
    expect((res as TestResponse).url).toContain("redirect=%2Fdashboard");
    expect(res.headers.get("set-cookie")).toBe("sb=abc");
  });

  it("redirects authenticated user from auth route to /dashboard", async () => {
    (updateSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeUpdateSessionMock({ id: "u1" }, new Headers([["set-cookie", "sb=def"]]))
    );

    const req = makeRequest("http://localhost:3000/auth/login");
    const res = await middleware(req as any);

    expect((res as TestResponse).url).toContain("/dashboard");
    expect(res.headers.get("set-cookie")).toBe("sb=def");
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
    expect((res as TestResponse).url).toContain("redirect=%2Fdashboard%3Ftab%3Dgoals");
  });
});
