import { NextResponse } from "next/server";
import { MilestonesRequestSchema, AgentFactory } from "@/lib/ai";
import { defaultRateLimiter } from "../../../../utils/ai-ops/rate-limit";
import { defaultCache } from "../../../../utils/ai-ops/cache";
import { defaultTracer } from "../../../../utils/ai-ops/trace";

/**
 * POST /api/ai/milestones
 * Validates input and returns a NotImplemented response from the planner stub agent.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = MilestonesRequestSchema.parse(body);

    // Hooks: rate-limit/cache/trace can be wired here later

    const agent = AgentFactory.create("planner");
    const result = await agent.execute(input, {
      rateLimiter: defaultRateLimiter,
      cache: defaultCache,
      tracer: defaultTracer,
    });

    // Return raw result envelope to keep traceId and meta
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Invalid request" }, { status: 400 });
  }
}
