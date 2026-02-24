import Link from "next/link";

const MODES = [
  {
    href: "/football-quiz/daily",
    title: "Daily 5-Question Challenge",
    desc: "5 questions every day, global leaderboard, streak system.",
    icon: "📅",
  },
  {
    href: "/football-quiz/time-attack",
    title: "Time Attack Mode",
    desc: "60 seconds — answer as many questions as possible, combo multiplier.",
    icon: "⏱️",
  },
  {
    href: "/football-quiz/who-am-i",
    title: "Who Am I?",
    desc: "Guess the player from textual clues.",
    icon: "🎭",
  },
  {
    href: "/football-quiz/photo-quiz",
    title: "Guess the Player From Photo",
    desc: "Blurred/cropped images gradually revealed.",
    icon: "📷",
  },
  {
    href: "/football-quiz/career-path",
    title: "Career Path Guessing",
    desc: "Guess players from club timeline history.",
    icon: "📈",
  },
  {
    href: "/football-quiz/match-history",
    title: "Match History Mode",
    desc: "Questions about past matches and events.",
    icon: "🏆",
  },
  {
    href: "/football-quiz/league",
    title: "League-Specific Mode",
    desc: "Choose a league (Premier League, La Liga, UCL, World Cup, etc.).",
    icon: "🌍",
  },
  {
    href: "/football-quiz/transfer",
    title: "Transfer Rumor Mode",
    desc: "Questions about transfers, fees, and records.",
    icon: "💰",
  },
] as const;

const SOCIAL = [
  { href: "/football-quiz/leaderboards", title: "Leaderboards", icon: "🏅" },
  { href: "/football-quiz/leagues", title: "Private Leagues", icon: "👥" },
  { href: "/football-quiz/duel", title: "1v1 Duel", icon: "⚔️" },
  { href: "/football-quiz/prediction", title: "Prediction Mode", icon: "🔮" },
] as const;

export default function FootballQuizHome() {
  return (
    <main className="space-y-10">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← Back to Welcome
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Football Quiz & Trivia
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Play daily challenges, time attack, who-am-I, photo quiz, career path, match history, and more.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-zinc-800 dark:text-zinc-200">
          Gameplay Modes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map(({ href, title, desc, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-600"
            >
              <span className="text-3xl">{icon}</span>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-zinc-800 dark:text-zinc-200">
          Social & Competitive
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOCIAL.map(({ href, title, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-600"
            >
              <span className="text-2xl">{icon}</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-4">
        <Link
          href="/football-quiz/profile"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          Profile
        </Link>
        <Link
          href="/football-quiz/settings"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600 dark:bg-zinc-800"
        >
          Settings
        </Link>
      </section>
    </main>
  );
}
