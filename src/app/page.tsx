import Link from "next/link";

const EXAMPLE_LINKS = [
  { href: "/zod-example", label: "Zod example" },
  { href: "/yup-example", label: "Yup example" },
  { href: "/joi-example", label: "Joi example" },
  { href: "/react-hook-form-example", label: "React Hook Form example" },
  { href: "/tanstack-query-example", label: "TanStack Query example" },
  { href: "/tanstack-table-example", label: "TanStack Table example" },
  { href: "/tanstack-ai-example", label: "TanStack AI example" },
  // { href: "/football-quiz", label: "Football Quiz & Trivia" }, // temporary commented
  { href: "/whoami", label: "Who Am I? (Multiplayer)" },
  { href: "/standings-draft", label: "Standings Draft (Multiplayer)" },
] as const;

// Temporary: only show Standings Draft on the welcome page
const VISIBLE_LINKS = EXAMPLE_LINKS.filter(
  (link) => link.href === "/standings-draft"
);

const linkClassName =
  "rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Welcome
      </h1>
      <div className="flex flex-wrap justify-center gap-3">
        {VISIBLE_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className={linkClassName}>
            {label}
          </Link>
        ))}
      </div>
    </main>
  );
}
