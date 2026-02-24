"use client";

import type { LeaderboardEntry } from "@/app/football-quiz/_lib/types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  showStreak?: boolean;
  className?: string;
}

export function Leaderboard({
  entries,
  title = "Leaderboard",
  showStreak = true,
  className = "",
}: LeaderboardProps) {
  return (
    <div
      className={
        "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 " +
        className
      }
    >
      <h3 className="border-b border-zinc-200 px-4 py-3 font-semibold dark:border-zinc-700">
        {title}
      </h3>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {entries.map((entry) => (
          <li
            key={entry.userId}
            className="flex items-center gap-4 px-4 py-3"
          >
            <span className="w-8 text-sm font-bold text-zinc-500 dark:text-zinc-400">
              #{entry.rank}
            </span>
            <span className="flex-1 font-medium text-zinc-900 dark:text-zinc-100">
              {entry.displayName}
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {entry.score}
            </span>
            {showStreak && entry.streak != null && (
              <span className="text-sm text-amber-600 dark:text-amber-400">
                <span role="img" aria-label="Fire">🔥</span> {entry.streak}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
