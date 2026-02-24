import { NextResponse } from "next/server";
import { getRandomMultipleChoice } from "@/app/football-quiz/_lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const n = Math.min(20, Math.max(1, parseInt(searchParams.get("n") ?? "10", 10) || 10));
  const questions = getRandomMultipleChoice(n);
  return NextResponse.json({ questions });
}
