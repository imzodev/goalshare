import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AgentFactory } from "@/lib/ai/registry";
import { CoachRequestSchema } from "@/lib/ai/contracts/dto";
import { CoachingService } from "@/services/coaching-service";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const body = await req.json();
    const validation = CoachRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request", details: validation.error }, { status: 400 });
    }

    const { goalId, message, traceId, stream } = validation.data;
    const coachingService = new CoachingService();

    // 1. Verify goal ownership and get context
    const goal = await coachingService.verifyGoalOwnership(userId, goalId);

    if (!goal) {
      return NextResponse.json({ error: "Goal not found or access denied" }, { status: 404 });
    }

    // TODO: Revisar si es eficiente estar mandando el contexto cada vez que mandamos un mensaje
    // 2. Fetch recent chat history for context
    const conversationHistory = await coachingService.getHistoryForContext(userId, goalId);

    // 3. Construct prompt for the AI
    // We include the goal context and the history
    const systemContext = `
You are a helpful coaching assistant.
User Goal: "${goal.title}"
Description: "${goal.description}"
Current Status: ${goal.status}
Progress: ${goal.currentProgress}%

Provide concise, motivating, and actionable advice relevant to this goal.
Use Markdown formatting (bold, lists, etc.) to make the response easy to read.
`;

    const agent = AgentFactory.create("coach");

    // We need to pass the conversation history + new message to the agent.
    const fullPrompt = `
${systemContext}

Previous conversation:
${conversationHistory.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

USER: ${message}
ASSISTANT:
`.trim();

    // 4. Save user message to DB immediately
    await coachingService.saveMessage(userId, goalId, "user", message);

    if (stream && agent.stream) {
      const { stream: textStream, completed } = await agent.stream(fullPrompt, { traceId });
      let fullResponse = "";

      const transformStream = new TransformStream({
        transform(chunk, controller) {
          // The chunk is already a string from toTextStream()
          const text = typeof chunk === "string" ? chunk : String(chunk);
          fullResponse += text;
          controller.enqueue(chunk);
        },
      });

      // Save the assistant message after the stream completes
      completed
        .then(() => {
          coachingService.saveMessage(userId, goalId, "assistant", fullResponse);
        })
        .catch((err) => {
          console.error("[Coaching API] Error saving streamed message:", err);
        });

      return new NextResponse(textStream.pipeThrough(transformStream), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      });
    }

    const result = await agent.execute(fullPrompt, { traceId });

    // The result.data.finalOutput is 'unknown', usually string for simple agents
    const aiResponseText =
      typeof result.data.finalOutput === "string" ? result.data.finalOutput : JSON.stringify(result.data.finalOutput);

    // 4. Save assistant message to DB
    await coachingService.saveMessage(userId, goalId, "assistant", aiResponseText);

    return NextResponse.json({
      response: aiResponseText,
      traceId: result.traceId,
    });
  } catch (error) {
    console.error("[Coaching API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get("goalId");
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    if (!goalId) {
      return NextResponse.json({ error: "Missing goalId" }, { status: 400 });
    }

    // Parse pagination parameters
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

    const coachingService = new CoachingService();

    // Service handles ownership verification internally
    try {
      const messages = await coachingService.getHistory(user.id, goalId, { limit, offset });

      // Return messages with metadata about pagination
      return NextResponse.json({
        messages,
        pagination: {
          limit,
          offset,
          count: messages.length,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "Goal not found or access denied") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error("[Coaching API] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
