"use client";

import { useState } from "react";
import Link from "next/link";

export default function DuelPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [status, setStatus] = useState<"idle" | "creating" | "joining">("idle");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/football-quiz" className="text-sm text-zinc-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        1v1 Duel
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Real-time quiz against a friend. Same questions, first to finish or higher score wins.
      </p>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => setStatus("creating")}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            Create duel
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invite code"
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-400"
            />
            <button
              type="button"
              onClick={() => setStatus("joining")}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Join
            </button>
          </div>
        </div>
        {status === "creating" && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Creating duel… Use Supabase Realtime or WebSockets to sync with your opponent.
          </p>
        )}
        {status === "joining" && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Joining… Connect to the same room via Realtime/WebSockets.
          </p>
        )}
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Implement with Supabase Realtime or a WebSocket server: create a room, share room ID, then push same questions and compare answers in real time.
      </p>
    </div>
  );
}
