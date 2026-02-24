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
] as const;

const linkClassName =
  "rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <div className="flex flex-wrap justify-center gap-3">
        {EXAMPLE_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className={linkClassName}>
            {label}
          </Link>
        ))}
      </div>
    </main>
  );
}
