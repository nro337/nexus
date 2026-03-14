import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";

describe("useThemeStore", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark", "light");
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
});

