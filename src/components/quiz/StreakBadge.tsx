"use client";

import { FcFlashOn } from "react-icons/fc";

interface StreakBadgeProps {
  streak: number;
  text: string;
  className?: string;
}

export function StreakBadge({
  streak,
  text,
  className = "",
}: StreakBadgeProps) {
  const isZero = streak <= 0;
  return (
    <span
      className={
        (isZero
          ? "inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2.5 py-0.5 text-sm font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200 "
          : "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 ") +
        className
      }
    >
      {!isZero && <FcFlashOn className="h-4 w-4" aria-hidden />} {text}
    </span>
  );
}
