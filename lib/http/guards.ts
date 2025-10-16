import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Ensures the request has a JSON body and returns it parsed.
 * - Validates Content-Type includes "application/json" (charset allowed).
 * - Catches JSON parse errors and responds with 415.
 *
 * Usage:
 *   const parsed = await parseJsonOr415<MyType>(req);
 *   if (parsed instanceof NextResponse) return parsed;
 *   const body = parsed; // typed
 */
export async function parseJsonOr415<T = unknown>(req: NextRequest): Promise<T | NextResponse> {
  const contentType = (req.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type inválido" }, { status: 415 });
  }
  try {
    const body = (await req.json()) as T;
    return body;
  } catch {
    return NextResponse.json({ error: "Content-Type inválido" }, { status: 415 });
  }
}
