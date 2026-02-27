"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  QuestionCard,
  AnswerOptions,
  StreakBadge,
  Leaderboard,
} from "@/components/quiz";
import type { MultipleChoiceQuestion } from "../_lib/types";
import { getDailyQuestions } from "../_lib/mock-data";
import { MOCK_LEADERBOARD } from "../_lib/mock-data";

export default function DailyQuizPage() {
  const dateKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const questions = useMemo(() => getDailyQuestions(dateKey), [dateKey]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [streak] = useState(3); // mock
  const [finished, setFinished] = useState(false);

  const q = questions[index] as MultipleChoiceQuestion | undefined;

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (showResult || !q) return;
      setSelected(optionIndex);
      setShowResult(true);
      const correct = optionIndex === q.correctIndex;
      if (correct) setScore((s) => s + 1);
    },
    [q, showResult]
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

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <p>No questions for today. Try again later.</p>
        <Link
          href="/football-quiz"
          className="mt-2 inline-block text-emerald-600 dark:text-emerald-400"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="space-y-6">
        <Link
          href="/football-quiz"
          className="text-sm text-zinc-500 hover:underline"
        >
          ← Back to Home
        </Link>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-900/20">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Daily challenge complete
          </h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">
            You scored <strong>{score}</strong> out of {questions.length}.
          </p>
          <StreakBadge
            streak={streak}
            text={`${streak} day streak`}
            className="mt-3"
          />
        </div>
        <Leaderboard entries={MOCK_LEADERBOARD} title="Global leaderboard" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/football-quiz"
          className="text-sm text-zinc-500 hover:underline"
        >
          ← Back to Home
        </Link>
        <div className="flex items-center gap-3">
          <StreakBadge streak={streak} text={`${streak} day streak`} />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Score: {score}/{questions.length}
          </span>
        </div>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Daily 5-Question Challenge · {dateKey}
      </p>
      {q && (
        <QuestionCard
          question={q}
          questionNumber={index + 1}
          totalQuestions={questions.length}
        >
          <AnswerOptions
            options={q.options}
            selectedIndex={selected}
            correctIndex={showResult ? q.correctIndex : null}
            showResult={showResult}
            onSelect={handleAnswer}
            disabled={showResult}
          />
          {q.explanation && showResult && (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              {q.explanation}
            </p>
          )}
          {showResult && (
            <button
              type="button"
              onClick={handleNext}
              className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {index + 1 >= questions.length ? "See results" : "Next"}
            </button>
          )}
        </QuestionCard>
      )}
    </div>
  );
}
