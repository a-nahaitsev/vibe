/** Clues and correct answer for multiplayer Who Am I */

export interface WhoAmIPuzzle {
  clues: string[];
  correctAnswer: string;
}

export const WHO_AM_I_PUZZLES: WhoAmIPuzzle[] = [
  {
    clues: [
      "I have won the Champions League with two different clubs.",
      "I have won multiple Ballon d'Or awards.",
      "I played for Barcelona for over 15 years.",
      "I am from Argentina.",
    ],
    correctAnswer: "Lionel Messi",
  },
  {
    clues: [
      "I have won league titles in England, Spain and Italy.",
      "I am one of the top scorers in Champions League history.",
      "I wear the number 7.",
      "I am from Portugal.",
    ],
    correctAnswer: "Cristiano Ronaldo",
  },
  {
    clues: [
      "I play in the Premier League.",
      "I have won the Golden Boot multiple times.",
      "I am known for my speed and left foot.",
      "I am from Egypt and play for Liverpool.",
    ],
    correctAnswer: "Mohamed Salah",
  },
  {
    clues: [
      "I am a Belgian midfielder.",
      "I play for Manchester City.",
      "I am known for my passing and assists.",
      "I previously played for Chelsea and Wolfsburg.",
    ],
    correctAnswer: "Kevin De Bruyne",
  },
  {
    clues: [
      "I am a Norwegian striker.",
      "I broke the Premier League single-season goals record.",
      "I joined Manchester City from Borussia Dortmund.",
      "I am known for my physical presence and finishing.",
    ],
    correctAnswer: "Erling Haaland",
  },
  {
    clues: [
      "I am a French forward who moved from Monaco to Paris, then to Spain.",
      "I have won the World Cup with France.",
      "I am known for my pace and dribbling.",
      "I wear the number 7 at my current club.",
    ],
    correctAnswer: "Kylian Mbappé",
  },
  {
    clues: [
      "I am a Brazilian forward who played for Barcelona and Paris.",
      "I have won the Champions League and multiple league titles.",
      "I am known for my flair and dribbling.",
      "I moved for a world-record transfer fee in 2017.",
    ],
    correctAnswer: "Neymar Jr",
  },
  {
    clues: [
      "I am an English striker and captain of the national team.",
      "I have been Premier League top scorer multiple times.",
      "I played for Tottenham for many years before moving to Germany.",
      "I am known for my finishing and link-up play.",
    ],
    correctAnswer: "Harry Kane",
  },
  {
    clues: [
      "I am an English midfielder who plays in Spain.",
      "I moved from Borussia Dortmund to Real Madrid.",
      "I wear the number 5 and am known for my box-to-box style.",
      "I won the Golden Boy award.",
    ],
    correctAnswer: "Jude Bellingham",
  },
  {
    clues: [
      "I am a Dutch defender who captained Liverpool.",
      "I have won the Champions League and Premier League.",
      "I am known for my long passes and defensive leadership.",
      "I previously played for Southampton and Celtic.",
    ],
    correctAnswer: "Virgil van Dijk",
  },
  {
    clues: [
      "I am a Polish striker who played for Bayern Munich and Barcelona.",
      "I have won the Champions League and multiple Golden Boots.",
      "I am one of the top scorers in Bundesliga history.",
      "I am known for my positioning and finishing.",
    ],
    correctAnswer: "Robert Lewandowski",
  },
  {
    clues: [
      "I am an Italian goalkeeper who played for Juventus and Paris.",
      "I have won multiple Serie A titles and the Euro with Italy.",
      "I am known for my shot-stopping and distribution.",
      "I am considered one of the best goalkeepers of my generation.",
    ],
    correctAnswer: "Gianluigi Buffon",
  },
];

export function pickRandomPuzzle(): WhoAmIPuzzle {
  const i = Math.floor(Math.random() * WHO_AM_I_PUZZLES.length);
  return WHO_AM_I_PUZZLES[i]!;
}

/** All names for answer suggestions: real players (10) + similar dummy names */
export const ANSWER_SUGGESTIONS: string[] = [
  // Real (from WHO_AM_I_PUZZLES)
  "Lionel Messi",
  "Cristiano Ronaldo",
  "Mohamed Salah",
  "Kevin De Bruyne",
  "Erling Haaland",
  "Kylian Mbappé",
  "Neymar Jr",
  "Harry Kane",
  "Jude Bellingham",
  "Virgil van Dijk",
  "Robert Lewandowski",
  "Gianluigi Buffon",
  // Dummy similar / plausible names
  "Lionel Martinez",
  "Cristiano Rodriguez",
  "Leo Messi",
  "C. Ronaldo",
  "Mohammed Salah",
  "Salah Mohamed",
  "Kevin De Bruyn",
  "Erling Haland",
  "Haaland Erling",
  "Kylian Mbappe",
  "Mbappé Kylian",
  "Neymar",
  "Neymar Junior",
  "Harry Kane Jr",
  "Kane Harry",
  "Jude Bellingham Jr",
  "Virgil van Dyck",
  "Van Dijk Virgil",
  "Robert Lewandowsky",
  "Lewandowski Robert",
  "Gianluigi Donnarumma",
  "Buffon Gianluigi",
  "Luis Suárez",
  "Sergio Agüero",
  "Karim Benzema",
  "Luka Modrić",
  "Toni Kroos",
  "Marc-André ter Stegen",
  "Manuel Neuer",
  "Thibaut Courtois",
  "Ederson",
  "Alisson Becker",
];

/** Filter suggestions by query (case-insensitive substring), limit count */
export function filterSuggestions(query: string, limit = 10): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return ANSWER_SUGGESTIONS.slice(0, limit);
  return ANSWER_SUGGESTIONS.filter((name) => name.toLowerCase().includes(q)).slice(0, limit);
}
