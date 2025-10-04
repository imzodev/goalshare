import { NextResponse } from "next/server";
import { ModerateRequestSchema } from "../../../../lib/ai/contracts/dto";
import { AgentFactory } from "../../../../lib/ai/registry";
import { defaultRateLimiter } from "../../../../utils/ai-ops/rate-limit";
import { defaultCache } from "../../../../utils/ai-ops/cache";
import { defaultTracer } from "../../../../utils/ai-ops/trace";

/**
 * POST /api/ai/moderate
 * Validates input and returns a NotImplemented response from the moderator stub agent.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = ModerateRequestSchema.parse(body);

    // Hooks: rate-limit/cache/trace can be wired here later

    const agent = AgentFactory.create("moderator");
    const result = await agent.execute(input, {
      rateLimiter: defaultRateLimiter,
      cache: defaultCache,
      tracer: defaultTracer,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Invalid request" }, { status: 400 });
  }
}
