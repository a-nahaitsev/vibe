"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  StandingsDraftRoom,
  StandingRow,
  StandingsDraftPlayer,
  LastPick,
} from "../../_lib/types";
import { LEAGUES, LEAGUE_TO_COUNTRY } from "../../_lib/leagues";
import {
  FcLike,
  FcLikePlaceholder,
  FcCheckmark,
  FcCancel,
  FcInfo,
} from "react-icons/fc";
import {
  getCachedStandings,
  setCachedStandings,
} from "../../_lib/standings-cache";
import { saveRoomSession } from "../../_lib/room-session";
import { InfoTooltip } from "../../_lib/InfoTooltip";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 2000;
const SEASONS = [2022, 2023, 2024] as const;
const MIN_SUGGESTION_CHARS = 2;
const MAX_SUGGESTIONS = 10;

/** Consecutive 404s before we show "Room not found" (avoids flicker on transient failures). */
const MAX_404_BEFORE_GIVE_UP = 3;

export default function StandingsDraftRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const playerId = searchParams.get("playerId") ?? "";

  const [room, setRoom] = useState<StandingsDraftRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reconnecting, setReconnecting] = useState(false);
  const consecutive404Ref = useRef(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [startSeason, setStartSeason] = useState<number>(2023);
  const [startLeagueId, setStartLeagueId] = useState<number>(39);
  const [guessInput, setGuessInput] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionHighlight, setSuggestionHighlight] = useState(0);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [joinName, setJoinName] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [copyLinkFeedback, setCopyLinkFeedback] = useState(false);
  const [startTimerSeconds, setStartTimerSeconds] = useState<number | null>(
    null
  );
  const [startMissLimit, setStartMissLimit] = useState<3 | 5 | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [guessedPlace, setGuessedPlace] = useState<number | "">("");
  const [useJokerForThisTurn, setUseJokerForThisTurn] = useState(false);
  const [useBadgeHintForThisTurn, setUseBadgeHintForThisTurn] = useState(false);
  const [badgeHintImageUrl, setBadgeHintImageUrl] = useState<string | null>(
    null
  );
  const [badgeHintLoading, setBadgeHintLoading] = useState(false);
  const guessInputRef = useRef<HTMLInputElement>(null);

  // Revoke blob URL when cleared or replaced to avoid leaks
  useEffect(() => {
    return () => {
      if (badgeHintImageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(badgeHintImageUrl);
      }
    };
  }, [badgeHintImageUrl]);

  // Clear badge hint image when turn advances (no longer our turn)
  const isMyTurnRef = useRef(false);
  useEffect(() => {
    const myTurn =
      room?.players[room?.currentPlayerIndex ?? 0]?.playerId === playerId;
    if (isMyTurnRef.current && !myTurn && badgeHintImageUrl) {
      if (badgeHintImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(badgeHintImageUrl);
      }
      setBadgeHintImageUrl(null);
    }
    isMyTurnRef.current = !!myTurn;
  }, [room?.currentPlayerIndex, room?.players, playerId, badgeHintImageUrl]);

  const fetchRoom = useCallback(async () => {
    if (!roomId) return;
    const url = `/api/standings-draft/room/${roomId}`;
    try {
      const res = await fetch(url);
      if (res.status === 404) {
        consecutive404Ref.current += 1;
        const count = consecutive404Ref.current;
        if (count >= MAX_404_BEFORE_GIVE_UP) {
          setError("Room not found");
          setRoom(null);
          setReconnecting(false);
        } else {
          setRoom((prev) => {
            if (prev) {
              setReconnecting(true);
            }
            return prev;
          });
        }
        setLoading(false);
        return;
      }
      const data = await res.json();
      consecutive404Ref.current = 0;
      setRoom(data);
      setError("");
      setReconnecting(false);
    } catch (err) {
      setRoom((prev) => {
        if (prev) {
          setReconnecting(true);
        }
        return prev;
      });
      if (!room) {
        setError("Failed to load room");
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- room omitted: we use setRoom(prev=>...) and must not recreate interval on every room update
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
    const t = setInterval(fetchRoom, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fetchRoom]);

  useEffect(() => {
    if (room?.phase !== "playing" || typeof room?.turnEndsAt !== "number") {
      return;
    }
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [room?.phase, room?.turnEndsAt]);

  const isCreator = room?.creatorId === playerId;
  const me = room?.players.find((p) => p.playerId === playerId);
  const currentPlayer = room?.players[room?.currentPlayerIndex ?? 0];
  const isMyTurn = currentPlayer?.playerId === playerId;
  const isPlayerOut = (p: StandingsDraftPlayer) =>
    room != null && room.missLimit != null && (p.misses ?? 0) >= room.missLimit;
  const iAmOut = me != null && isPlayerOut(me);
  const country = room?.league != null ? LEAGUE_TO_COUNTRY[room.league] : null;
  const needsToJoin = room && !me;

  /** Places not yet revealed (available to guess). */
  const availablePlaces = useMemo(() => {
    if (!room?.standings.length) return [];
    const n = room.standings.length;
    return Array.from({ length: n }, (_, i) => i + 1).filter(
      (r) => !room.revealedRanks.includes(r)
    );
  }, [room?.standings.length, room?.revealedRanks]);

  useEffect(() => {
    if (availablePlaces.length === 0) return;
    setGuessedPlace((prev) => {
      const p = prev === "" ? null : prev;
      if (p === null || !availablePlaces.includes(p))
        return availablePlaces[0] ?? "";
      return prev;
    });
  }, [availablePlaces]);

  const joinLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/standings-draft/room/${roomId}`
      : "";

  const handleJoinInRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = joinName.trim();
    if (!name || !roomId) {
      return;
    }
    setJoinLoading(true);
    try {
      const res = await fetch("/api/standings-draft/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerName: name }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to join");
      }
      const pid = data.playerId;
      if (!pid) {
        throw new Error("Invalid response");
      }
      saveRoomSession(roomId, pid, name);
      router.push(
        `/standings-draft/room/${roomId}?playerId=${encodeURIComponent(pid)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!joinLink) {
      return;
    }
    navigator.clipboard.writeText(joinLink).then(
      () => {
        setCopyLinkFeedback(true);
        setTimeout(() => setCopyLinkFeedback(false), 2000);
      },
      () => {}
    );
  };

  useEffect(() => {
    if (!country || room?.phase !== "playing") {
      return;
    }
    let cancelled = false;
    fetch(`/api/standings-draft/teams?country=${country}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.names)) {
          setTeamNames(data.names);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [country, room?.phase]);

  const suggestions = useMemo(() => {
    if (guessInput.trim().length < MIN_SUGGESTION_CHARS) {
      return [];
    }
    const q = guessInput.trim().toLowerCase();
    return teamNames
      .filter((name) => name.toLowerCase().includes(q))
      .slice(0, MAX_SUGGESTIONS);
  }, [teamNames, guessInput]);

  const showSuggestions = isMyTurn && suggestionsOpen && suggestions.length > 0;
  const remainingSeconds =
    room?.phase === "playing" &&
    typeof room.turnEndsAt === "number" &&
    typeof room.timerSeconds === "number"
      ? Math.min(
          room.timerSeconds,
          Math.max(0, Math.ceil((room.turnEndsAt - now) / 1000))
        )
      : null;
  const highlightedIndex = Math.min(
    suggestionHighlight,
    Math.max(0, suggestions.length - 1)
  );

  useEffect(() => {
    if (room?.phase === "playing" && isMyTurn) {
      const id = requestAnimationFrame(() => {
        guessInputRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [room?.phase, isMyTurn]);

  const handleStart = async () => {
    if (!roomId || !playerId) {
      return;
    }
    setActionLoading(true);
    try {
      const cached = getCachedStandings(startLeagueId, startSeason);
      const body: {
        playerId: string;
        season: number;
        league: number;
        standings?: StandingRow[];
        leagueName?: string;
        timerSeconds?: number | null;
        missLimit?: 3 | 5 | "unlimited";
      } = {
        playerId,
        season: startSeason,
        league: startLeagueId,
        timerSeconds: startTimerSeconds,
        missLimit: startMissLimit === null ? "unlimited" : startMissLimit,
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
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start");
      }
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
  };

  const handleSubmitGuess = async (teamName: string) => {
    const trimmed = teamName.trim();
    const place =
      typeof guessedPlace === "number" && availablePlaces.includes(guessedPlace)
        ? guessedPlace
        : availablePlaces[0];
    if (!roomId || !playerId || !trimmed || place == null) {
      return;
    }
    setActionLoading(true);
    setGuessInput("");
    setSuggestionsOpen(false);
    try {
      const res = await fetch(`/api/standings-draft/room/${roomId}/pick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          teamName: trimmed,
          guessedPlace: place,
          useJoker: useJokerForThisTurn,
          useBadgeHint: useBadgeHintForThisTurn,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to pick");
      }
      setUseJokerForThisTurn(false);
      setUseBadgeHintForThisTurn(false);
      if (badgeHintImageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(badgeHintImageUrl);
      }
      setBadgeHintImageUrl(null);
      await fetchRoom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pick");
    } finally {
      setActionLoading(false);
    }
  };

  const pickSuggestion = (name: string) => {
    setGuessInput(name);
    setSuggestionsOpen(false);
    setSuggestionHighlight(0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestionHighlight((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestionHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const toSubmit = suggestions[highlightedIndex] ?? guessInput.trim();
      if (toSubmit) {
        handleSubmitGuess(toSubmit);
      }
    } else if (e.key === "Escape") {
      setSuggestionsOpen(false);
    }
  };

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
        <Link
          href="/standings-draft"
          className="text-sm text-zinc-500 hover:underline"
        >
          ← Back
        </Link>
        <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  if (needsToJoin) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
        <div className="mx-auto max-w-md space-y-6">
          <Link
            href="/standings-draft"
            className="text-sm text-zinc-500 hover:underline"
          >
            ← Back to Standings Draft
          </Link>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Join this room
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              You were invited to room{" "}
              <code className="font-mono">{roomId}</code>. Enter your name to
              join.
            </p>
            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </p>
            )}
            <form onSubmit={handleJoinInRoom} className="mt-4 space-y-3">
              <label htmlFor="join-room-name" className="sr-only">
                Your name
              </label>
              <input
                id="join-room-name"
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-400"
                disabled={joinLoading}
                autoFocus
              />
              <button
                type="submit"
                disabled={joinLoading || !joinName.trim()}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                {joinLoading ? "Joining…" : "Join room"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6 xl:max-w-7xl xl:grid xl:grid-cols-[1fr_1.1fr] xl:gap-8 xl:space-y-0">
        <div className="flex flex-wrap items-center justify-between gap-2 xl:col-span-2">
          <Link
            href="/standings-draft"
            className="text-sm text-zinc-500 hover:underline"
          >
            Leave room
          </Link>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Room: <code className="font-mono">{roomId}</code>
          </span>
        </div>

        {reconnecting && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200 xl:col-span-2">
            Reconnecting… You can keep playing; we&apos;ll sync when the
            connection is back.
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300 xl:col-span-2">
            {error}
          </p>
        )}

        {/* Lobby */}
        {room.phase === "lobby" && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 xl:col-span-2">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Waiting for players
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Share this link with friends so they can join the room. They’ll
              open the link, enter their name, and see the game.
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Room code: <code className="font-mono">{roomId}</code>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                {copyLinkFeedback ? "Copied!" : "Copy link"}
              </button>
              <a
                href={joinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Open link in new tab
              </a>
            </div>
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
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-400"
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
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-400"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Timer per turn
                </label>
                <select
                  value={startTimerSeconds === 60 ? "60" : ""}
                  onChange={(e) =>
                    setStartTimerSeconds(e.target.value === "60" ? 60 : null)
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-400"
                >
                  <option value="">No timer</option>
                  <option value="60">1 min per answer</option>
                </select>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Miss limit
                </label>
                <select
                  value={startMissLimit === null ? "unlimited" : startMissLimit}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStartMissLimit(
                      v === "unlimited" ? null : (Number(v) as 3 | 5)
                    );
                  }}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-400"
                >
                  <option value="3">3 misses</option>
                  <option value="5">5 misses</option>
                  <option value="unlimited">Unlimited</option>
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

        {/* Playing / Finished: two columns on xl — left: controls, right: table */}
        {(room.phase === "playing" || room.phase === "finished") &&
          room.standings.length > 0 && (
            <>
              <div className="flex flex-col gap-6 xl:min-w-0">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {room.leagueName} {room.season}/{room.season + 1}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {room.revealedRanks.length} / {room.standings.length} teams
                    revealed
                  </p>
                  {room.phase === "playing" && (
                    <>
                      <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {iAmOut
                          ? "You're out (miss limit reached)."
                          : isMyTurn
                          ? "Your turn — type a team name to guess."
                          : `Waiting for ${
                              currentPlayer?.name ?? "…"
                            } to guess.`}
                      </p>
                      {remainingSeconds != null && (
                        <p
                          className={
                            "mt-2 text-lg font-mono font-semibold " +
                            (remainingSeconds === 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-zinc-700 dark:text-zinc-300")
                          }
                        >
                          {remainingSeconds === 0
                            ? "Time's up!"
                            : `${Math.floor(remainingSeconds / 60)}:${String(
                                remainingSeconds % 60
                              ).padStart(2, "0")}`}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Pick history accordion */}
                {room.lastPick &&
                  (room.phase === "playing" || room.phase === "finished") && (
                    <PickHistoryAccordion
                      lastPick={room.lastPick}
                      pickHistory={room.pickHistory ?? []}
                      players={room.players}
                    />
                  )}

                {/* Bonuses / Multipliers panel */}
                {(room.phase === "playing" || room.phase === "finished") && (
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                    <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Bonuses
                    </h3>
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            Double Joker
                          </span>
                          <InfoTooltip
                            trigger={<FcInfo className="h-4 w-4" />}
                            content="Once per game. Right: 2× points. Wrong: −10 pts."
                            ariaLabel="Double Joker description"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {me?.usedJoker ? (
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                              Used
                            </span>
                          ) : isMyTurn ? (
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                              <input
                                type="checkbox"
                                checked={useJokerForThisTurn}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setUseJokerForThisTurn(checked);
                                  if (checked) {
                                    setUseBadgeHintForThisTurn(false);
                                    if (
                                      badgeHintImageUrl?.startsWith("blob:")
                                    ) {
                                      URL.revokeObjectURL(badgeHintImageUrl);
                                    }
                                    setBadgeHintImageUrl(null);
                                  }
                                }}
                                disabled={useBadgeHintForThisTurn}
                                className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800"
                              />
                              Use this turn
                            </label>
                          ) : (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            Badge Hint
                          </span>
                          <InfoTooltip
                            trigger={<FcInfo className="h-4 w-4" />}
                            content={
                              <>
                                Once per game. See a blurred random club logo
                                for one position. Can&apos;t use with Double
                                Joker same turn.
                              </>
                            }
                            ariaLabel="Badge Hint description"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {me?.usedBadgeHint ? (
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                              Used
                            </span>
                          ) : isMyTurn ? (
                            <>
                              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                <input
                                  type="checkbox"
                                  checked={useBadgeHintForThisTurn}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setUseBadgeHintForThisTurn(checked);
                                    if (checked) {
                                      setUseJokerForThisTurn(false);
                                      if (
                                        badgeHintImageUrl?.startsWith("blob:")
                                      ) {
                                        URL.revokeObjectURL(badgeHintImageUrl);
                                      }
                                      setBadgeHintImageUrl(null);
                                    }
                                  }}
                                  disabled={useJokerForThisTurn}
                                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800"
                                />
                                Use this turn
                              </label>
                              {useBadgeHintForThisTurn &&
                                availablePlaces.length > 0 && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={
                                        badgeHintImageUrl !== null ||
                                        badgeHintLoading
                                      }
                                      onClick={async () => {
                                        if (!roomId || !playerId) return;
                                        setBadgeHintLoading(true);
                                        try {
                                          const res = await fetch(
                                            `/api/standings-draft/room/${roomId}/badge-hint?playerId=${encodeURIComponent(
                                              playerId
                                            )}`
                                          );
                                          if (!res.ok) return;
                                          const blob = await res.blob();
                                          if (
                                            badgeHintImageUrl?.startsWith(
                                              "blob:"
                                            )
                                          ) {
                                            URL.revokeObjectURL(
                                              badgeHintImageUrl
                                            );
                                          }
                                          setBadgeHintImageUrl(
                                            URL.createObjectURL(blob)
                                          );
                                        } finally {
                                          setBadgeHintLoading(false);
                                        }
                                      }}
                                      className="rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-500 dark:hover:bg-amber-600"
                                    >
                                      {badgeHintLoading
                                        ? "Loading…"
                                        : "Show badge"}
                                    </button>
                                    {badgeHintImageUrl && (
                                      <img
                                        src={badgeHintImageUrl}
                                        alt="Blurred club badge hint"
                                        width={100}
                                        height={100}
                                        className="h-[100px] w-[100px] select-none object-contain"
                                        draggable={false}
                                      />
                                    )}
                                  </>
                                )}
                            </>
                          ) : (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">
                              Correct streak
                            </span>
                            <InfoTooltip
                              trigger={<FcInfo className="h-4 w-4" />}
                              content="3 in a row: +5 pts · 5 in a row: +10 pts · 7 in a row: +15 pts"
                              ariaLabel="Correct streak description"
                            />
                          </div>
                          <div className="flex flex-col items-end gap-1.5 text-sm">
                            {me != null && (
                              <span className="text-zinc-600 dark:text-zinc-400">
                                Current:{" "}
                                <strong className="text-zinc-800 dark:text-zinc-200">
                                  {me.correctStreak ?? 0}
                                </strong>{" "}
                                in a row
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Guess input (current player only) — pulse when your turn; hidden when out */}
                {room.phase === "playing" && isMyTurn && !iAmOut && (
                  <div
                    className={
                      "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow dark:border-zinc-700 dark:bg-zinc-900 " +
                      "animate-your-turn-pulse"
                    }
                  >
                    <div className="flex items-center gap-1.5">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Guess a team and its position in table
                      </label>
                      <InfoTooltip
                        trigger={<FcInfo className="h-4 w-4" />}
                        content="Points = rank − |rank − your guess| (min 1 for correct team). E.g. team 10th: guess 10th → 10 pts, 12th → 8 pts, 20th → 1 pt. Wrong team = 0."
                        ariaLabel="Scoring example"
                      />
                    </div>
                    <div className="mt-3 flex flex-row flex-wrap items-end gap-3">
                      <div className="w-fit shrink-0">
                        <label
                          htmlFor="guess-place"
                          className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                        >
                          Position (place)
                        </label>
                        <select
                          id="guess-place"
                          value={guessedPlace === "" ? "" : guessedPlace}
                          onChange={(e) => {
                            const v = e.target.value;
                            setGuessedPlace(v === "" ? "" : Number(v));
                          }}
                          className="w-fit min-w-[6rem] rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                          disabled={
                            actionLoading || availablePlaces.length === 0
                          }
                        >
                          {availablePlaces.length === 0 ? (
                            <option value="">No places left</option>
                          ) : (
                            availablePlaces.map((r) => (
                              <option key={r} value={r}>
                                {r}
                                {r === 1
                                  ? "st"
                                  : r === 2
                                  ? "nd"
                                  : r === 3
                                  ? "rd"
                                  : "th"}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor="guess-team"
                          className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                        >
                          Team name
                        </label>
                        <div className="relative">
                          <input
                            id="guess-team"
                            ref={guessInputRef}
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
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSubmitGuess(guessInput.trim())}
                      disabled={
                        actionLoading ||
                        !guessInput.trim() ||
                        availablePlaces.length === 0 ||
                        (guessedPlace !== "" &&
                          !availablePlaces.includes(guessedPlace))
                      }
                      className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    >
                      Submit guess
                    </button>
                  </div>
                )}

                {/* Scores — column layout, more points = higher position */}
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <h3 className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Scores
                    <InfoTooltip
                      trigger={<FcInfo className="h-4 w-4" />}
                      content={
                        <>
                          Closer position guess = more points
                          {room.missLimit != null && (
                            <> · {room.missLimit} misses = out</>
                          )}
                        </>
                      }
                      ariaLabel="Scoring and miss limit"
                    />
                  </h3>
                  <ul className="mt-2 flex flex-col gap-2">
                    {room.players
                      .slice()
                      .sort((a, b) => b.score - a.score)
                      .map((p) => {
                        const misses = p.misses ?? 0;
                        const out = isPlayerOut(p);
                        return (
                          <li
                            key={p.playerId}
                            className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 ${
                              p.playerId === playerId
                                ? "bg-emerald-100 dark:bg-emerald-900/30"
                                : "bg-zinc-100 dark:bg-zinc-800"
                            } ${out ? "opacity-75" : ""}`}
                          >
                            <span className="flex flex-wrap items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                              {p.name}
                              {p.playerId === room.creatorId ? " (host)" : ""}
                              {room.missLimit != null && (
                                <span
                                  className="flex items-center gap-0.5"
                                  title={`${misses} miss${
                                    misses === 1 ? "" : "es"
                                  }, ${room.missLimit - misses} left`}
                                >
                                  {Array.from(
                                    { length: room.missLimit },
                                    (_, i) =>
                                      i < room.missLimit! - misses ? (
                                        <FcLike
                                          key={i}
                                          className="h-4 w-4"
                                          aria-hidden
                                        />
                                      ) : (
                                        <FcLikePlaceholder
                                          key={i}
                                          className="h-4 w-4"
                                          aria-hidden
                                        />
                                      )
                                  )}
                                </span>
                              )}
                              {room.missLimit != null && (
                                <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                                  {out && " (out)"}
                                </span>
                              )}
                            </span>
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              {p.score} pts
                            </span>
                          </li>
                        );
                      })}
                  </ul>
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
                    {room.revealedRanks.length < room.standings.length && (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Not all teams were guessed. Unguessed positions are
                        highlighted in the table.
                      </p>
                    )}
                    <Link
                      href="/standings-draft"
                      className="mt-4 inline-block rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                    >
                      Leave room
                    </Link>
                  </div>
                )}
              </div>

              {/* Table — right column on xl */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 xl:min-w-0">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                      <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">
                        #
                      </th>
                      <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">
                        Team
                      </th>
                      <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">
                        P
                      </th>
                      <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">
                        GD
                      </th>
                      <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">
                        W-D-L
                      </th>
                      <th className="p-2 font-medium text-zinc-700 dark:text-zinc-300">
                        Form
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {room.standings.map((row) => {
                      const revealed = room.revealedRanks.includes(row.rank);
                      const highlightUnrevealed =
                        room.phase === "finished" &&
                        room.revealedRanks.length < room.standings.length;
                      return (
                        <StandingTableRow
                          key={row.rank}
                          row={row}
                          revealed={revealed}
                          highlightUnrevealed={highlightUnrevealed}
                          showTeamAlways={room.phase === "finished"}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
      </div>
    </main>
  );
}

/** Renders one pick line: icon + text with team name highlighted. */
function PickLineContent({
  pick,
  players,
  asParagraph = false,
}: {
  pick: LastPick;
  players: StandingsDraftPlayer[];
  asParagraph?: boolean;
}) {
  const playerName =
    players.find((p) => p.playerId === pick.playerId)?.name ?? "Someone";
  const ord = (n: number) =>
    n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  const content = pick.timeout ? (
    <>{playerName} ran out of time — 0 pts</>
  ) : (
    <>
      {playerName} guessed
      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
        {`"${pick.teamName}"`}
      </span>
      {pick.guessedRank != null && (
        <>
          {" "}
          at {pick.guessedRank}
          {ord(pick.guessedRank)}
        </>
      )}
      {pick.jokerUsed && " (Double Joker)"}
      {pick.badgeHintUsed &&
        (pick.correct
          ? " (Badge Hint — hint helped)"
          : " (Badge Hint — hint didn't help)")}
      {" — "}
      {pick.correct ? (
        <>
          {pick.rank != null &&
            pick.guessedRank != null &&
            pick.rank !== pick.guessedRank &&
            `was ${pick.rank}${ord(pick.rank)} → `}
          {pick.points >= 0 ? "+" : ""}
          {pick.points} pts
          {pick.streakBonus != null && pick.streakBonus > 0 && (
            <> (Correct streak +{pick.streakBonus} pts)</>
          )}
        </>
      ) : (
        <>wrong, {pick.points} pts</>
      )}
    </>
  );
  const Wrapper = asParagraph ? "p" : "span";
  return (
    <Wrapper className="inline-flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
      {pick.correct ? (
        <FcCheckmark className="h-5 w-5 shrink-0" aria-hidden />
      ) : (
        <FcCancel className="h-5 w-5 shrink-0" aria-hidden />
      )}
      {content}
    </Wrapper>
  );
}

const PickHistoryAccordion = ({
  lastPick,
  pickHistory,
  players,
}: {
  lastPick: LastPick;
  pickHistory: LastPick[];
  players: StandingsDraftPlayer[];
}) => {
  const [open, setOpen] = useState(false);
  const previousPicks =
    pickHistory.length > 0 ? pickHistory.slice(0, -1).reverse() : [];
  const hasPrevious = previousPicks.length > 0;

  return (
    <div
      className={
        "rounded-xl border px-4 py-2 " +
        (lastPick.correct
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
          : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20")
      }
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 py-2 text-left"
        aria-expanded={open}
      >
        <PickLineContent pick={lastPick} players={players} />
        {hasPrevious && (
          <span
            className={
              "ml-auto shrink-0 text-zinc-500 transition-transform " +
              (open ? "rotate-180" : "")
            }
            aria-hidden
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        )}
      </button>
      {open && hasPrevious && (
        <ul className="border-t border-zinc-200/50 py-2 dark:border-zinc-700/50">
          {previousPicks.map((pick, i) => (
            <li
              key={i}
              className="flex items-center gap-2 border-b border-zinc-200/50 py-2 last:border-b-0 dark:border-zinc-700/50"
            >
              <PickLineContent pick={pick} players={players} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const StandingTableRow = ({
  row,
  revealed,
  highlightUnrevealed = false,
  showTeamAlways = false,
}: {
  row: StandingRow;
  revealed: boolean;
  highlightUnrevealed?: boolean;
  /** When true (game finished), show team name/logo for every row; only unguessed rows get highlighted. */
  showTeamAlways?: boolean;
}) => {
  const { rank, team, points, goalsDiff, all, form } = row;
  const gd = goalsDiff >= 0 ? `+${goalsDiff}` : String(goalsDiff);
  const wdl = `${all.win}-${all.draw}-${all.lose}`;
  const unguessed = !revealed;
  const highlight = unguessed && highlightUnrevealed;
  const showTeam = revealed || showTeamAlways;

  return (
    <tr
      className={
        "border-b border-zinc-100 dark:border-zinc-800 " +
        (highlight ? "bg-amber-100 dark:bg-amber-900/30" : "")
      }
    >
      <td className="p-2 font-medium text-zinc-900 dark:text-zinc-100">
        {rank}
      </td>
      <td className="p-2">
        {showTeam ? (
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
};
