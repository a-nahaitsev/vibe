import { NextResponse } from "next/server";
import { pickByTeamName } from "../../../store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  let body: { playerId?: string; teamName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const playerId = (body.playerId ?? "").trim();
  const teamName = typeof body.teamName === "string" ? body.teamName : "";
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
  const result = await pickByTeamName(roomId, playerId, teamName);
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
