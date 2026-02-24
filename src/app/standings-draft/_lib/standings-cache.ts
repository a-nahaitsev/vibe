import type { StandingRow } from "./types";

const CACHE_KEY_PREFIX = "standings-draft-cache";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface CachedStandings {
  league: number;
  season: number;
  leagueName: string;
  standings: StandingRow[];
  fetchedAt: number;
}

function storageKey(league: number, season: number): string {
  return `${CACHE_KEY_PREFIX}-${league}-${season}`;
}

function isExpired(fetchedAt: number): boolean {
  return Date.now() - fetchedAt > TTL_MS;
}

export function getCachedStandings(
  league: number,
  season: number
): CachedStandings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(league, season));
    if (!raw) return null;
    const data = JSON.parse(raw) as CachedStandings;
    if (
      !data.standings?.length ||
      data.league !== league ||
      data.season !== season ||
      isExpired(data.fetchedAt)
    ) {
      localStorage.removeItem(storageKey(league, season));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCachedStandings(
  league: number,
  season: number,
  leagueName: string,
  standings: StandingRow[]
): void {
  if (typeof window === "undefined") return;
  try {
    const data: CachedStandings = {
      league,
      season,
      leagueName,
      standings,
      fetchedAt: Date.now(),
    };
    localStorage.setItem(storageKey(league, season), JSON.stringify(data));
  } catch {
    // ignore quota or other errors
  }
}
