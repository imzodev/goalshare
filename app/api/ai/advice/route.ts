import { NextResponse } from "next/server";
import { AdviceRequestSchema } from "../../../../lib/ai/contracts/dto";
import { AgentFactory } from "../../../../lib/ai/registry";

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
    const result = await agent.execute(input);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Invalid request" }, { status: 400 });
  }
}
