import Link from "next/link";
import { Leaderboard } from "@/components/quiz";
import { MOCK_LEADERBOARD } from "../_lib/mock-data";

export default function LeaderboardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/football-quiz" className="text-sm text-zinc-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Leaderboards
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Global ranking by total score. Streaks shown for daily challenge.
      </p>
      <Leaderboard
        entries={MOCK_LEADERBOARD}
        title="Global leaderboard"
        showStreak
      />
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Connect Supabase/Firebase to persist user scores and sync leaderboards in real time.
      </p>
    </div>
  );
}
