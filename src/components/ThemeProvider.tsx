"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";

const ThemeContext = createContext<{
  theme: Theme;
  effectiveTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
} | null>(null);

const STORAGE_KEY = "vibe-theme";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "dark" || stored === "light" || stored === "system")
    return stored;
  return "system";
}

function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getEffectiveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return prefersDark() ? "dark" : "light";
  return theme;
}

function applyTheme(effective: "light" | "dark") {
  document.documentElement.classList.toggle("dark", effective === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setThemeState(getStoredTheme());
      setMounted(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const effectiveTheme = theme === "system" && mounted
    ? prefersDark()
      ? "dark"
      : "light"
    : theme === "system"
      ? "light"
      : theme;

  useEffect(() => {
    if (!mounted) return;
    applyTheme(effectiveTheme);
  }, [effectiveTheme, mounted]);

  useEffect(() => {
    if (!mounted || theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [theme, mounted]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, t);
      applyTheme(getEffectiveTheme(t));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const effective = getEffectiveTheme(prev);
      const next: Theme = effective === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
      }
      return next;
    });
  }, []);

  const value =
    mounted
      ? {
          theme,
          effectiveTheme: getEffectiveTheme(theme),
          setTheme,
          toggleTheme,
        }
      : {
          theme: "system" as Theme,
          effectiveTheme: "light" as const,
          setTheme,
          toggleTheme,
        };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
