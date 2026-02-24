"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { QuestionCard, AnswerOptions } from "@/components/quiz";
import { TRANSFER_QUESTIONS } from "../_lib/mock-data";

export default function TransferQuizPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = TRANSFER_QUESTIONS[index];

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (showResult || !q) return;
      setSelected(optionIndex);
      setShowResult(true);
      if (optionIndex === q.correctIndex) setScore((s) => s + 1);
    },
    [q, showResult]
  );

  const handleNext = useCallback(() => {
    if (index + 1 >= TRANSFER_QUESTIONS.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setShowResult(false);
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
            Transfer Rumor Mode complete
          </h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">
            Score: <strong>{score}</strong> / {TRANSFER_QUESTIONS.length}
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
          {index + 1} / {TRANSFER_QUESTIONS.length} · Score: {score}
        </span>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Transfer Rumor Mode — fees, records, and big moves.
      </p>
      <QuestionCard
        question={q}
        questionNumber={index + 1}
        totalQuestions={TRANSFER_QUESTIONS.length}
      >
        <AnswerOptions
          options={q.options}
          selectedIndex={selected}
          correctIndex={showResult ? q.correctIndex : null}
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
            {index + 1 >= TRANSFER_QUESTIONS.length ? "See results" : "Next"}
          </button>
        )}
      </QuestionCard>
    </div>
  );
}
