import Link from "next/link";
import { MOCK_LEAGUES } from "../_lib/mock-data";

export default function LeaguesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/football-quiz" className="text-sm text-zinc-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Private Leagues
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Create or join leagues for friends, office, or university. Weekly leaderboards.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_LEAGUES.map((league) => (
          <div
            key={league.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {league.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {league.memberCount} members
            </p>
            <p className="mt-2 font-mono text-sm text-zinc-600 dark:text-zinc-300">
              Invite: {league.inviteCode}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-600">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Create league · Join with code
        </p>
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          Wire to Supabase/Firebase for real leagues and weekly scores.
        </p>
      </div>
    </div>
  );
}
