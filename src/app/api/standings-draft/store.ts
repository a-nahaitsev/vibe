import type {
  StandingsDraftRoom,
  StandingsDraftPlayer,
  Season,
  StandingRow,
} from "@/app/standings-draft/_lib/types";

// Use globalThis so the Map survives Next.js dev hot reload and re-initialization
const globalForStore = globalThis as unknown as {
  standingsDraftRooms?: Map<string, StandingsDraftRoom>;
};
const rooms =
  globalForStore.standingsDraftRooms ?? new Map<string, StandingsDraftRoom>();
if (!globalForStore.standingsDraftRooms) globalForStore.standingsDraftRooms = rooms;

function generateId(prefix: string): string {
  return prefix + "-" + Math.random().toString(36).slice(2, 10);
}

export function createRoom(creatorName: string): { roomId: string; playerId: string } {
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
  rooms.set(roomId, room);
  return { roomId, playerId };
}

export function joinRoom(roomId: string, playerName: string): { playerId: string } | null {
  const room = rooms.get(roomId);
  if (!room || room.phase !== "lobby") return null;
  const playerId = generateId("player");
  const player: StandingsDraftPlayer = {
    playerId,
    name: playerName,
    score: 0,
  };
  room.players.push(player);
  return { playerId };
}

/** Process timeout on current turn: advance to next player, no points. Called from getRoom. */
function processTimeoutIfNeeded(room: StandingsDraftRoom): void {
  if (room.phase !== "playing") {
    return;
  }
  if (
    room.timerSeconds == null ||
    room.turnEndsAt == null ||
    Date.now() < room.turnEndsAt
  ) {
    return;
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
}

export function getRoom(roomId: string): StandingsDraftRoom | null {
  const room = rooms.get(roomId) ?? null;
  if (room) {
    processTimeoutIfNeeded(room);
  }
  return room;
}

export function startGame(
  roomId: string,
  requestingPlayerId: string,
  leagueId: number,
  standings: StandingRow[],
  leagueName: string,
  season: Season,
  timerSeconds: number | null
): { ok: boolean; error?: string } {
  const room = rooms.get(roomId);
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
  return { ok: true };
}

function normalizeTeamName(s: string): string {
  return s.trim().toLowerCase();
}

export function pickByTeamName(
  roomId: string,
  playerId: string,
  teamName: string
): { ok: boolean; error?: string; correct?: boolean; points?: number } {
  const room = rooms.get(roomId);
  if (!room) return { ok: false, error: "Room not found" };
  if (room.phase !== "playing") return { ok: false, error: "Game not in play" };

  const currentPlayer = room.players[room.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.playerId !== playerId) {
    return { ok: false, error: "Not your turn" };
  }

  const normalized = normalizeTeamName(teamName);
  if (!normalized) return { ok: false, error: "Team name is required" };

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
    return { ok: true, correct: true, points: row.rank };
  }

  advanceToNextTurn();
  return { ok: true, correct: true, points: row.rank };
}
