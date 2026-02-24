import { NextResponse } from "next/server";
import { createRoom } from "../store";

export async function POST(request: Request) {
  let body: { playerName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }
  const playerName = (body.playerName ?? "").trim();
  if (!playerName) {
    return NextResponse.json(
      { error: "playerName is required" },
      { status: 400 }
    );
  }
  const { roomId, playerId } = createRoom(playerName);
  return NextResponse.json({ roomId, playerId });
}
