import { NextResponse } from "next/server";
import { AdviceRequestSchema, AgentFactory } from "@/lib/ai";
import { defaultRateLimiter } from "../../../../utils/ai-ops/rate-limit";
import { defaultCache } from "../../../../utils/ai-ops/cache";
import { defaultTracer } from "../../../../utils/ai-ops/trace";

/**
 * POST /api/ai/advice
 * Validates input and returns a NotImplemented response from the coach stub agent.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = AdviceRequestSchema.parse(body);

    // Hooks: rate-limit/cache/trace can be wired here later

    const agent = AgentFactory.create("coach");
    const result = await agent.execute(input, {
      rateLimiter: defaultRateLimiter,
      cache: defaultCache,
      tracer: defaultTracer,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
