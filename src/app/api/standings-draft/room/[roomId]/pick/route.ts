import { NextResponse } from "next/server";
import { pickByTeamName } from "../../../store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  let body: {
    playerId?: string;
    teamName?: string;
    guessedPlace?: number;
    useJoker?: boolean;
    useBadgeHint?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const playerId = (body.playerId ?? "").trim();
  const teamName = typeof body.teamName === "string" ? body.teamName : "";
  const guessedPlace =
    typeof body.guessedPlace === "number"
      ? body.guessedPlace
      : typeof body.guessedPlace === "string"
        ? parseInt(body.guessedPlace, 10)
        : NaN;
  const useJoker = body.useJoker === true;
  const useBadgeHint = body.useBadgeHint === true;
  if (!playerId) {
    return NextResponse.json(
      { error: "playerId is required" },
      { status: 400 }
    );
  }
  if (!teamName.trim()) {
    return NextResponse.json(
      { error: "teamName is required" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(guessedPlace) || guessedPlace < 1) {
    return NextResponse.json(
      { error: "guessedPlace is required (1 to league size)" },
      { status: 400 }
    );
  }
  const result = await pickByTeamName(
    roomId,
    playerId,
    teamName,
    guessedPlace,
    useJoker,
    useBadgeHint
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({
    ok: true,
    correct: result.correct,
    points: result.points,
  });
}
