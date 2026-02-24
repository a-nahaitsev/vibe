"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  seconds: number;
  onEnd: () => void;
  running: boolean;
  className?: string;
}

export function Timer({ seconds: initial, onEnd, running, className = "" }: TimerProps) {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    if (!running || seconds <= 0) {
      if (seconds <= 0) onEnd();
      return;
    }
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t);
          onEnd();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seconds is the initial value for countdown; including it would reset the timer
  }, [running, onEnd]);

  const color =
    seconds <= 10 ? "text-red-600 dark:text-red-400" : "text-zinc-700 dark:text-zinc-300";

  return (
    <div
      className={
        "inline-flex items-center gap-1 rounded-full bg-zinc-200 px-3 py-1 text-sm font-mono font-bold dark:bg-zinc-700 " +
        color +
        " " +
        className
      }
    >
      <span>⏱</span>
      <span>{seconds}s</span>
    </div>
  );
}
