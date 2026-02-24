"use client";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className = "" }: StreakBadgeProps) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 " +
        className
      }
    >
      <span role="img" aria-label="Fire">🔥</span> {streak} day streak
    </span>
  );
}
