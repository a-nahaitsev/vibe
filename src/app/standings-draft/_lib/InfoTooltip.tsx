"use client";

import { useCallback, useRef, useState } from "react";
import { useClickOutside } from "./useClickOutside";
import { cn } from "@/lib/utils";

const POPOVER_CLASS =
  "absolute left-0 top-full z-10 mt-1 min-w-[200px] max-w-[280px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 shadow-lg dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

type InfoTooltipProps = {
  /** Clickable trigger (e.g. icon). */
  trigger: React.ReactNode;
  /** Content shown in the popover when open. */
  content: React.ReactNode;
  /** Accessible label for the trigger button. */
  ariaLabel: string;
  /** Optional class for the wrapper. */
  className?: string;
};

/**
 * Click-to-toggle tooltip. Opens on trigger click, closes on trigger click again or click outside.
 */
export function InfoTooltip({
  trigger,
  content,
  ariaLabel,
  className = "",
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded p-0.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200"
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && <div className={POPOVER_CLASS}>{content}</div>}
    </div>
  );
}
