"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { QuestionCard, AnswerOptions, Timer } from "@/components/quiz";
import type { MultipleChoiceQuestion } from "../_lib/types";
import { getRandomMultipleChoice } from "../_lib/mock-data";

const TIME_LIMIT = 60;
const COMBO_MULTIPLIER = 1.2; // 20% bonus per consecutive correct

export default function TimeAttackPage() {
  const [questions] = useState<MultipleChoiceQuestion[]>(() =>
    getRandomMultipleChoice(20)
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);

  const q = questions[index];

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (showResult || !q) return;
      setSelected(optionIndex);
      setShowResult(true);
      const correct = optionIndex === q.correctIndex;
      if (correct) {
        const points = Math.round(100 * Math.pow(COMBO_MULTIPLIER, combo));
        setScore((s) => s + points);
        setCombo((c) => c + 1);
      } else {
        setCombo(0);
      }
    },
    [q, showResult, combo]
  );

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      setRunning(false);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setShowResult(false);
  }, [index, questions.length]);

  const handleTimeEnd = useCallback(() => {
    setFinished(true);
    setRunning(false);
  }, []);

  if (questions.length === 0 && !finished) {
    return (
      <div className="text-zinc-500 dark:text-zinc-400">
        Loading questions…
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
            Time&apos;s up!
          </h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">
            You answered <strong>{index + (showResult ? 1 : 0)}</strong> questions
            with a score of <strong>{score}</strong>.
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
        <div className="flex items-center gap-4">
          <Timer seconds={TIME_LIMIT} onEnd={handleTimeEnd} running={running} />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Score: {score}
          </span>
          {combo > 0 && (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-sm text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              Combo x{combo}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Time Attack · 60 seconds · answer as many as you can
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
          {showResult && (
            <button
              type="button"
              onClick={handleNext}
              className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              Next
            </button>
          )}
        </QuestionCard>
      )}
    </div>
  );
}
