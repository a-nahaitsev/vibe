import Link from "next/link";

export default function PredictionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/football-quiz" className="text-sm text-zinc-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Prediction Hybrid Mode
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Mix quiz questions with score predictions for upcoming matches.
      </p>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Upcoming fixtures and prediction form will go here. Wire to a fixtures API and store predictions in Supabase/Firebase.
        </p>
        <ul className="mt-4 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-300">
          <li>Quiz round: 5 trivia questions</li>
          <li>Prediction round: predict score for 3 upcoming matches</li>
          <li>Combined scoring: quiz points + prediction accuracy</li>
        </ul>
      </div>
    </div>
  );
}
