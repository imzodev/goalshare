import { NextResponse, type NextRequest } from "next/server";

export function buildCorsHeaders(
  requestOrigin: string,
  appUrl: string,
  allowedOrigins: Set<string>
): Record<string, string> {
  const headers: Record<string, string> = { Vary: "Origin" };
  if (requestOrigin && isAllowedOrigin(requestOrigin, allowedOrigins)) {
    headers["Access-Control-Allow-Origin"] = requestOrigin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else {
    headers["Access-Control-Allow-Origin"] = appUrl;
  }
  return headers;
}

export function isAllowedOrigin(origin: string, allowedOrigins: Set<string>): boolean {
  if (!origin) return false;
  try {
    const o = new URL(origin);
    for (const allowed of allowedOrigins) {
      const a = new URL(allowed);
      if (o.protocol === a.protocol && o.host === a.host) return true;
    }
  } catch {}
  return false;
}

export function handlePreflight(req: NextRequest, allowedOrigins: Set<string>, appUrl: string): NextResponse | null {
  if (req.method !== "OPTIONS") return null;
  const requestOrigin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": req.headers.get("access-control-request-headers") || "content-type, authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (requestOrigin && isAllowedOrigin(requestOrigin, allowedOrigins)) {
    headers["Access-Control-Allow-Origin"] = requestOrigin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else {
    headers["Access-Control-Allow-Origin"] = appUrl;
  }
  return new NextResponse(null, { status: 204, headers });
}

export function enforceCsrf(req: NextRequest, allowedOrigins: Set<string>): NextResponse | null {
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (!isMutating) return null;
  const requestOrigin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  if (requestOrigin) {
    if (!isAllowedOrigin(requestOrigin, allowedOrigins)) {
      return NextResponse.json({ error: "Origin no permitido" }, { status: 403 });
    }
  } else if (referer) {
    try {
      const ref = new URL(referer);
      const allowed = Array.from(allowedOrigins).some((o) => {
        const a = new URL(o);
        return ref.protocol === a.protocol && ref.host === a.host;
      });
      if (!allowed) return NextResponse.json({ error: "Origin no permitido" }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Origin no permitido" }, { status: 403 });
    }
  }
  return null;
}
