import type { WhoAmIRoom } from "@/app/whoami/_lib/types";
import { pickRandomPuzzle } from "@/app/whoami/_lib/questions";

const rooms = new Map<string, WhoAmIRoom>();

function generateId(prefix: string): string {
  return prefix + "-" + Math.random().toString(36).slice(2, 10);
}

export function createRoom(creatorName: string): { roomId: string; playerId: string } {
  const roomId = generateId("room");
  const playerId = generateId("player");
  const room: WhoAmIRoom = {
    roomId,
    creatorId: playerId,
    players: [
      {
        playerId,
        name: creatorName,
        action: null,
        answerText: null,
      },
    ],
    phase: "lobby",
    clues: [],
    correctAnswer: "",
    currentClueIndex: 0,
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);
  return { roomId, playerId };
}

export function joinRoom(roomId: string, playerName: string): { playerId: string } | null {
  const room = rooms.get(roomId);
  if (!room || room.phase !== "lobby") return null;
  const playerId = generateId("player");
  room.players.push({
    playerId,
    name: playerName,
    action: null,
    answerText: null,
  });
  return { playerId };
}

export function getRoom(roomId: string): WhoAmIRoom | null {
  return rooms.get(roomId) ?? null;
}

export function startGame(roomId: string, requestingPlayerId: string): boolean {
  const room = rooms.get(roomId);
  if (!room || room.phase !== "lobby" || room.creatorId !== requestingPlayerId) return false;
  if (room.players.length < 1) return false;
  const puzzle = pickRandomPuzzle();
  room.phase = "playing";
  room.clues = puzzle.clues;
  room.correctAnswer = puzzle.correctAnswer;
  room.currentClueIndex = 0;
  room.players.forEach((p) => {
    p.action = null;
    p.answerText = null;
  });
  return true;
}

/** Moderator starts another round (new player to guess) without leaving the room. */
export function startNextRound(roomId: string, requestingPlayerId: string): boolean {
  const room = rooms.get(roomId);
  if (!room || room.phase !== "reveal" || room.creatorId !== requestingPlayerId) return false;
  const puzzle = pickRandomPuzzle();
  room.phase = "playing";
  room.clues = puzzle.clues;
  room.correctAnswer = puzzle.correctAnswer;
  room.currentClueIndex = 0;
  room.players.forEach((p) => {
    p.action = null;
    p.answerText = null;
  });
  return true;
}

function allPlayersDecided(room: WhoAmIRoom): boolean {
  return room.players.every((p) => p.action !== null);
}

function allPlayersAnswered(room: WhoAmIRoom): boolean {
  return room.players.length > 0 && room.players.every((p) => p.action === "answer");
}

function advanceClue(room: WhoAmIRoom): void {
  room.currentClueIndex += 1;
  if (room.currentClueIndex >= room.clues.length) {
    room.phase = "reveal";
    return;
  }
  // Only players who skipped can act on the next clue; those who answered stay locked
  room.players.forEach((p) => {
    if (p.action === "skip") {
      p.action = null;
      p.answerText = null;
    }
  });
}

export function submitAction(
  roomId: string,
  playerId: string,
  action: "answer" | "skip",
  answerText?: string
): { ok: boolean; error?: string } {
  const room = rooms.get(roomId);
  if (!room) return { ok: false, error: "Room not found" };
  if (room.phase !== "playing") return { ok: false, error: "Game not in playing phase" };

  const player = room.players.find((p) => p.playerId === playerId);
  if (!player) return { ok: false, error: "Player not in room" };
  if (player.action !== null) return { ok: false, error: "Already submitted for this clue" };

  if (action === "answer") {
    const text = (answerText ?? "").trim();
    if (!text) return { ok: false, error: "Answer text required" };
    player.action = "answer";
    player.answerText = text;
  } else {
    player.action = "skip";
  }

  if (allPlayersAnswered(room)) {
    room.phase = "reveal";
    return { ok: true };
  }

  if (allPlayersDecided(room)) {
    advanceClue(room);
  }

  return { ok: true };
}

/** Optional: cleanup old rooms (e.g. 24h) */
export function deleteRoom(roomId: string): void {
  rooms.delete(roomId);
}
