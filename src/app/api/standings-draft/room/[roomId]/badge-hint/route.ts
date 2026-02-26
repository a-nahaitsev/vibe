import { NextResponse } from "next/server";
import sharp from "sharp";
import { getOrSetBadgeHintLogo } from "../../../store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const { searchParams } = new URL(request.url);
  const playerId = (searchParams.get("playerId") ?? "").trim();
  if (!playerId) {
    return NextResponse.json(
      { error: "playerId is required" },
      { status: 400 }
    );
  }

  const result = await getOrSetBadgeHintLogo(roomId, playerId);
  if (!result.ok || !result.logoUrl) {
    return NextResponse.json(
      { error: result.error ?? "Badge hint not available" },
      { status: 400 }
    );
  }

  try {
    const imageRes = await fetch(result.logoUrl, {
      headers: { "User-Agent": "StandingsDraft/1.0" },
    });
    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch logo" },
        { status: 502 }
      );
    }
    const buffer = Buffer.from(await imageRes.arrayBuffer());
    const blurred = await sharp(buffer)
      .blur(5)
      .modulate({ brightness: 0.95 })
      .png()
      .toBuffer();

    return new NextResponse(blurred, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("Badge hint image error:", e);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
