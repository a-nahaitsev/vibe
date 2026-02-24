import { NextResponse } from "next/server";
import { startGame } from "../../../store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  let body: { playerId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const playerId = (body.playerId ?? "").trim();
  if (!playerId) {
    return NextResponse.json({ error: "playerId is required" }, { status: 400 });
  }
  const ok = startGame(roomId, playerId);
  if (!ok) {
    return NextResponse.json(
      { error: "Only the creator can start the game" },
      { status: 403 }
    );
  }
  return NextResponse.json({ ok: true });
}
