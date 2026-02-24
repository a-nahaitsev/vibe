import { NextResponse } from "next/server";
import { startGame } from "../../../store";
import type { Season, StandingRow } from "@/app/standings-draft/_lib/types";

const API_BASE = "https://v3.football.api-sports.io";

type StartBody = {
  playerId?: string;
  season?: number;
  league?: number;
  standings?: StandingRow[];
  leagueName?: string;
};

function parseStandings(raw: unknown): StandingRow[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw.map((r: Record<string, unknown>) => ({
    rank: r.rank as number,
    team: r.team as { id: number; name: string; logo: string },
    points: r.points as number,
    goalsDiff: r.goalsDiff as number,
    group: (r.group as string) ?? "",
    form: (r.form as string) ?? null,
    all: r.all as StandingRow["all"],
    home: r.home as StandingRow["home"],
    away: r.away as StandingRow["away"],
  }));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  let body: StartBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const playerId = (body.playerId ?? "").trim();
  const season = body.season as Season | undefined;
  const leagueId = typeof body.league === "number" ? body.league : 39;
  const allowedLeagues = [39, 140, 61, 78, 135];
  if (!playerId) {
    return NextResponse.json(
      { error: "playerId is required" },
      { status: 400 }
    );
  }
  if (!allowedLeagues.includes(leagueId)) {
    return NextResponse.json(
      { error: "Invalid league" },
      { status: 400 }
    );
  }
  if (!season || ![2022, 2023, 2024].includes(season)) {
    return NextResponse.json(
      { error: "season must be 2022, 2023, or 2024" },
      { status: 400 }
    );
  }

  let standings: StandingRow[];
  let leagueName: string;

  const cachedStandings = body.standings;
  const cachedLeagueName =
    typeof body.leagueName === "string" ? body.leagueName.trim() : "";
  if (
    Array.isArray(cachedStandings) &&
    cachedStandings.length > 0 &&
    cachedLeagueName
  ) {
    const parsed = parseStandings(cachedStandings);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid cached standings" },
        { status: 400 }
      );
    }
    standings = parsed;
    leagueName = cachedLeagueName;
  } else {
    const key = process.env.API_FOOTBALL_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "API not configured" },
        { status: 500 }
      );
    }
    const res = await fetch(
      `${API_BASE}/standings?league=${leagueId}&season=${season}`,
      {
        headers: { "x-apisports-key": key },
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message ?? "Failed to load standings" },
        { status: res.status }
      );
    }
    const err = data.errors ?? {};
    if (Object.keys(err).length > 0) {
      return NextResponse.json(
        { error: (Object.values(err)[0] as string) ?? "API error" },
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
    standings = response.league.standings[0].map((r: Record<string, unknown>) => ({
      rank: r.rank as number,
      team: r.team as { id: number; name: string; logo: string },
      points: r.points as number,
      goalsDiff: r.goalsDiff as number,
      group: (r.group as string) ?? "",
      form: (r.form as string) ?? null,
      all: r.all as StandingRow["all"],
      home: r.home as StandingRow["home"],
      away: r.away as StandingRow["away"],
    }));
    leagueName =
      (response.league as { name?: string }).name ?? "Premier League";
  }

  const result = startGame(
    roomId,
    playerId,
    leagueId,
    standings,
    leagueName,
    season
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed to start" },
      { status: 403 }
    );
  }
  return NextResponse.json({ ok: true, standings, leagueName });
}
