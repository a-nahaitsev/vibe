"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WhoAmIHomePage() {
  const router = useRouter();
  const [createName, setCreateName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinName, setJoinName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const name = createName.trim();
    if (!name) {
      setError("Enter your name");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/whoami/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create room");
      router.push(`/whoami/room/${data.roomId}?playerId=${data.playerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const roomId = joinRoomId.trim();
    const name = joinName.trim();
    if (!roomId || !name) {
      setError("Enter room code and your name");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/whoami/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerName: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to join");
      router.push(`/whoami/room/${roomId}?playerId=${data.playerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-md space-y-8">
        <div>
          <Link href="/" className="text-sm text-zinc-500 hover:underline">
            ← Back to Welcome
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Who Am I? (Multiplayer)
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Guess the player from textual clues. Play with friends from anywhere — each sees one tip at a time; answer or skip. When everyone has decided, the next tip appears. When everyone has answered, you see each other&apos;s answers.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </p>
        )}

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Create a game
          </h2>
          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {loading ? "Creating…" : "Create game"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Join a game
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Ask the host for the room code (e.g. room-abc123).
          </p>
          <form onSubmit={handleJoin} className="mt-4 space-y-3">
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="Room code"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              disabled={loading}
            />
            <input
              type="text"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              {loading ? "Joining…" : "Join game"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
