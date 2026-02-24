import { chat, convertMessagesToModelMessages, toServerSentEventsResponse } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY is not set. Add it to .env.local to use the chat." },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: unknown[]; data?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages: rawMessages = [] } = body;
  const modelMessages = convertMessagesToModelMessages(rawMessages as Parameters<typeof convertMessagesToModelMessages>[0]);

  try {
    const stream = chat({
      adapter: openaiText("gpt-4o-mini"),
      // Runtime shape is correct; types from convertMessagesToModelMessages don't match adapter's strict ConstrainedModelMessage
      messages: modelMessages as never,
    });
    return toServerSentEventsResponse(stream);
  } catch (err) {
    console.error("Chat error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Chat request failed" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
