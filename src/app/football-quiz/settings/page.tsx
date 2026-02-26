"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { theme, effectiveTheme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/football-quiz" className="text-sm text-zinc-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Settings
      </h1>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-200">Appearance</h3>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={
              "rounded-lg border px-4 py-2 text-sm font-medium " +
              (theme === "light" || (theme === "system" && effectiveTheme === "light")
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-200"
                : "border-zinc-300 dark:border-zinc-600")
            }
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={
              "rounded-lg border px-4 py-2 text-sm font-medium " +
              (theme === "dark" || (theme === "system" && effectiveTheme === "dark")
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-200"
                : "border-zinc-300 dark:border-zinc-600")
            }
          >
            Dark
          </button>
        </div>
        <h3 className="mt-6 font-medium text-zinc-800 dark:text-zinc-200">Other</h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Notifications, premium quiz packs, avatar customization, and ad preferences can be wired here (e.g. Supabase/Firebase).
        </p>
      </div>
    </div>
  );
}
