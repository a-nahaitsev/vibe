import { NextResponse } from "next/server";
import { submitAction } from "../../../store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  let body: { playerId?: string; action?: string; answer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const playerId = (body.playerId ?? "").trim();
  const action = body.action === "answer" || body.action === "skip" ? body.action : null;
  if (!playerId || !action) {
    return NextResponse.json(
      { error: "playerId and action (answer|skip) are required" },
      { status: 400 }
    );
  }
  const result = submitAction(
    roomId,
    playerId,
    action,
    action === "answer" ? body.answer : undefined
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
