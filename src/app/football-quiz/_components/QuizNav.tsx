"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

const NAV_LINKS = [
  { href: "/football-quiz", label: "Home" },
  { href: "/football-quiz/daily", label: "Daily" },
  { href: "/football-quiz/time-attack", label: "Time Attack" },
  { href: "/football-quiz/who-am-i", label: "Who Am I?" },
  { href: "/football-quiz/photo-quiz", label: "Photo Quiz" },
  { href: "/football-quiz/career-path", label: "Career Path" },
  { href: "/football-quiz/match-history", label: "Match History" },
  { href: "/football-quiz/league", label: "League" },
  { href: "/football-quiz/transfer", label: "Transfer" },
  { href: "/football-quiz/leaderboards", label: "Leaderboards" },
  { href: "/football-quiz/leagues", label: "Leagues" },
  { href: "/football-quiz/duel", label: "1v1 Duel" },
  { href: "/football-quiz/prediction", label: "Prediction" },
  { href: "/football-quiz/profile", label: "Profile" },
  { href: "/football-quiz/settings", label: "Settings" },
] as const;

export function QuizNav() {
  const pathname = usePathname();
  const { effectiveTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link
          href="/football-quiz"
          className="text-lg font-bold text-emerald-600 dark:text-emerald-400"
        >
          <span role="img" aria-label="Soccer ball">⚽</span> Football Quiz
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  "rounded px-2 py-1 text-sm font-medium transition-colors " +
                  (isActive
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100")
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          aria-label={effectiveTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {effectiveTheme === "dark" ? <><span role="img" aria-label="Sun">☀️</span> Light</> : <><span role="img" aria-label="Moon">🌙</span> Dark</>}
        </button>
      </div>
    </header>
  );
}
