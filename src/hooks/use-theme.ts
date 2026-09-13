import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "utilityhub.theme";

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function initial(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(KEY) as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  // A tool people keep open beside an editor should match that editor's habit.
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    apply(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return { theme, toggle, setTheme };
}

/** Applied before React mounts so the first paint is already the right theme. */
export function bootstrapTheme() {
  apply(initial());
}
