"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { WhoAmIRoom } from "../../_lib/types";
import { filterSuggestions } from "../../_lib/questions";

const POLL_INTERVAL_MS = 1500;

export default function WhoAmIRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const playerId = searchParams.get("playerId") ?? "";

  const [room, setRoom] = useState<WhoAmIRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionHighlight, setSuggestionHighlight] = useState(0);

  const fetchRoom = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/whoami/room/${roomId}`);
      if (res.status === 404) {
        setError("Room not found");
        setRoom(null);
        return;
      }
      const data = await res.json();
      setRoom(data);
      setError("");
    } catch {
      setError("Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
    const t = setInterval(fetchRoom, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fetchRoom]);

  const isCreator = room?.creatorId === playerId;
  const me = room?.players.find((p) => p.playerId === playerId);
  const canAct = me && me.action === null && room?.phase === "playing";
  /** All clues revealed so far (0..currentClueIndex); newest is the last one */
  const revealedClues =
    room?.phase === "playing" && room.clues.length
      ? room.clues.slice(0, room.currentClueIndex + 1)
      : [];
  const hasCurrentClue = revealedClues.length > 0;

  const suggestions = useMemo(
    () => filterSuggestions(answerInput, 10),
    [answerInput]
  );
  const showSuggestions = canAct && suggestionsOpen && suggestions.length > 0;
  const highlightedIndex = Math.min(suggestionHighlight, Math.max(0, suggestions.length - 1));

  async function handleStart() {
    if (!roomId || !playerId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/whoami/room/${roomId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      await fetchRoom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleNextRound() {
    if (!roomId || !playerId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/whoami/room/${roomId}/next-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      await fetchRoom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start next round");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubmitAction(action: "answer" | "skip") {
    if (!roomId || !playerId) return;
    if (action === "answer" && !answerInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/whoami/room/${roomId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          action,
          answer: action === "answer" ? answerInput.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setAnswerInput("");
      setSuggestionsOpen(false);
      await fetchRoom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  }

  function pickSuggestion(name: string) {
    setAnswerInput(name);
    setSuggestionsOpen(false);
    setSuggestionHighlight(0);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestionHighlight((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestionHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && suggestions[highlightedIndex]) {
      e.preventDefault();
      pickSuggestion(suggestions[highlightedIndex]!);
    } else if (e.key === "Escape") {
      setSuggestionsOpen(false);
    }
  }

  if (loading && !room) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-zinc-500 dark:text-zinc-400">Loading room…</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="p-6">
        <Link href="/whoami" className="text-sm text-zinc-500 hover:underline">
          ← Back
        </Link>
        <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!room) return null;

  return (
    <main className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/whoami" className="text-sm text-zinc-500 hover:underline">
            ← Back
          </Link>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Room: <code className="font-mono">{roomId}</code>
          </span>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </p>
        )}

        {/* Lobby */}
        {room.phase === "lobby" && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Waiting for players
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Share the room code with friends: <strong className="font-mono">{roomId}</strong>
            </p>
            <ul className="mt-4 space-y-2">
              {room.players.map((p) => (
                <li
                  key={p.playerId}
                  className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {p.name}
                  {p.playerId === room.creatorId && (
                    <span className="text-xs text-zinc-500">(host)</span>
                  )}
                </li>
              ))}
            </ul>
            {isCreator && (
              <button
                type="button"
                onClick={handleStart}
                disabled={actionLoading || room.players.length < 1}
                className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                {actionLoading ? "Starting…" : "Start game"}
              </button>
            )}
          </div>
        )}

        {/* Playing */}
        {room.phase === "playing" && hasCurrentClue && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Who am I?
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Tip {room.currentClueIndex + 1} of {room.clues.length}
            </p>
            <ul className="mt-4 space-y-3">
              {revealedClues.map((clue, i) => {
                const isNewest = i === revealedClues.length - 1;
                return (
                  <li
                    key={i}
                    className={
                      "rounded-lg border px-4 py-3 " +
                      (isNewest
                        ? "border-emerald-400 bg-emerald-50 text-zinc-900 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-zinc-100"
                        : "border-zinc-200 bg-zinc-50/50 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-300")
                    }
                  >
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Tip {i + 1}
                      {isNewest && " (newest)"}
                    </span>
                    <p className="mt-1 text-lg">&ldquo;{clue}&rdquo;</p>
                  </li>
                );
              })}
            </ul>

            {canAct ? (
              <div className="mt-6 space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={answerInput}
                    onChange={(e) => {
                      setAnswerInput(e.target.value);
                      setSuggestionsOpen(true);
                      setSuggestionHighlight(0);
                    }}
                    onFocus={() => setSuggestionsOpen(true)}
                    onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Your guess (player name)"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-400"
                    disabled={actionLoading}
                    autoComplete="off"
                  />
                  {showSuggestions && (
                    <ul
                      className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-600 dark:bg-zinc-800"
                      role="listbox"
                    >
                      {suggestions.map((name, i) => (
                        <li
                          key={name}
                          role="option"
                          aria-selected={i === highlightedIndex}
                          className={
                            "cursor-pointer px-3 py-2 text-sm " +
                            (i === highlightedIndex
                              ? "bg-emerald-100 text-zinc-900 dark:bg-emerald-900/50 dark:text-zinc-100"
                              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700")
                          }
                          onMouseDown={(e) => {
                            e.preventDefault();
                            pickSuggestion(name);
                          }}
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSubmitAction("answer")}
                    disabled={actionLoading || !answerInput.trim()}
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  >
                    {actionLoading ? "…" : "Submit answer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmitAction("skip")}
                    disabled={actionLoading}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : me?.action === "answer" ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                You answered: <strong>{me.answerText}</strong>. Waiting for others…
              </p>
            ) : me?.action === "skip" ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                You skipped. Waiting for others…
              </p>
            ) : null}

            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              {room.players.filter((p) => p.action !== null).length} / {room.players.length} players
              decided
            </p>
          </div>
        )}

        {/* Reveal */}
        {room.phase === "reveal" && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              The answer
            </h2>
            <p className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {room.correctAnswer}
            </p>
            <h3 className="mt-6 font-medium text-zinc-800 dark:text-zinc-200">
              Everyone&apos;s answers
            </h3>
            <ul className="mt-3 space-y-2">
              {room.players.map((p) => {
                const correct =
                  p.answerText !== null &&
                  p.answerText.trim().toLowerCase() ===
                    room.correctAnswer.toLowerCase();
                return (
                  <li
                    key={p.playerId}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-600"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {p.name}
                    </span>
                    <span
                      className={
                        correct
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-600 dark:text-zinc-400"
                      }
                    >
                      {p.answerText ?? "—"} {correct ? "✓" : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              {isCreator && (
                <button
                  type="button"
                  onClick={handleNextRound}
                  disabled={actionLoading}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  {actionLoading ? "Starting…" : "Next round (guess another player)"}
                </button>
              )}
              <Link
                href="/whoami"
                className="inline-block rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              >
                Leave room
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
