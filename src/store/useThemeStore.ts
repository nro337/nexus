import { create } from "zustand";

export type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("nexus-theme");
  if (stored === "dark" || stored === "light") return stored;
  // Default to system preference, fall back to dark
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
}

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("nexus-theme", next);
      return { theme: next };
    }),
}));
