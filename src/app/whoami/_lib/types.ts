/** Multiplayer Who Am I – game types */

export type GamePhase = "lobby" | "playing" | "reveal";

export type PlayerAction = "answer" | "skip";

export interface RoomPlayer {
  playerId: string;
  name: string;
  /** Set once the player has submitted answer or skip for the current clue */
  action: PlayerAction | null;
  /** Filled when action === "answer" */
  answerText: string | null;
}

export interface WhoAmIRoom {
  roomId: string;
  creatorId: string;
  players: RoomPlayer[];
  phase: GamePhase;
  /** Clues for the current round */
  clues: string[];
  correctAnswer: string;
  /** Index of the clue currently shown (0-based) */
  currentClueIndex: number;
  createdAt: number;
}

export interface CreateRoomBody {
  playerName: string;
}

export interface JoinRoomBody {
  roomId: string;
  playerName: string;
}

export interface SubmitActionBody {
  playerId: string;
  action: PlayerAction;
  /** Required when action === "answer" */
  answer?: string;
}
