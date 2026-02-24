import { NextResponse } from "next/server";
import { LEAGUE_TO_COUNTRY } from "@/app/standings-draft/_lib/leagues";
import England from "@/lib/England.json";
import Spain from "@/lib/Spain.json";
import France from "@/lib/France.json";
import Germany from "@/lib/Germany.json";
import Italy from "@/lib/Italy.json";

const COUNTRIES = new Set(Object.values(LEAGUE_TO_COUNTRY));

type TeamResponse = { response: Array<{ team: { name: string } }> };

const DATA: Record<string, TeamResponse> = {
  England: England as unknown as TeamResponse,
  Spain: Spain as unknown as TeamResponse,
  France: France as unknown as TeamResponse,
  Germany: Germany as unknown as TeamResponse,
  Italy: Italy as unknown as TeamResponse,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") ?? "";
  if (!COUNTRIES.has(country)) {
    return NextResponse.json(
      { error: "country must be England, Spain, France, Germany, or Italy" },
      { status: 400 }
    );
  }
  const data = DATA[country];
  if (!data?.response) {
    return NextResponse.json(
      { error: "Failed to load team names" },
      { status: 500 }
    );
  }
  const names = data.response.map((r) => r.team?.name).filter(Boolean);
  return NextResponse.json({ names });
}
