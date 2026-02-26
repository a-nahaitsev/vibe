"use client";

import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { effectiveTheme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      aria-label={effectiveTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={effectiveTheme === "dark" ? "Light mode" : "Dark mode"}
    >
      {effectiveTheme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
