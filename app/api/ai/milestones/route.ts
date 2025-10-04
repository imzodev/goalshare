import { NextResponse } from "next/server";
import { MilestonesRequestSchema, MilestonesResponseSchema } from "../../../../lib/ai/contracts/dto";
import { AgentFactory } from "../../../../lib/ai/registry";

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
    const result = await agent.execute(input);

    // Ensure response matches schema (defensive check)
    const typed = MilestonesResponseSchema.extend({ traceId: MilestonesResponseSchema.shape.traceId }).safeParse({
      ...result.data,
      traceId: result.traceId,
    });

    // Return raw result envelope to keep traceId and meta
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Invalid request" }, { status: 400 });
  }
}
