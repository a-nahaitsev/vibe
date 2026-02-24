"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { QuestionCard, AnswerOptions } from "@/components/quiz";
import type { CareerPathQuestion } from "../_lib/types";
import { CAREER_PATH_QUESTIONS } from "../_lib/mock-data";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Deterministic shuffle for use in render (no Math.random). */
function deterministicShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function CareerPathPage() {
  const [questions] = useState<CareerPathQuestion[]>(() =>
    shuffle([...CAREER_PATH_QUESTIONS])
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const allPlayerNames = useMemo(
    () => [
      ...new Set([
        ...questions.map((qu) => qu.correctAnswer),
        "Cristiano Ronaldo",
        "Lionel Messi",
        "Mohamed Salah",
        "Kevin De Bruyne",
        "Erling Haaland",
      ]),
    ],
    [questions]
  );

  const shuffledOptions = useMemo(() => {
    if (!q) return [];
    const opts = [
      q.correctAnswer,
      ...allPlayerNames.filter((p) => p !== q.correctAnswer),
    ].slice(0, 4);
    return deterministicShuffle(opts, index);
  }, [q, index, allPlayerNames]);

  const shuffledCorrectIndex = q ? shuffledOptions.indexOf(q.correctAnswer) : -1;

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (showResult || !q) return;
      setSelected(optionIndex);
      setShowResult(true);
      if (optionIndex === shuffledCorrectIndex) setScore((s) => s + 1);
    },
    [q, showResult, shuffledCorrectIndex]
  );

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setShowResult(false);
  }, [index, questions.length]);

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
            Career Path complete
          </h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">
            Score: <strong>{score}</strong> / {questions.length}
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
      <QuestionCard question={q} questionNumber={index + 1} totalQuestions={questions.length}>
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Club timeline
          </p>
          <ul className="list-inside list-disc space-y-1 text-zinc-700 dark:text-zinc-300">
            {q.timeline.map((t, i) => (
              <li key={i}>
                {t.clubName} ({t.years})
              </li>
            ))}
          </ul>
          <AnswerOptions
            options={shuffledOptions}
            selectedIndex={selected}
            correctIndex={showResult ? shuffledCorrectIndex : null}
            showResult={showResult}
            onSelect={handleAnswer}
            disabled={showResult}
          />
          {showResult && (
            <button
              type="button"
              onClick={handleNext}
              className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {index + 1 >= questions.length ? "See results" : "Next"}
            </button>
          )}
        </div>
      </QuestionCard>
    </div>
  );
}
