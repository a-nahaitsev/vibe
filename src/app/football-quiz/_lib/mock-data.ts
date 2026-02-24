import type {
  League,
  Club,
  Player,
  MultipleChoiceQuestion,
  WhoAmIQuestion,
  CareerPathQuestion,
  MatchHistoryQuestion,
  TransferQuestion,
  LeaderboardEntry,
  LeagueEntry,
} from "./types";

export const LEAGUES: League[] = [
  { id: "premier-league", name: "Premier League", shortName: "PL" },
  { id: "la-liga", name: "La Liga", shortName: "LL" },
  { id: "serie-a", name: "Serie A", shortName: "SA" },
  { id: "bundesliga", name: "Bundesliga", shortName: "BL" },
  { id: "champions-league", name: "Champions League", shortName: "UCL" },
  { id: "world-cup", name: "World Cup", shortName: "WC" },
  { id: "euro", name: "UEFA Euro", shortName: "EURO" },
];

export const CLUBS: Club[] = [
  { id: "mun", name: "Manchester United", leagueId: "premier-league" },
  { id: "liv", name: "Liverpool", leagueId: "premier-league" },
  { id: "mci", name: "Manchester City", leagueId: "premier-league" },
  { id: "ars", name: "Arsenal", leagueId: "premier-league" },
  { id: "che", name: "Chelsea", leagueId: "premier-league" },
  { id: "rm", name: "Real Madrid", leagueId: "la-liga" },
  { id: "bar", name: "Barcelona", leagueId: "la-liga" },
  { id: "atm", name: "Atlético Madrid", leagueId: "la-liga" },
  { id: "bay", name: "Bayern Munich", leagueId: "bundesliga" },
  { id: "dor", name: "Borussia Dortmund", leagueId: "bundesliga" },
  { id: "juv", name: "Juventus", leagueId: "serie-a" },
  { id: "mil", name: "AC Milan", leagueId: "serie-a" },
  { id: "paris", name: "Paris Saint-Germain", leagueId: "premier-league" },
  { id: "rom", name: "Roma", leagueId: "serie-a" },
  { id: "wol", name: "VfL Wolfsburg", leagueId: "bundesliga" },
];

export const PLAYERS: Player[] = [
  {
    id: "p1",
    name: "Cristiano Ronaldo",
    position: "Forward",
    country: "Portugal",
    clubs: [
      { clubId: "mun", from: 2003, to: 2009 },
      { clubId: "rm", from: 2009, to: 2018 },
      { clubId: "juv", from: 2018, to: 2021 },
      { clubId: "mun", from: 2021, to: 2022 },
    ],
  },
  {
    id: "p2",
    name: "Lionel Messi",
    position: "Forward",
    country: "Argentina",
    clubs: [
      { clubId: "bar", from: 2004, to: 2021 },
      { clubId: "paris", from: 2021, to: 2023 },
    ],
  },
  {
    id: "p3",
    name: "Mohamed Salah",
    position: "Forward",
    country: "Egypt",
    clubs: [
      { clubId: "che", from: 2014, to: 2016 },
      { clubId: "rom", from: 2016, to: 2017 },
      { clubId: "liv", from: 2017, to: null },
    ],
  },
  {
    id: "p4",
    name: "Kevin De Bruyne",
    position: "Midfielder",
    country: "Belgium",
    clubs: [
      { clubId: "che", from: 2012, to: 2014 },
      { clubId: "wol", from: 2014, to: 2015 },
      { clubId: "mci", from: 2015, to: null },
    ],
  },
  {
    id: "p5",
    name: "Erling Haaland",
    position: "Forward",
    country: "Norway",
    clubs: [
      { clubId: "dor", from: 2020, to: 2022 },
      { clubId: "mci", from: 2022, to: null },
    ],
  },
];

/** Daily / general multiple choice questions (seeded by date for "daily" feel) */
export const MULTIPLE_CHOICE_QUESTIONS: MultipleChoiceQuestion[] = [
  {
    id: "q1",
    type: "multiple-choice",
    question: "Which club has won the most Premier League titles?",
    options: ["Manchester United", "Liverpool", "Chelsea", "Arsenal"],
    correctIndex: 0,
    leagueId: "premier-league",
    explanation: "Manchester United have won 20 English top-flight titles.",
  },
  {
    id: "q2",
    type: "multiple-choice",
    question: "Who won the 2022 FIFA World Cup?",
    options: ["Brazil", "France", "Argentina", "Germany"],
    correctIndex: 2,
    leagueId: "world-cup",
    explanation: "Argentina beat France on penalties in the 2022 final.",
  },
  {
    id: "q3",
    type: "multiple-choice",
    question: "Which player has scored the most goals in Champions League history?",
    options: ["Lionel Messi", "Cristiano Ronaldo", "Robert Lewandowski", "Karim Benzema"],
    correctIndex: 1,
    leagueId: "champions-league",
    explanation: "Cristiano Ronaldo holds the record with 140 goals.",
  },
  {
    id: "q4",
    type: "multiple-choice",
    question: "In which year did Barcelona win the treble under Pep Guardiola?",
    options: ["2008", "2009", "2010", "2011"],
    correctIndex: 1,
    leagueId: "la-liga",
    explanation: "Barcelona won La Liga, Copa del Rey and Champions League in 2008–09.",
  },
  {
    id: "q5",
    type: "multiple-choice",
    question: "Which country has won the most UEFA European Championship titles?",
    options: ["Italy", "Germany", "Spain", "France"],
    correctIndex: 1,
    leagueId: "euro",
    explanation: "Germany and Spain have each won 3 Euros.",
  },
  {
    id: "q6",
    type: "multiple-choice",
    question: "Who manages Liverpool as of the 2024–25 season?",
    options: ["Jürgen Klopp", "Arne Slot", "Pep Lijnders", "Steven Gerrard"],
    correctIndex: 1,
    leagueId: "premier-league",
  },
  {
    id: "q7",
    type: "multiple-choice",
    question: "Which club did Erling Haaland join from Borussia Dortmund?",
    options: ["Real Madrid", "Manchester City", "Chelsea", "Barcelona"],
    correctIndex: 1,
    leagueId: "premier-league",
  },
  {
    id: "q8",
    type: "multiple-choice",
    question: "How many Ballon d'Or awards has Lionel Messi won?",
    options: ["6", "7", "8", "9"],
    correctIndex: 2,
    leagueId: "la-liga",
    explanation: "Messi has won 8 Ballon d'Or awards.",
  },
  {
    id: "q9",
    type: "multiple-choice",
    question: "Which team won the first ever Premier League title in 1992–93?",
    options: ["Manchester United", "Aston Villa", "Norwich City", "Blackburn Rovers"],
    correctIndex: 0,
    leagueId: "premier-league",
  },
  {
    id: "q10",
    type: "multiple-choice",
    question: "Who scored the 'Hand of God' goal in the 1986 World Cup?",
    options: ["Pelé", "Diego Maradona", "Zinedine Zidane", "Ronaldo"],
    correctIndex: 1,
    leagueId: "world-cup",
  },
];

/** Who Am I – clues for a player */
export const WHO_AM_I_QUESTIONS: WhoAmIQuestion[] = [
  {
    id: "w1",
    type: "text-clue",
    clues: [
      "I have won the Champions League with two different clubs.",
      "I have won multiple Ballon d'Or awards.",
      "I played for Barcelona for over 15 years.",
      "I am from Argentina.",
    ],
    correctAnswer: "Lionel Messi",
    playerId: "p2",
  },
  {
    id: "w2",
    type: "text-clue",
    clues: [
      "I have won league titles in England, Spain and Italy.",
      "I am one of the top scorers in Champions League history.",
      "I wear the number 7.",
      "I am from Portugal.",
    ],
    correctAnswer: "Cristiano Ronaldo",
    playerId: "p1",
  },
  {
    id: "w3",
    type: "text-clue",
    clues: [
      "I play in the Premier League.",
      "I have won the Golden Boot multiple times.",
      "I am known for my speed and left foot.",
      "I am from Egypt and play for Liverpool.",
    ],
    correctAnswer: "Mohamed Salah",
    playerId: "p3",
  },
  {
    id: "w4",
    type: "text-clue",
    clues: [
      "I am a Belgian midfielder.",
      "I play for Manchester City.",
      "I am known for my passing and assists.",
      "I previously played for Chelsea and Wolfsburg.",
    ],
    correctAnswer: "Kevin De Bruyne",
    playerId: "p4",
  },
  {
    id: "w5",
    type: "text-clue",
    clues: [
      "I am a Norwegian striker.",
      "I broke the Premier League single-season goals record.",
      "I joined Manchester City from Borussia Dortmund.",
      "I am known for my physical presence and finishing.",
    ],
    correctAnswer: "Erling Haaland",
    playerId: "p5",
  },
];

/** Career path – club timeline */
export const CAREER_PATH_QUESTIONS: CareerPathQuestion[] = PLAYERS.slice(0, 5).map((p, i) => {
  return {
    id: `cp${i + 1}`,
    type: "career",
    timeline: p.clubs.map((c) => ({
      clubName: CLUBS.find((cl) => cl.id === c.clubId)?.name ?? "Unknown",
      years: `${c.from}–${c.to ?? "present"}`,
    })),
    correctAnswer: p.name,
    playerId: p.id,
  };
});

/** Match history */
export const MATCH_HISTORY_QUESTIONS: MatchHistoryQuestion[] = [
  {
    id: "m1",
    type: "match",
    question: "Who scored the winning goal in the 2022 Champions League final (Real Madrid vs Liverpool)?",
    options: ["Karim Benzema", "Vinícius Júnior", "Mohamed Salah", "Sadio Mané"],
    correctIndex: 1,
    leagueId: "champions-league",
    matchContext: "2022 UCL Final, Paris",
  },
  {
    id: "m2",
    type: "match",
    question: "What was the score in the 2019 Champions League semi-final second leg: Liverpool 4–0 Barcelona?",
    options: ["Aggregate 4–3 to Liverpool", "Aggregate 4–3 to Barcelona", "4–0 was the aggregate", "Barcelona won on away goals"],
    correctIndex: 0,
    leagueId: "champions-league",
  },
  {
    id: "m3",
    type: "match",
    question: "Which country hosted the 2018 World Cup?",
    options: ["Brazil", "Russia", "Qatar", "Germany"],
    correctIndex: 1,
    leagueId: "world-cup",
  },
];

/** Transfer rumors / fees */
export const TRANSFER_QUESTIONS: TransferQuestion[] = [
  {
    id: "t1",
    type: "transfer",
    question: "What was the reported transfer fee for Neymar from Barcelona to Paris Saint-Germain in 2017?",
    options: ["€150m", "€198m", "€222m", "€250m"],
    correctIndex: 2,
    leagueId: "la-liga",
  },
  {
    id: "t2",
    type: "transfer",
    question: "Which club paid a then world-record fee for Paul Pogba in 2016?",
    options: ["Real Madrid", "Manchester City", "Manchester United", "Chelsea"],
    correctIndex: 2,
    leagueId: "premier-league",
  },
  {
    id: "t3",
    type: "transfer",
    question: "Enzo Fernández joined Chelsea from Benfica in January 2023 for a British record fee of approximately:",
    options: ["£80m", "£100m", "£106m", "£120m"],
    correctIndex: 2,
    leagueId: "premier-league",
  },
];

/** Global leaderboard (mock) */
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: "u1", displayName: "GoalMachine", score: 2840, streak: 12 },
  { rank: 2, userId: "u2", displayName: "PitchKing", score: 2650, streak: 7 },
  { rank: 3, userId: "u3", displayName: "NetBuster", score: 2510, streak: 5 },
  { rank: 4, userId: "u4", displayName: "TacticalMind", score: 2390, streak: 3 },
  { rank: 5, userId: "u5", displayName: "FootieFan", score: 2280, streak: 9 },
];

/** Private leagues (mock) */
export const MOCK_LEAGUES: LeagueEntry[] = [
  { id: "l1", name: "Office FC", memberCount: 12, inviteCode: "OFFICE2024" },
  { id: "l2", name: "Uni Legends", memberCount: 28, inviteCode: "UNI24" },
  { id: "l3", name: "Family League", memberCount: 6, inviteCode: "FAMILY" },
];

/** Get 5 daily questions (deterministic by date string) */
export function getDailyQuestions(dateKey: string): MultipleChoiceQuestion[] {
  const seed = dateKey.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = [...MULTIPLE_CHOICE_QUESTIONS].sort(
    (a, b) => (a.id.charCodeAt(0) * 31 + seed) % 1000 - (b.id.charCodeAt(0) * 31 + seed) % 1000
  );
  return shuffled.slice(0, 5);
}

/** Get N random multiple choice questions */
export function getRandomMultipleChoice(n: number): MultipleChoiceQuestion[] {
  const copy = [...MULTIPLE_CHOICE_QUESTIONS];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
