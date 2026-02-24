"use client";

export interface AnswerOptionsProps {
  options: string[];
  selectedIndex: number | null;
  correctIndex: number | null;
  showResult: boolean;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function AnswerOptions({
  options,
  selectedIndex,
  correctIndex,
  showResult,
  onSelect,
  disabled = false,
}: AnswerOptionsProps) {
  return (
    <ul className="mt-4 space-y-2">
      {options.map((option, index) => {
        let stateClass = "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-zinc-500";
        if (showResult) {
          if (index === correctIndex) {
            stateClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-500";
          } else if (index === selectedIndex && selectedIndex !== correctIndex) {
            stateClass = "border-red-400 bg-red-50 dark:bg-red-900/30 dark:border-red-400";
          }
        } else if (selectedIndex === index) {
          stateClass = "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-400";
        }

        return (
          <li key={index}>
            <button
              type="button"
              onClick={() => !disabled && onSelect(index)}
              disabled={disabled}
              className={
                "w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition " +
                stateClass +
                (disabled ? " cursor-not-allowed opacity-80" : " cursor-pointer")
              }
            >
              {option}
              {showResult && index === correctIndex && " ✓"}
              {showResult && index === selectedIndex && index !== correctIndex && " ✗"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
