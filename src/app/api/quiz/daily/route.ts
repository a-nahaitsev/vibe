import { NextResponse } from "next/server";
import { getDailyQuestions } from "@/app/football-quiz/_lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const questions = getDailyQuestions(date);
  return NextResponse.json({ date, questions });
}
