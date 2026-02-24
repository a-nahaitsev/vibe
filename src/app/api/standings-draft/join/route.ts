import { NextResponse } from "next/server";
import { joinRoom } from "../store";

export async function POST(request: Request) {
  let body: { roomId?: string; playerName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }
  const roomId = (body.roomId ?? "").trim();
  const playerName = (body.playerName ?? "").trim();
  if (!roomId || !playerName) {
    return NextResponse.json(
      { error: "roomId and playerName are required" },
      { status: 400 }
    );
  }
  const result = joinRoom(roomId, playerName);
  if (!result) {
    return NextResponse.json(
      { error: "Room not found or game already started" },
      { status: 404 }
    );
  }
  return NextResponse.json({ playerId: result.playerId });
}
