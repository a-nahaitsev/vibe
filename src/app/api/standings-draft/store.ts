import type {
  StandingsDraftRoom,
  StandingsDraftPlayer,
  Season,
  StandingRow,
} from "@/app/standings-draft/_lib/types";
import { storageGet, storageSet } from "./storage";

function generateId(prefix: string): string {
  return prefix + "-" + Math.random().toString(36).slice(2, 10);
}

/** Process timeout on current turn: advance to next player, no points. Returns true if room was mutated. */
function processTimeoutIfNeeded(room: StandingsDraftRoom): boolean {
  if (room.phase !== "playing") {
    return false;
  }
  if (
    room.timerSeconds == null ||
    room.turnEndsAt == null ||
    Date.now() < room.turnEndsAt
  ) {
    return false;
  }
  const currentPlayer = room.players[room.currentPlayerIndex];
  room.lastPick = {
    playerId: currentPlayer?.playerId ?? "",
    teamName: "(time's up)",
    correct: false,
    points: 0,
    timeout: true,
  };
  room.currentPlayerIndex =
    (room.currentPlayerIndex + 1) % room.players.length;
  const now = Date.now();
  room.turnStartedAt = now;
  room.turnEndsAt = room.timerSeconds
    ? now + room.timerSeconds * 1000
    : null;
  const totalTeams = room.standings.length;
  if (room.revealedRanks.length >= totalTeams) {
    room.phase = "finished";
  }
  return true;
}

export async function createRoom(
  creatorName: string
): Promise<{ roomId: string; playerId: string }> {
  const roomId = generateId("sdraft");
  const playerId = generateId("player");
  const room: StandingsDraftRoom = {
    roomId,
    creatorId: playerId,
    players: [{ playerId, name: creatorName, score: 0 }],
    phase: "lobby",
    league: 39,
    season: 2022,
    leagueName: "",
    standings: [],
    revealedRanks: [],
    currentPlayerIndex: 0,
    lastPick: null,
    timerSeconds: null,
    turnStartedAt: null,
    turnEndsAt: null,
    createdAt: Date.now(),
  };
  await storageSet(room);
  return { roomId, playerId };
}

export async function joinRoom(
  roomId: string,
  playerName: string
): Promise<{ playerId: string } | null> {
  const room = await storageGet(roomId);
  if (!room || room.phase !== "lobby") {
    return null;
  }
  const playerId = generateId("player");
  const player: StandingsDraftPlayer = {
    playerId,
    name: playerName,
    score: 0,
  };
  room.players.push(player);
  await storageSet(room);
  return { playerId };
}

export async function getRoom(
  roomId: string
): Promise<StandingsDraftRoom | null> {
  const room = await storageGet(roomId);
  if (!room) {
    return null;
  }
  const mutated = processTimeoutIfNeeded(room);
  if (mutated) {
    await storageSet(room);
  }
  return room;
}

export async function startGame(
  roomId: string,
  requestingPlayerId: string,
  leagueId: number,
  standings: StandingRow[],
  leagueName: string,
  season: Season,
  timerSeconds: number | null
): Promise<{ ok: boolean; error?: string }> {
  const room = await storageGet(roomId);
  if (!room) {
    return { ok: false, error: "Room not found" };
  }
  if (room.phase !== "lobby") {
    return { ok: false, error: "Game already started" };
  }
  if (room.creatorId !== requestingPlayerId) {
    return { ok: false, error: "Only host can start" };
  }
  if (room.players.length < 1) {
    return { ok: false, error: "Need at least one player" };
  }
  if (!standings.length) {
    return { ok: false, error: "No standings data" };
  }

  room.phase = "playing";
  room.league = leagueId;
  room.standings = standings;
  room.leagueName = leagueName;
  room.season = season;
  room.revealedRanks = [];
  room.lastPick = null;
  room.timerSeconds = timerSeconds;
  room.players.forEach((p) => (p.score = 0));
  room.currentPlayerIndex = Math.floor(Math.random() * room.players.length);
  const now = Date.now();
  room.turnStartedAt = now;
  room.turnEndsAt =
    timerSeconds != null ? now + timerSeconds * 1000 : null;
  await storageSet(room);
  return { ok: true };
}

function normalizeTeamName(s: string): string {
  return s.trim().toLowerCase();
}

export async function pickByTeamName(
  roomId: string,
  playerId: string,
  teamName: string
): Promise<{
  ok: boolean;
  error?: string;
  correct?: boolean;
  points?: number;
}> {
  const room = await storageGet(roomId);
  if (!room) {
    return { ok: false, error: "Room not found" };
  }
  if (room.phase !== "playing") {
    return { ok: false, error: "Game not in play" };
  }

  const currentPlayer = room.players[room.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.playerId !== playerId) {
    return { ok: false, error: "Not your turn" };
  }

  const normalized = normalizeTeamName(teamName);
  if (!normalized) {
    return { ok: false, error: "Team name is required" };
  }

  const row = room.standings.find(
    (r) => normalizeTeamName(r.team.name) === normalized
  );
  const alreadyRevealed = row && room.revealedRanks.includes(row.rank);

  const advanceToNextTurn = () => {
    const now = Date.now();
    room.turnStartedAt = now;
    room.turnEndsAt =
      room.timerSeconds != null
        ? now + room.timerSeconds * 1000
        : null;
    room.currentPlayerIndex =
      (room.currentPlayerIndex + 1) % room.players.length;
  };

  if (!row) {
    room.lastPick = {
      playerId,
      teamName: teamName.trim(),
      correct: false,
      points: 0,
    };
    advanceToNextTurn();
    await storageSet(room);
    return { ok: true, correct: false, points: 0 };
  }

  if (alreadyRevealed) {
    room.lastPick = {
      playerId,
      teamName: teamName.trim(),
      correct: false,
      points: 0,
    };
    advanceToNextTurn();
    await storageSet(room);
    return { ok: true, correct: false, points: 0 };
  }

  room.revealedRanks.push(row.rank);
  currentPlayer.score += row.rank;
  room.lastPick = {
    rank: row.rank,
    playerId,
    teamName: row.team.name,
    correct: true,
    points: row.rank,
  };

  const totalTeams = room.standings.length;
  if (room.revealedRanks.length >= totalTeams) {
    room.phase = "finished";
    await storageSet(room);
    return { ok: true, correct: true, points: row.rank };
  }

  advanceToNextTurn();
  await storageSet(room);
  return { ok: true, correct: true, points: row.rank };
}
