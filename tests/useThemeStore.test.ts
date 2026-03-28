import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";

describe("useThemeStore", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove(
      "dark",
      "light",
      "forest",
      "ocean",
      "sunset",
      "lavender",
      "custom",
    );
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to dark when no stored value and no system light preference", async () => {
    vi.stubGlobal("window", {
      ...window,
      matchMedia: () => ({ matches: false }),
    });
    const { useThemeStore } = await import("../src/store/useThemeStore");
    expect(useThemeStore.getState().theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("defaults to light when system prefers light and no stored value", async () => {
    vi.stubGlobal("window", {
      ...window,
      matchMedia: () => ({ matches: true }),
    });
    const { useThemeStore } = await import("../src/store/useThemeStore");
    expect(useThemeStore.getState().theme).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("uses stored value from localStorage over system preference", async () => {
    localStorage.setItem("nexus-theme", "dark");
    vi.stubGlobal("window", {
      ...window,
      matchMedia: () => ({ matches: true }),
    });
    const { useThemeStore } = await import("../src/store/useThemeStore");
    expect(useThemeStore.getState().theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggleTheme switches from dark to light and persists", async () => {
    vi.stubGlobal("window", {
      ...window,
      matchMedia: () => ({ matches: false }),
    });
    const { useThemeStore } = await import("../src/store/useThemeStore");
    expect(useThemeStore.getState().theme).toBe("dark");

    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe("light");
    expect(localStorage.getItem("nexus-theme")).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggleTheme switches from light to dark and persists", async () => {
    localStorage.setItem("nexus-theme", "light");
    vi.stubGlobal("window", {
      ...window,
      matchMedia: () => ({ matches: false }),
    });
    const { useThemeStore } = await import("../src/store/useThemeStore");
    expect(useThemeStore.getState().theme).toBe("light");

    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe("dark");
    expect(localStorage.getItem("nexus-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("setTheme applies a predefined theme and persists", async () => {
    vi.stubGlobal("window", {
      ...window,
      matchMedia: () => ({ matches: false }),
    });
    const { useThemeStore } = await import("../src/store/useThemeStore");

    useThemeStore.getState().setTheme("forest");

    expect(useThemeStore.getState().theme).toBe("forest");
    expect(localStorage.getItem("nexus-theme")).toBe("forest");
    expect(document.documentElement.classList.contains("forest")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("setTheme restores stored predefined theme on load", async () => {
    localStorage.setItem("nexus-theme", "ocean");
    vi.stubGlobal("window", {
      ...window,
      matchMedia: () => ({ matches: false }),
    });
    const { useThemeStore } = await import("../src/store/useThemeStore");
    expect(useThemeStore.getState().theme).toBe("ocean");
    expect(document.documentElement.classList.contains("ocean")).toBe(true);
  });

  it("setTheme with custom colors applies inline CSS variables", async () => {
    vi.stubGlobal("window", {
      ...window,
      matchMedia: () => ({ matches: false }),
    });
    const { useThemeStore } = await import("../src/store/useThemeStore");
    const customColors = {
      bg: "#111111",
      surface: "#222222",
      surfaceHover: "#333333",
      border: "#444444",
      text: "#eeeeee",
      textMuted: "#999999",
      accent: "#ff0000",
      accentHover: "#ff4444",
      danger: "#cc0000",
    };

    useThemeStore.getState().setTheme("custom", customColors);

    expect(useThemeStore.getState().theme).toBe("custom");
    expect(localStorage.getItem("nexus-theme")).toBe("custom");
    expect(document.documentElement.classList.contains("custom")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--color-nexus-bg")).toBe("#111111");
    expect(document.documentElement.style.getPropertyValue("--color-nexus-accent")).toBe("#ff0000");
    // Stored custom colors should be retrievable from the store
    expect(useThemeStore.getState().customColors).toEqual(customColors);
  });

  it("switching away from custom theme clears inline CSS variables", async () => {
    vi.stubGlobal("window", {
      ...window,
      matchMedia: () => ({ matches: false }),
    });
    const { useThemeStore } = await import("../src/store/useThemeStore");
    const customColors = {
      bg: "#111111",
      surface: "#222222",
      surfaceHover: "#333333",
      border: "#444444",
      text: "#eeeeee",
      textMuted: "#999999",
      accent: "#ff0000",
      accentHover: "#ff4444",
      danger: "#cc0000",
    };

    useThemeStore.getState().setTheme("custom", customColors);
    expect(document.documentElement.style.getPropertyValue("--color-nexus-bg")).toBe("#111111");

    useThemeStore.getState().setTheme("dark");
    expect(document.documentElement.style.getPropertyValue("--color-nexus-bg")).toBe("");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("custom")).toBe(false);
  });

  it("PREDEFINED_THEMES includes expected theme ids", async () => {
    const { PREDEFINED_THEMES } = await import("../src/store/useThemeStore");
    const ids = PREDEFINED_THEMES.map((t) => t.id);
    expect(ids).toContain("dark");
    expect(ids).toContain("light");
    expect(ids).toContain("forest");
    expect(ids).toContain("ocean");
    expect(ids).toContain("sunset");
    expect(ids).toContain("lavender");
  });
});

