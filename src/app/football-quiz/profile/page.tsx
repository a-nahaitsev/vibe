import Link from "next/link";
import { StreakBadge } from "@/components/quiz";

export default function ProfilePage() {
  const displayName = "Guest";
  const streak = 3;
  const totalScore = 1250;
  const favoriteClub = "Manchester United";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/football-quiz" className="text-sm text-zinc-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Profile
      </h1>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl dark:bg-emerald-900/50">
            <span role="img" aria-label="User">👤</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {displayName}
            </h2>
            <StreakBadge streak={streak} text={`${streak} day streak`} className="mt-1" />
          </div>
        </div>
        <dl className="mt-6 grid gap-2 sm:grid-cols-2">
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">Total score</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">{totalScore}</dd>
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">Favorite club</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">{favoriteClub}</dd>
        </dl>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Sign in with Supabase Auth or Firebase to persist profile, avatar, and achievements.
        </p>
      </div>
    </div>
  );
}
