import { create } from "zustand";
import type { CustomThemeColors } from "../lib/colorUtils";

export type ThemeId = "dark" | "light" | "forest" | "ocean" | "sunset" | "lavender" | "custom";

// Backward-compat alias
export type Theme = ThemeId;

export type { CustomThemeColors };

export interface PredefinedTheme {
  id: ThemeId;
  label: string;
  /** Representative preview colors for the theme swatch */
  preview: { bg: string; surface: string; accent: string; text: string };
}

export const PREDEFINED_THEMES: PredefinedTheme[] = [
  {
    id: "dark",
    label: "Dark",
    preview: { bg: "#0c0e14", surface: "#151821", accent: "#6c8cff", text: "#e2e4ea" },
  },
  {
    id: "light",
    label: "Light",
    preview: { bg: "#f4f5f7", surface: "#ffffff", accent: "#4f6ef7", text: "#1a1d27" },
  },
  {
    id: "forest",
    label: "Forest",
    preview: { bg: "#0b1209", surface: "#111f0e", accent: "#4caf6c", text: "#d4e8cc" },
  },
  {
    id: "ocean",
    label: "Ocean",
    preview: { bg: "#090e16", surface: "#0e1929", accent: "#38aadc", text: "#c8e0f5" },
  },
  {
    id: "sunset",
    label: "Sunset",
    preview: { bg: "#100d08", surface: "#1c1509", accent: "#ef8c38", text: "#f0dcc8" },
  },
  {
    id: "lavender",
    label: "Lavender",
    preview: { bg: "#f2f0ff", surface: "#faf9ff", accent: "#7c5cef", text: "#28204a" },
  },
];

const VALID_THEME_IDS: ThemeId[] = [
  ...PREDEFINED_THEMES.map((t) => t.id),
  "custom" as const,
];

const CUSTOM_COLORS_KEY = "nexus-custom-theme";

// Maps CustomThemeColors keys to the CSS custom properties defined in src/index.css @theme block.
// Keep these in sync with the variable names in index.css.
const CSS_VAR_MAP: Record<keyof CustomThemeColors, string> = {
  bg: "--color-nexus-bg",
  surface: "--color-nexus-surface",
  surfaceHover: "--color-nexus-surface-hover",
  border: "--color-nexus-border",
  text: "--color-nexus-text",
  textMuted: "--color-nexus-text-muted",
  accent: "--color-nexus-accent",
  accentHover: "--color-nexus-accent-hover",
  danger: "--color-nexus-danger",
};

function getInitialTheme(): ThemeId {
  const stored = localStorage.getItem("nexus-theme");
  if (stored && VALID_THEME_IDS.includes(stored as ThemeId)) return stored as ThemeId;
  // Default to system preference, fall back to dark
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

function getStoredCustomColors(): CustomThemeColors | null {
  try {
    const stored = localStorage.getItem(CUSTOM_COLORS_KEY);
    if (stored) return JSON.parse(stored) as CustomThemeColors;
  } catch {
    // ignore malformed data
  }
  return null;
}

export function applyTheme(theme: ThemeId, customColors?: CustomThemeColors | null): void {
  const root = document.documentElement;
  root.classList.remove(...VALID_THEME_IDS);
  root.classList.add(theme);

  // Clear any previously applied inline custom vars
  Object.values(CSS_VAR_MAP).forEach((v) => root.style.removeProperty(v));

  // For custom themes, apply colors directly as inline CSS variables
  if (theme === "custom" && customColors) {
    (Object.entries(CSS_VAR_MAP) as [keyof CustomThemeColors, string][]).forEach(
      ([key, cssVar]) => {
        const value = customColors[key];
        if (value) root.style.setProperty(cssVar, value);
      },
    );
  }
}

const initialTheme = getInitialTheme();
const initialCustomColors = initialTheme === "custom" ? getStoredCustomColors() : null;
applyTheme(initialTheme, initialCustomColors);

interface ThemeState {
  theme: ThemeId;
  customColors: CustomThemeColors | null;
  setTheme: (theme: ThemeId, customColors?: CustomThemeColors) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  customColors: initialCustomColors,
  setTheme: (theme: ThemeId, customColors?: CustomThemeColors) => {
    applyTheme(theme, customColors ?? null);
    localStorage.setItem("nexus-theme", theme);
    if (theme === "custom" && customColors) {
      localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(customColors));
    }
    set({ theme, customColors: customColors ?? null });
  },
  toggleTheme: () =>
    set((state) => {
      const next: ThemeId = state.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("nexus-theme", next);
      return { theme: next, customColors: null };
    }),
}));
