"use client";

import { useEffect, useState } from "react";

/**
 * Countdown timer that corrects for client/server clock skew using a sync offset.
 * Server sends serverNow (its time at response) and endTime (when timer hits zero).
 * We compute drift = serverNow - Date.now() once and use correctedNow = Date.now() + drift
 * so the countdown matches server time even if the client's clock is wrong.
 */
export function useSyncedTimer(
  serverNow: number | undefined | null,
  endTime: number | undefined | null
): number | null {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (
      typeof serverNow !== "number" ||
      typeof endTime !== "number"
    ) {
      setTimeLeft(null);
      return;
    }

    // How far off the local clock is vs server (ms). If server is 10:00:05 and client 10:00:00, drift = +5000.
    const drift = serverNow - Date.now();

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const update = () => {
      const correctedNow = Date.now() + drift;
      const diff = Math.max(0, Math.floor((endTime - correctedNow) / 1000));
      setTimeLeft(diff);
      if (diff === 0 && intervalId != null) clearInterval(intervalId);
    };

    update();
    intervalId = setInterval(update, 100);

    return () => {
      if (intervalId != null) clearInterval(intervalId);
    };
  }, [serverNow, endTime]);

  return timeLeft;
}
