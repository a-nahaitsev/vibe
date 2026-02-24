"use client";

import Link from "next/link";
import { useState } from "react";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";

export default function TanStackAIExamplePage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, isLoading, error, clear } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link
          href="/"
          className="inline-block text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Back to Welcome
        </Link>
        <h1 className="text-2xl font-semibold">TanStack AI example</h1>

        <p className="text-sm text-zinc-600">
          Streaming chat using <strong>@tanstack/ai</strong>,{" "}
          <strong>@tanstack/ai-react</strong>, and <strong>@tanstack/ai-openai</strong>.
          The server runs <strong>chat()</strong> with <strong>openaiText(&quot;gpt-4o-mini&quot;)</strong> and
          streams via <strong>toServerSentEventsResponse</strong>. The client uses{" "}
          <strong>useChat</strong> with <strong>fetchServerSentEvents(&quot;/api/chat&quot;)</strong>.
        </p>

        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Set <strong>OPENAI_API_KEY</strong> in <code className="rounded bg-amber-100 px-1">.env.local</code> for the
          chat to work. Restart the dev server after adding it.
        </p>

        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error.message}
          </p>
        )}

        <div className="flex flex-1 flex-col gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700">Messages</span>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => clear()}
                className="text-sm text-zinc-500 underline hover:text-zinc-700"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex min-h-[200px] flex-col gap-3 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-sm text-zinc-500">Send a message to start.</p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "assistant"
                    ? "self-start rounded-lg bg-white px-3 py-2 shadow-sm"
                    : "self-end rounded-lg bg-zinc-800 px-3 py-2 text-white"
                }
              >
                <div className="mb-1 text-xs font-medium opacity-80">
                  {message.role === "assistant" ? "Assistant" : "You"}
                </div>
                <div className="text-sm">
                  {message.parts.map((part, idx) => {
                    if (part.type === "thinking") {
                      return (
                        <div
                          key={idx}
                          className="mb-2 border-l-2 border-zinc-300 pl-2 text-xs italic text-zinc-500"
                        >
                          <span role="img" aria-label="Thought">💭</span> {part.content}
                        </div>
                      );
                    }
                    if (part.type === "text") {
                      return <div key={idx}>{part.content}</div>;
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <p className="text-sm text-zinc-500">Thinking…</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>

        <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <h2 className="mb-2 text-sm font-medium text-zinc-800">Takeaways</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
            <li>
              <strong>Server:</strong> <code>chat({`{ adapter: openaiText("gpt-4o-mini"), messages }`})</code> returns a
              stream; <code>toServerSentEventsResponse(stream)</code> turns it into an HTTP response.
            </li>
            <li>
              <strong>Client:</strong> <code>useChat({`{ connection: fetchServerSentEvents("/api/chat") }`})</code> —
              use <code>messages</code>, <code>sendMessage</code>, <code>isLoading</code>, <code>error</code>, <code>clear</code>.
            </li>
            <li>
              <strong>Messages</strong> have <code>role</code> and <code>parts</code> (e.g. <code>type: &quot;text&quot;</code> or <code>&quot;thinking&quot;</code>).
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
