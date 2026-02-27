import type {
  StandingsDraftRoom,
  StandingsDraftPlayer,
  Season,
  StandingRow,
  MissLimit,
} from "@/app/standings-draft/_lib/types";
import { storageGet, storageSet } from "./storage";

function generateId(prefix: string): string {
  return prefix + "-" + Math.random().toString(36).slice(2, 10);
}

function isPlayerOut(room: StandingsDraftRoom, playerIndex: number): boolean {
  const limit = room.missLimit;
  if (limit == null) return false;
  const p = room.players[playerIndex];
  return (p?.misses ?? 0) >= limit;
}

/** Advance to next player, skipping those who are out (miss limit reached). If all are out, set phase to finished. */
function advanceToNextTurn(room: StandingsDraftRoom): void {
  delete room.badgeHintThisTurn;
  const now = Date.now();
  room.turnStartedAt = now;
  room.turnEndsAt =
    room.timerSeconds != null ? now + room.timerSeconds * 1000 : null;
  const n = room.players.length;
  let next = (room.currentPlayerIndex + 1) % n;
  const start = next;
  for (;;) {
    if (!isPlayerOut(room, next)) break;
    next = (next + 1) % n;
    if (next === start) {
      room.phase = "finished";
      return;
    }
  }
  room.currentPlayerIndex = next;
}

/** Process timeout on current turn: count as miss, advance to next player. Returns true if room was mutated. */
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
  currentPlayer.misses = (currentPlayer.misses ?? 0) + 1;
  room.lastPick = {
    playerId: currentPlayer?.playerId ?? "",
    teamName: "(time's up)",
    correct: false,
    points: 0,
    timeout: true,
  };
  (room.pickHistory ??= []).push({ ...room.lastPick });
  const totalTeams = room.standings.length;
  if (room.revealedRanks.length >= totalTeams) {
    room.phase = "finished";
    return true;
  }
  advanceToNextTurn(room);
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
  timerSeconds: number | null,
  missLimit?: MissLimit
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
  room.missLimit = missLimit ?? null;
  room.league = leagueId;
  room.standings = standings;
  room.leagueName = leagueName;
  room.season = season;
  room.revealedRanks = [];
  room.lastPick = null;
  room.pickHistory = [];
  room.timerSeconds = timerSeconds;
  room.players.forEach((p) => {
    p.score = 0;
    p.misses = 0;
    p.usedJoker = false;
    p.usedBadgeHint = false;
    p.correctStreak = 0;
    p.streakMilestones = [];
  });
  room.currentPlayerIndex = Math.floor(Math.random() * room.players.length);
  const now = Date.now();
  room.turnStartedAt = now;
  room.turnEndsAt = timerSeconds != null ? now + timerSeconds * 1000 : null;
  await storageSet(room);
  return { ok: true };
}

function normalizeTeamName(s: string): string {
  return s.trim().toLowerCase();
}

/** Points for correct team: totalTeams - |actualRank - guessedRank|. Wrong team = 0. */
function marginPoints(
  totalTeams: number,
  actualRank: number,
  guessedRank: number
): number {
  return totalTeams - Math.abs(actualRank - guessedRank);
}

const JOKER_WRONG_PENALTY = 10;

const STREAK_BONUSES: [number, number][] = [
  [3, 5],
  [5, 10],
  [7, 15],
];

export async function pickByTeamName(
  roomId: string,
  playerId: string,
  teamName: string,
  guessedPlace: number,
  useJoker?: boolean,
  useBadgeHint?: boolean
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
  if (room.missLimit != null && (currentPlayer.misses ?? 0) >= room.missLimit) {
    return { ok: false, error: "You're out (miss limit reached)" };
  }

  if (useJoker && useBadgeHint) {
    return {
      ok: false,
      error: "Cannot use Joker and Badge Hint on the same turn",
    };
  }
  if (useJoker && currentPlayer.usedJoker) {
    return { ok: false, error: "Joker already used this game" };
  }
  if (useBadgeHint && currentPlayer.usedBadgeHint) {
    return { ok: false, error: "Badge Hint already used this game" };
  }

  const normalized = normalizeTeamName(teamName);
  if (!normalized) {
    return { ok: false, error: "Team name is required" };
  }

  const totalTeams = room.standings.length;
  if (
    typeof guessedPlace !== "number" ||
    guessedPlace < 1 ||
    guessedPlace > totalTeams
  ) {
    return { ok: false, error: "Pick a place from 1 to " + totalTeams };
  }
  if (room.revealedRanks.includes(guessedPlace)) {
    return { ok: false, error: "That place was already guessed" };
  }

  const row = room.standings.find(
    (r) => normalizeTeamName(r.team.name) === normalized
  );
  const alreadyRevealed = row && room.revealedRanks.includes(row.rank);

  const applyJoker = useJoker === true;
  const applyBadgeHint = useBadgeHint === true;
  if (applyJoker) {
    currentPlayer.usedJoker = true;
  }
  if (applyBadgeHint) {
    currentPlayer.usedBadgeHint = true;
  }

  if (!row) {
    currentPlayer.correctStreak = 0;
    currentPlayer.misses = (currentPlayer.misses ?? 0) + 1;
    const points = applyJoker ? -JOKER_WRONG_PENALTY : 0;
    currentPlayer.score += points;
    room.lastPick = {
      guessedRank: guessedPlace,
      playerId,
      teamName: teamName.trim(),
      correct: false,
      points,
      jokerUsed: applyJoker,
      badgeHintUsed: applyBadgeHint,
    };
    (room.pickHistory ??= []).push({ ...room.lastPick });
    const totalTeams = room.standings.length;
    if (room.revealedRanks.length >= totalTeams) {
      room.phase = "finished";
      await storageSet(room);
      return { ok: true, correct: false, points };
    }
    advanceToNextTurn(room);
    await storageSet(room);
    return { ok: true, correct: false, points };
  }

  if (alreadyRevealed) {
    currentPlayer.correctStreak = 0;
    currentPlayer.misses = (currentPlayer.misses ?? 0) + 1;
    const points = applyJoker ? -JOKER_WRONG_PENALTY : 0;
    currentPlayer.score += points;
    room.lastPick = {
      guessedRank: guessedPlace,
      playerId,
      teamName: teamName.trim(),
      correct: false,
      points,
      jokerUsed: applyJoker,
      badgeHintUsed: applyBadgeHint,
    };
    (room.pickHistory ??= []).push({ ...room.lastPick });
    const totalTeams = room.standings.length;
    if (room.revealedRanks.length >= totalTeams) {
      room.phase = "finished";
      await storageSet(room);
      return { ok: true, correct: false, points };
    }
    advanceToNextTurn(room);
    await storageSet(room);
    return { ok: true, correct: false, points };
  }

  let points = marginPoints(totalTeams, row.rank, guessedPlace);
  if (applyJoker) {
    points = points * 2;
  }
  const streak = (currentPlayer.correctStreak ?? 0) + 1;
  currentPlayer.correctStreak = streak;
  const milestones = currentPlayer.streakMilestones ?? [];
  let streakBonusThisPick = 0;
  for (const [milestone, bonus] of STREAK_BONUSES) {
    if (streak >= milestone && !milestones.includes(milestone)) {
      points += bonus;
      streakBonusThisPick += bonus;
      milestones.push(milestone);
    }
  }
  currentPlayer.streakMilestones = milestones;
  /* Badge Hint does not multiply points — only Joker does */
  room.revealedRanks.push(row.rank);
  currentPlayer.score += points;
  room.lastPick = {
    rank: row.rank,
    guessedRank: guessedPlace,
    playerId,
    teamName: row.team.name,
    correct: true,
    points,
    jokerUsed: applyJoker,
    badgeHintUsed: applyBadgeHint,
    ...(streakBonusThisPick > 0 && { streakBonus: streakBonusThisPick }),
  };
  (room.pickHistory ??= []).push({ ...room.lastPick });

  if (room.revealedRanks.length >= totalTeams) {
    room.phase = "finished";
    await storageSet(room);
    return { ok: true, correct: true, points };
  }

  advanceToNextTurn(room);
  await storageSet(room);
  return { ok: true, correct: true, points };
}

/** Get or set the badge-hint logo URL for the current turn. Only the current player can request; server picks a random unrevealed team and returns its logo URL (for server-side blur). */
export async function getOrSetBadgeHintLogo(
  roomId: string,
  playerId: string
): Promise<{ ok: boolean; logoUrl?: string; error?: string }> {
  const room = await storageGet(roomId);
  if (!room) {
    return { ok: false, error: "Room not found" };
  }
  const mutated = processTimeoutIfNeeded(room);
  if (mutated) {
    await storageSet(room);
  }
  if (room.phase !== "playing") {
    return { ok: false, error: "Game not in play" };
  }
  const currentPlayer = room.players[room.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.playerId !== playerId) {
    return { ok: false, error: "Not your turn" };
  }
  if (currentPlayer.usedBadgeHint) {
    return { ok: false, error: "Badge Hint already used this game" };
  }
  const unrevealed = room.standings.filter(
    (s) => !room.revealedRanks.includes(s.rank)
  );
  if (unrevealed.length === 0) {
    return { ok: false, error: "No unrevealed teams" };
  }
  if (room.badgeHintThisTurn && room.badgeHintThisTurn.playerId === playerId) {
    return { ok: true, logoUrl: room.badgeHintThisTurn.logoUrl };
  }
  const randomRow = unrevealed[Math.floor(Math.random() * unrevealed.length)];
  const logoUrl = randomRow?.team.logo ?? "";
  if (!logoUrl) {
    return { ok: false, error: "No logo URL" };
  }
  room.badgeHintThisTurn = { playerId, logoUrl };
  await storageSet(room);
  return { ok: true, logoUrl };
}
