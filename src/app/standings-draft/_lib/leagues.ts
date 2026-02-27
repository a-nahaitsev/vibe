/** League ID → country key for team names JSON (src/lib/{key}.json). */
export const LEAGUE_TO_COUNTRY: Record<number, string> = {
  39: "England",
  140: "Spain",
  61: "France",
  78: "Germany",
  135: "Italy",
  333: "Ukraine",
  94: "Portugal",
  88: "Netherlands",
  144: "Belgium",
} as const;

export const LEAGUES = [
  { id: 39, name: "Premier League", country: "England", flag: "🇬🇧" },
  { id: 140, name: "La Liga (Primera División)", country: "Spain", flag: "🇪🇸" },
  { id: 61, name: "Ligue 1", country: "France", flag: "🇫🇷" },
  { id: 78, name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  { id: 135, name: "Serie A", country: "Italy", flag: "🇮🇹" },
  { id: 333, name: "Premier League", country: "Ukraine", flag: "🇺🇦" },
  { id: 94, name: "Liga Portugal", country: "Portugal", flag: "🇵🇹" },
  { id: 88, name: "Eredivisie", country: "Netherlands", flag: "🇳🇱" },
  { id: 144, name: "Pro League", country: "Belgium", flag: "🇧🇪" },
] as const;

export const LEAGUE_IDS = LEAGUES.map((l) => l.id);
