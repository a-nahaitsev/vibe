"use client";

import { useEffect, useState } from "react";
import { FcClock } from "react-icons/fc";

interface TimerProps {
  /** Current or initial seconds. When running is false, this value is shown (controlled mode). */
  seconds: number;
  onEnd?: () => void;
  running: boolean;
  className?: string;
  /** "seconds" = "45s", "mmss" = "0:45" or "Time's up!" when 0 */
  format?: "seconds" | "mmss";
}

export function Timer({
  seconds: initial,
  onEnd,
  running,
  className = "",
  format = "seconds",
}: TimerProps) {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    if (!running || seconds <= 0) {
      if (seconds <= 0) onEnd?.();
      return;
    }
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t);
          onEnd?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seconds is the initial value for countdown; including it would reset the timer
  }, [running, onEnd]);

  const displayValue = running ? seconds : initial;
  const color =
    format === "mmss" && displayValue === 0
      ? "text-amber-600 dark:text-amber-400"
      : displayValue <= 10
        ? "text-red-600 dark:text-red-400"
        : "text-zinc-700 dark:text-zinc-300";

  const label =
    format === "mmss"
      ? displayValue === 0
        ? "Time's up!"
        : `${Math.floor(displayValue / 60)}:${String(displayValue % 60).padStart(2, "0")}`
      : `${displayValue}s`;

  return (
    <div
      className={
        "inline-flex items-center gap-1.5 rounded-full bg-zinc-200 px-3 py-1 text-sm font-mono font-bold dark:bg-zinc-700 " +
        color +
        " " +
        className
      }
    >
      <FcClock className="h-4 w-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
