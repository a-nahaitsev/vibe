/** Football Quiz – shared types */

export type LeagueId =
  | "premier-league"
  | "la-liga"
  | "serie-a"
  | "bundesliga"
  | "champions-league"
  | "world-cup"
  | "euro";

export type QuizMode =
  | "daily"
  | "time-attack"
  | "who-am-i"
  | "photo-quiz"
  | "career-path"
  | "match-history"
  | "league"
  | "club"
  | "transfer"
  | "duel"
  | "prediction";

export interface League {
  id: LeagueId;
  name: string;
  shortName: string;
}

export interface Club {
  id: string;
  name: string;
  leagueId: LeagueId;
  logo?: string;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  clubs: { clubId: string; from: number; to: number | null }[];
  photo?: string;
  country?: string;
}

export interface QuizQuestionBase {
  id: string;
  type: "multiple-choice" | "text-clue" | "photo" | "career" | "match" | "transfer";
  leagueId?: LeagueId;
  clubId?: string;
}

export interface MultipleChoiceQuestion extends QuizQuestionBase {
  type: "multiple-choice";
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface WhoAmIQuestion extends QuizQuestionBase {
  type: "text-clue";
  clues: string[];
  correctAnswer: string; // player name
  playerId: string;
}

export interface PhotoQuizQuestion extends QuizQuestionBase {
  type: "photo";
  imageUrl: string;
  blurLevel?: number;
  correctAnswer: string;
  playerId: string;
}

export interface CareerPathQuestion extends QuizQuestionBase {
  type: "career";
  timeline: { clubName: string; years: string }[];
  correctAnswer: string;
  playerId: string;
}

export interface MatchHistoryQuestion extends QuizQuestionBase {
  type: "match";
  question: string;
  options: string[];
  correctIndex: number;
  matchContext?: string;
}

export interface TransferQuestion extends QuizQuestionBase {
  type: "transfer";
  question: string;
  options: string[];
  correctIndex: number;
}

export type QuizQuestion =
  | MultipleChoiceQuestion
  | WhoAmIQuestion
  | PhotoQuizQuestion
  | CareerPathQuestion
  | MatchHistoryQuestion
  | TransferQuestion;

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  avatar?: string;
  streak?: number;
}

export interface LeagueEntry {
  id: string;
  name: string;
  memberCount: number;
  inviteCode: string;
  weeklyScores?: LeaderboardEntry[];
}

export interface UserQuizResult {
  mode: QuizMode;
  score: number;
  total: number;
  streak: number;
  date: string;
  leagueId?: LeagueId;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatar?: string;
  streak: number;
  totalScore: number;
  favoriteClubId?: string;
}
