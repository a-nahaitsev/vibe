const STORAGE_KEY = "vibe-theme";

function getInitialThemeScript(): string {
  return `
(function() {
  var stored = localStorage.getItem("${STORAGE_KEY}");
  var dark = false;
  if (stored === "dark") dark = true;
  else if (stored === "light") dark = false;
  else dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
})();
`.trim();
}

/** Inline script that runs before paint to set .dark on html from localStorage + system preference. */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: getInitialThemeScript() }}
      suppressHydrationWarning
    />
  );
}
