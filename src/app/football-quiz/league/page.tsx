"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { QuestionCard, AnswerOptions } from "@/components/quiz";
import { LEAGUES } from "../_lib/mock-data";
import { MULTIPLE_CHOICE_QUESTIONS } from "../_lib/mock-data";
import type { LeagueId } from "../_lib/types";

export default function LeagueQuizPage() {
  const [leagueId, setLeagueId] = useState<LeagueId | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => {
    if (!leagueId) return [];
    return MULTIPLE_CHOICE_QUESTIONS.filter((q) => q.leagueId === leagueId).slice(0, 5);
  }, [leagueId]);

  const q = questions[index];

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
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setShowResult(false);
  }, [index, questions.length]);

  if (leagueId === null) {
    return (
      <div className="space-y-6">
        <Link href="/football-quiz" className="text-sm text-zinc-500 hover:underline">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          League-Specific Mode
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Choose a league. Questions will be about that competition.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              type="button"
              onClick={() => setLeagueId(league.id)}
              className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-600"
            >
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {league.name}
              </span>
              <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                {league.shortName}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <Link href="/football-quiz" className="text-sm text-zinc-500 hover:underline">
          ← Back to Home
        </Link>
        <p className="text-zinc-600 dark:text-zinc-400">
          No questions for this league yet. Try another.
        </p>
        <button
          type="button"
          onClick={() => { setLeagueId(null); setFinished(false); setScore(0); setIndex(0); }}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
        >
          Choose another league
        </button>
      </div>
    );
  }

  if (finished) {
    const league = LEAGUES.find((l) => l.id === leagueId);
    return (
      <div className="space-y-6">
        <Link href="/football-quiz" className="text-sm text-zinc-500 hover:underline">
          ← Back to Home
        </Link>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-900/20">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {league?.name} quiz complete
          </h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">
            Score: <strong>{score}</strong> / {questions.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setLeagueId(null); setFinished(false); setScore(0); setIndex(0); }}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
        >
          Choose another league
        </button>
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
          {LEAGUES.find((l) => l.id === leagueId)?.name} · {index + 1}/{questions.length} · Score: {score}
        </span>
      </div>
      {q && (
        <QuestionCard question={q} questionNumber={index + 1} totalQuestions={questions.length}>
          <AnswerOptions
            options={q.options}
            selectedIndex={selected}
            correctIndex={showResult ? q.correctIndex : null}
            showResult={showResult}
            onSelect={handleAnswer}
            disabled={showResult}
          />
          {showResult && (
            <>
              {q.explanation && (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{q.explanation}</p>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                {index + 1 >= questions.length ? "See results" : "Next"}
              </button>
            </>
          )}
        </QuestionCard>
      )}
    </div>
  );
}
