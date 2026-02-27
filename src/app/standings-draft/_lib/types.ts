/** API-Football standings row (one team in the table). */
export interface StandingRow {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
}

export type Season = 2022 | 2023 | 2024;

export interface StandingsDraftPlayer {
  playerId: string;
  name: string;
  score: number;
  /** Wrong answers this game (wrong team or already revealed). */
  misses?: number;
  /** True if the player has used their Joker (Triple Captain) this game. */
  usedJoker?: boolean;
  /** True if the player has used their Badge Hint this game. */
  usedBadgeHint?: boolean;
  /** Current consecutive correct guesses this game (resets on wrong). */
  correctStreak?: number;
  /** Streak milestones achieved this game (3 → +5, 5 → +10, 7 → +15). */
  streakMilestones?: number[];
}

/** Miss limit: 3, 5, or null = unlimited. */
export type MissLimit = 3 | 5 | null;

export type StandingsDraftPhase = "lobby" | "playing" | "finished";

/** Single pick result (last pick or history item). */
export interface LastPick {
  rank?: number;
  guessedRank?: number;
  playerId: string;
  teamName: string;
  correct: boolean;
  points: number;
  timeout?: boolean;
  jokerUsed?: boolean;
  badgeHintUsed?: boolean;
  streakBonus?: number;
}

export interface StandingsDraftRoom {
  roomId: string;
  creatorId: string;
  players: StandingsDraftPlayer[];
  phase: StandingsDraftPhase;
  /** Max wrong answers before player is out; null = unlimited. Set at game start. */
  missLimit?: MissLimit;
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
  lastPick: LastPick | null;
  /** History of picks (oldest first); lastPick is the most recent. */
  pickHistory?: LastPick[];
  /** Timer per turn in seconds; null = no timer. */
  timerSeconds: number | null;
  /** Server timestamp (ms) when the current turn started. */
  turnStartedAt: number | null;
  /** Server timestamp (ms) when the current turn ends (turnStartedAt + timerSeconds*1000). */
  turnEndsAt: number | null;
  /** Server time (ms) at response time; client uses this to compute clock drift for the timer. */
  serverNow?: number;
  /** Remaining seconds in the current turn, computed on the server for clients; null when no timer. */
  remainingSeconds?: number | null;
  /** For Badge Hint: which logo we're showing this turn (cleared when turn advances). Never sent to client. */
  badgeHintThisTurn?: { playerId: string; logoUrl: string };
  createdAt: number;
}
