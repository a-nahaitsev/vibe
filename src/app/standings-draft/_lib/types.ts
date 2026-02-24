/** API-Football standings row (one team in the table). */
export interface StandingRow {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  home: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  away: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

export type Season = 2022 | 2023 | 2024;

export interface StandingsDraftPlayer {
  playerId: string;
  name: string;
  score: number;
}

export type StandingsDraftPhase = "lobby" | "playing" | "finished";

export interface StandingsDraftRoom {
  roomId: string;
  creatorId: string;
  players: StandingsDraftPlayer[];
  phase: StandingsDraftPhase;
  league: number;
  season: Season;
  leagueName: string;
  /** Full standings from API (by rank 1..N). */
  standings: StandingRow[];
  /** Ranks that have been guessed (team name revealed). */
  revealedRanks: number[];
  /** Whose turn: index into players. */
  currentPlayerIndex: number;
  /** Last pick for UI feedback. */
  lastPick: {
    rank?: number;
    playerId: string;
    teamName: string;
    correct: boolean;
    points: number;
  } | null;
  createdAt: number;
}
