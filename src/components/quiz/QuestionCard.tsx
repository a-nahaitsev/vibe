"use client";

import type { QuizQuestion } from "@/app/football-quiz/_lib/types";

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber?: number;
  totalQuestions?: number;
  children: React.ReactNode;
  className?: string;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  children,
  className = "",
}: QuestionCardProps) {
  const prompt =
    question.type === "multiple-choice" || question.type === "match" || question.type === "transfer"
      ? question.question
      : question.type === "text-clue"
        ? "Who am I?"
        : question.type === "photo"
          ? "Guess the player"
          : question.type === "career"
            ? "Which player had this career path?"
            : "Question";

  return (
    <article
      className={
        "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 " +
        className
      }
    >
      {(questionNumber != null || totalQuestions != null) && (
        <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Question {questionNumber != null ? questionNumber : "?"}
          {totalQuestions != null ? ` of ${totalQuestions}` : ""}
        </p>
      )}
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {prompt}
      </h3>
      {children}
    </article>
  );
}
