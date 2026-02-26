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
    /** Actual rank of the team (1..N). */
    rank?: number;
    /** Position the player guessed (1..N). */
    guessedRank?: number;
    playerId: string;
    teamName: string;
    correct: boolean;
    points: number;
    /** True when turn ended by timeout (no guess submitted). */
    timeout?: boolean;
  } | null;
  /** Timer per turn in seconds; null = no timer. */
  timerSeconds: number | null;
  /** Server timestamp (ms) when the current turn started. */
  turnStartedAt: number | null;
  /** Server timestamp (ms) when the current turn ends (turnStartedAt + timerSeconds*1000). */
  turnEndsAt: number | null;
  createdAt: number;
}
