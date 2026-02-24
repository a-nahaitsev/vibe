"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { QuestionCard } from "@/components/quiz";
import type { PhotoQuizQuestion } from "../_lib/types";

// Placeholder: in a real app these would be real image URLs. We use a placeholder service.
const PLACEHOLDER_IMAGE = "https://placehold.co/400x400/1a1a2e/eee?text=Player+Photo";

const MOCK_PHOTO_QUESTIONS: PhotoQuizQuestion[] = [
  {
    id: "ph1",
    type: "photo",
    imageUrl: PLACEHOLDER_IMAGE,
    correctAnswer: "Cristiano Ronaldo",
    playerId: "p1",
  },
  {
    id: "ph2",
    type: "photo",
    imageUrl: PLACEHOLDER_IMAGE,
    correctAnswer: "Lionel Messi",
    playerId: "p2",
  },
  {
    id: "ph3",
    type: "photo",
    imageUrl: PLACEHOLDER_IMAGE,
    correctAnswer: "Mohamed Salah",
    playerId: "p3",
  },
];

export default function PhotoQuizPage() {
  const [index, setIndex] = useState(0);
  const [blur, setBlur] = useState(12);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = MOCK_PHOTO_QUESTIONS[index];

  const handleReveal = useCallback(() => {
    if (blur <= 0) return;
    setBlur((b) => Math.max(0, b - 4));
  }, [blur]);

  const handleSubmit = useCallback(() => {
    if (!q || revealed) return;
    setRevealed(true);
    const correct =
      guess.trim().toLowerCase() === q.correctAnswer.toLowerCase();
    if (correct) setScore((s) => s + 1);
  }, [q, guess, revealed]);

  const handleNext = useCallback(() => {
    if (index + 1 >= MOCK_PHOTO_QUESTIONS.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setBlur(12);
    setGuess("");
    setRevealed(false);
  }, [index]);

  if (!q) {
    return (
      <div className="text-zinc-500 dark:text-zinc-400">
        No questions. <Link href="/football-quiz" className="text-emerald-600 dark:text-emerald-400">← Back</Link>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="space-y-6">
        <Link href="/football-quiz" className="text-sm text-zinc-500 hover:underline">
          ← Back to Home
        </Link>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-900/20">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Photo Quiz complete
          </h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">
            Score: <strong>{score}</strong> / {MOCK_PHOTO_QUESTIONS.length}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/football-quiz" className="text-sm text-zinc-500 hover:underline">
          ← Back to Home
        </Link>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {index + 1} / {MOCK_PHOTO_QUESTIONS.length} · Score: {score}
        </span>
      </div>
      <QuestionCard question={q} questionNumber={index + 1} totalQuestions={MOCK_PHOTO_QUESTIONS.length}>
        <div className="mt-4">
          <div
            className="relative overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-700"
            style={{ filter: `blur(${blur}px)` }}
          >
            <Image
              src={q.imageUrl}
              alt="Player (blurred)"
              width={400}
              height={400}
              className="h-64 w-full object-cover"
              unoptimized
            />
          </div>
          {blur > 0 && !revealed && (
            <button
              type="button"
              onClick={handleReveal}
              className="mt-3 rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
            >
              Reveal more
            </button>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Guess the player"
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              disabled={revealed}
            />
            {!revealed ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                Submit
              </button>
            ) : (
              <>
                <span className="text-sm">
                  Answer: <strong>{q.correctAnswer}</strong>
                  {guess.trim().toLowerCase() === q.correctAnswer.toLowerCase() ? " ✓" : ""}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  Next
                </button>
              </>
            )}
          </div>
        </div>
      </QuestionCard>
    </div>
  );
}
