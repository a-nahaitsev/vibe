import { NextResponse } from "next/server";
import { getRoom } from "../../store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const room = await getRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  const { badgeHintThisTurn: _omit, ...roomForClient } = room;
  // Client uses turnEndsAt + serverNow for synced countdown (handles clock skew).
  return NextResponse.json({
    ...roomForClient,
    serverNow: Date.now(),
  });
}
