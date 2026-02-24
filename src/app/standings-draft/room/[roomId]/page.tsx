"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { StandingsDraftRoom, StandingRow } from "../../_lib/types";
import { LEAGUES, LEAGUE_TO_COUNTRY } from "../../_lib/leagues";
import {
  getCachedStandings,
  setCachedStandings,
} from "../../_lib/standings-cache";

const POLL_INTERVAL_MS = 2000;
const SEASONS = [2022, 2023, 2024] as const;
const MIN_SUGGESTION_CHARS = 2;
const MAX_SUGGESTIONS = 10;

export default function StandingsDraftRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const playerId = searchParams.get("playerId") ?? "";

  const [room, setRoom] = useState<StandingsDraftRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [startSeason, setStartSeason] = useState<number>(2023);
  const [startLeagueId, setStartLeagueId] = useState<number>(39);
  const [guessInput, setGuessInput] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionHighlight, setSuggestionHighlight] = useState(0);
  const [teamNames, setTeamNames] = useState<string[]>([]);

  const fetchRoom = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/standings-draft/room/${roomId}`);
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
  const currentPlayer = room?.players[room?.currentPlayerIndex ?? 0];
  const isMyTurn = currentPlayer?.playerId === playerId;
  const country =
    room?.league != null ? LEAGUE_TO_COUNTRY[room.league] : null;

  useEffect(() => {
    if (!country || room?.phase !== "playing") return;
    let cancelled = false;
    fetch(`/api/standings-draft/teams?country=${country}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.names)) setTeamNames(data.names);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [country, room?.phase]);

  const suggestions = useMemo(() => {
    if (guessInput.trim().length < MIN_SUGGESTION_CHARS) return [];
    const q = guessInput.trim().toLowerCase();
    return teamNames
      .filter((name) => name.toLowerCase().includes(q))
      .slice(0, MAX_SUGGESTIONS);
  }, [teamNames, guessInput]);
  const showSuggestions =
    isMyTurn && suggestionsOpen && suggestions.length > 0;
  const highlightedIndex = Math.min(
    suggestionHighlight,
    Math.max(0, suggestions.length - 1)
  );

  async function handleStart() {
    if (!roomId || !playerId) return;
    setActionLoading(true);
    try {
      const cached = getCachedStandings(startLeagueId, startSeason);
      const body: {
        playerId: string;
        season: number;
        league: number;
        standings?: StandingRow[];
        leagueName?: string;
      } = {
        playerId,
        season: startSeason,
        league: startLeagueId,
      };
      if (cached) {
        body.standings = cached.standings;
        body.leagueName = cached.leagueName;
      }
      const res = await fetch(`/api/standings-draft/room/${roomId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start");
      if (!cached && data.standings && data.leagueName) {
        setCachedStandings(
          startLeagueId,
          startSeason,
          data.leagueName,
          data.standings
        );
      }
      await fetchRoom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubmitGuess(teamName: string) {
    const trimmed = teamName.trim();
    if (!roomId || !playerId || !trimmed) return;
    setActionLoading(true);
    setGuessInput("");
    setSuggestionsOpen(false);
    try {
      const res = await fetch(`/api/standings-draft/room/${roomId}/pick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, teamName: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to pick");
      await fetchRoom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pick");
    } finally {
      setActionLoading(false);
    }
  }

  function pickSuggestion(name: string) {
    setGuessInput(name);
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
    } else if (e.key === "Enter") {
      e.preventDefault();
      const toSubmit = suggestions[highlightedIndex] ?? guessInput.trim();
      if (toSubmit) handleSubmitGuess(toSubmit);
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
        <Link href="/standings-draft" className="text-sm text-zinc-500 hover:underline">
          ← Back
        </Link>
        <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!room) return null;

  return (
    <main className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href="/standings-draft" className="text-sm text-zinc-500 hover:underline">
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
              Share the room code: <strong className="font-mono">{roomId}</strong>
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
              <div className="mt-6 space-y-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  League
                </label>
                <select
                  value={startLeagueId}
                  onChange={(e) => setStartLeagueId(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
                >
                  {LEAGUES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.flag} {l.country} – {l.name}
                    </option>
                  ))}
                </select>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Season
                </label>
                <select
                  value={startSeason}
                  onChange={(e) => setStartSeason(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={actionLoading || room.players.length < 1}
                  className="mt-2 block w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  {actionLoading ? "Loading standings…" : "Start game"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Playing / Finished: standings table */}
        {(room.phase === "playing" || room.phase === "finished") && room.standings.length > 0 && (
          <>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {room.leagueName} {room.season}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {room.revealedRanks.length} / {room.standings.length} teams revealed
              </p>
              {room.phase === "playing" && (
                <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {isMyTurn
                    ? "Your turn — type a team name to guess."
                    : `Waiting for ${currentPlayer?.name ?? "…"} to guess.`}
                </p>
              )}
            </div>

            {/* Last pick feedback */}
            {room.lastPick && room.phase === "playing" && (
              <div
                className={
                  "rounded-xl border px-4 py-3 " +
                  (room.lastPick.correct
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                    : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20")
                }
              >
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  {room.players.find((p) => p.playerId === room.lastPick!.playerId)
                    ?.name ?? "Someone"}{" "}
                  guessed &ldquo;{room.lastPick.teamName}&rdquo; —{" "}
                  {room.lastPick.correct ? (
                    <>correct! +{room.lastPick.points} pts</>
                  ) : (
                    "wrong, 0 pts"
                  )}
                </p>
              </div>
            )}

            {/* Guess input (current player only) */}
            {room.phase === "playing" && isMyTurn && (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Guess a team in the standings
                </label>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Type at least 2 letters for suggestions. Wrong guess = 0 pts, turn passes.
                </p>
                <div className="relative mt-3">
                  <input
                    type="text"
                    value={guessInput}
                    onChange={(e) => {
                      setGuessInput(e.target.value);
                      setSuggestionsOpen(true);
                      setSuggestionHighlight(0);
                    }}
                    onFocus={() => setSuggestionsOpen(true)}
                    onBlur={() =>
                      setTimeout(() => setSuggestionsOpen(false), 150)
                    }
                    onKeyDown={handleInputKeyDown}
                    placeholder="Team name…"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
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
                <button
                  type="button"
                  onClick={() => handleSubmitGuess(guessInput.trim())}
                  disabled={actionLoading || !guessInput.trim()}
                  className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  Submit guess
                </button>
              </div>
            )}

            {/* Scores */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Scores (lower rank = more points)
              </h3>
              <ul className="mt-2 flex flex-wrap gap-4">
                {room.players
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((p) => (
                    <li
                      key={p.playerId}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1 ${
                        p.playerId === playerId
                          ? "bg-emerald-100 dark:bg-emerald-900/30"
                          : "bg-zinc-100 dark:bg-zinc-800"
                      }`}
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {p.name}
                        {p.playerId === room.creatorId ? " (host)" : ""}
                      </span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {p.score} pts
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">#</th>
                    <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">Team</th>
                    <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">P</th>
                    <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">GD</th>
                    <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">W-D-L</th>
                    <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {room.standings.map((row) => {
                    const revealed = room.revealedRanks.includes(row.rank);
                    return (
                      <StandingTableRow
                        key={row.rank}
                        row={row}
                        revealed={revealed}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Winner */}
            {room.phase === "finished" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-900/20">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Game over
                </h2>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                  Winner:{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    {room.players.reduce((best, p) =>
                      p.score > (best?.score ?? -1) ? p : best
                    )?.name ?? "—"}
                  </strong>{" "}
                  with the most points.
                </p>
                <Link
                  href="/standings-draft"
                  className="mt-4 inline-block rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                >
                  Leave room
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function StandingTableRow({
  row,
  revealed,
}: {
  row: StandingRow;
  revealed: boolean;
}) {
  const { rank, team, points, goalsDiff, all, form } = row;
  const gd = goalsDiff >= 0 ? `+${goalsDiff}` : String(goalsDiff);
  const wdl = `${all.win}-${all.draw}-${all.lose}`;

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800">
      <td className="p-2 font-medium text-zinc-900 dark:text-zinc-100">{rank}</td>
      <td className="p-2">
        {revealed ? (
          <span className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={team.logo}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
            {team.name}
          </span>
        ) : (
          <span className="text-zinc-400 dark:text-zinc-500">???</span>
        )}
      </td>
      <td className="p-2 text-zinc-700 dark:text-zinc-300">{points}</td>
      <td className="p-2 text-zinc-700 dark:text-zinc-300">{gd}</td>
      <td className="p-2 text-zinc-700 dark:text-zinc-300">{wdl}</td>
      <td className="p-2 font-mono text-zinc-600 dark:text-zinc-400">
        {form ?? "—"}
      </td>
    </tr>
  );
}
