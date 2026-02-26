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
  return NextResponse.json(roomForClient);
}
