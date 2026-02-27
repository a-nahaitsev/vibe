import { NextResponse } from "next/server";
import type { StandingRow } from "@/app/standings-draft/_lib/types";
import { LEAGUE_IDS } from "@/app/standings-draft/_lib/leagues";

const API_BASE = "https://v3.football.api-sports.io";
const SEASONS = [2022, 2023, 2024] as const;
const LEAGUE_IDS_STR = (LEAGUE_IDS as readonly number[]).map(String);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league");
  const seasonParam = searchParams.get("season");
  const key = process.env.API_FOOTBALL_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "API_FOOTBALL_API_KEY not configured" },
      { status: 500 }
    );
  }
  if (!league || !LEAGUE_IDS_STR.includes(league)) {
    return NextResponse.json(
      { error: `league must be one of: ${LEAGUE_IDS_STR.join(", ")}` },
      { status: 400 }
    );
  }
  const season = seasonParam ? parseInt(seasonParam, 10) : NaN;
  if (!SEASONS.includes(season as (typeof SEASONS)[number])) {
    return NextResponse.json(
      { error: "season must be 2022, 2023, or 2024" },
      { status: 400 }
    );
  }
  try {
    const res = await fetch(
      `${API_BASE}/standings?league=${league}&season=${season}`,
      {
        headers: { "x-apisports-key": key },
        next: { revalidate: 3600 },
      }
    );
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message ?? "API request failed" },
        { status: res.status }
      );
    }
    const errors = data.errors ?? {};
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: Object.values(errors)[0] ?? "API error" },
        { status: 400 }
      );
    }
    const response = data.response?.[0];
    if (!response?.league?.standings?.[0]) {
      return NextResponse.json(
        { error: "No standings in response" },
        { status: 404 }
      );
    }
    const rows: StandingRow[] = response.league.standings[0].map(
      (r: Record<string, unknown>) => ({
        rank: r.rank as number,
        team: r.team as { id: number; name: string; logo: string },
        points: r.points as number,
        goalsDiff: r.goalsDiff as number,
        group: (r.group as string) ?? "",
        form: (r.form as string) ?? null,
        all: r.all as StandingRow["all"],
        home: r.home as StandingRow["home"],
        away: r.away as StandingRow["away"],
      })
    );
    const leagueName =
      (response.league as { name?: string }).name ?? "Premier League";
    return NextResponse.json({ leagueName, standings: rows });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Request failed" },
      { status: 500 }
    );
  }
}
