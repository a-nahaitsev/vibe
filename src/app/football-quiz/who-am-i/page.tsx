"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { QuestionCard } from "@/components/quiz";
import type { WhoAmIQuestion } from "../_lib/types";
import { WHO_AM_I_QUESTIONS } from "../_lib/mock-data";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function WhoAmIPage() {
  const questions = useMemo(() => shuffle(WHO_AM_I_QUESTIONS).slice(0, 5), []);
  const [index, setIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[index] as WhoAmIQuestion | undefined;

  const handleRevealClue = useCallback(() => {
    if (!q || clueIndex >= q.clues.length - 1) return;
    setClueIndex((c) => c + 1);
  }, [q, clueIndex]);

  const handleSubmitGuess = useCallback(() => {
    if (!q || revealed) return;
    setRevealed(true);
    const correct =
      guess.trim().toLowerCase() === q.correctAnswer.toLowerCase();
    if (correct) setScore((s) => s + 1);
  }, [q, guess, revealed]);

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setClueIndex(0);
    setGuess("");
    setRevealed(false);
  }, [index, questions.length]);

  if (!q) {
    return (
      <div className="text-zinc-500 dark:text-zinc-400">
        No questions available.
        <Link href="/football-quiz" className="ml-2 text-emerald-600 dark:text-emerald-400">
          ← Back
        </Link>
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
            Who Am I? complete
          </h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">
            You got <strong>{score}</strong> out of {questions.length} correct.
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
          {index + 1} / {questions.length} · Score: {score}
        </span>
      </div>
      <QuestionCard
        question={q}
        questionNumber={index + 1}
        totalQuestions={questions.length}
      >
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Clues:
          </p>
          <ul className="list-inside list-disc space-y-1 text-zinc-700 dark:text-zinc-300">
            {q.clues.slice(0, clueIndex + 1).map((clue, i) => (
              <li key={i}>{clue}</li>
            ))}
          </ul>
          {clueIndex < q.clues.length - 1 && (
            <button
              type="button"
              onClick={handleRevealClue}
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
            >
              Reveal next clue
            </button>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Your guess (player name)"
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              disabled={revealed}
            />
            {!revealed ? (
              <button
                type="button"
                onClick={handleSubmitGuess}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                Submit
              </button>
            ) : (
              <>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Answer: <strong>{q.correctAnswer}</strong>
                  {guess.trim().toLowerCase() === q.correctAnswer.toLowerCase()
                    ? " ✓"
                    : " (you said " + (guess || "—") + ")"}
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  {index + 1 >= questions.length ? "See results" : "Next"}
                </button>
              </>
            )}
          </div>
        </div>
      </QuestionCard>
    </div>
  );
}
