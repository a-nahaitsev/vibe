import { ThemeProvider } from "./_components/ThemeProvider";
import { QuizNav } from "./_components/QuizNav";

export default function FootballQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <QuizNav />
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </div>
    </ThemeProvider>
  );
}
