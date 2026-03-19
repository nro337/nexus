import { describe, it, expect, beforeEach, vi } from "vitest";

// Mocks must be declared before imports that use them
const localStorageMock = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

vi.mock("../src/i18n", async () => {
  const actual = await vi.importActual<typeof import("../src/i18n")>("../src/i18n");
  return {
    ...actual,
    default: {
      changeLanguage: vi.fn().mockResolvedValue(undefined),
    },
  };
});

import { SUPPORTED_LANGUAGES } from "../src/i18n";
import { useLanguageStore } from "../src/store/useLanguageStore";

describe("useLanguageStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset store state between tests
    useLanguageStore.setState({ language: "en" });
  });

  it("defaults to English when no stored preference", () => {
    const { language } = useLanguageStore.getState();
    expect(language).toBe("en");
  });

  it("setLanguage updates the store state", () => {
    useLanguageStore.getState().setLanguage("es");
    expect(useLanguageStore.getState().language).toBe("es");
  });

  it("setLanguage persists language to localStorage", () => {
    useLanguageStore.getState().setLanguage("fr");
    expect(localStorage.getItem("nexus-language")).toBe("fr");
  });

  it("setLanguage sets document lang attribute", () => {
    useLanguageStore.getState().setLanguage("de");
    expect(document.documentElement.lang).toBe("de");
  });

  it("setLanguage sets document dir=rtl for Arabic", () => {
    useLanguageStore.getState().setLanguage("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("setLanguage sets document dir=ltr for non-RTL languages", () => {
    useLanguageStore.getState().setLanguage("ar");
    useLanguageStore.getState().setLanguage("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("SUPPORTED_LANGUAGES contains English and Arabic", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("ar");
  });

  it("SUPPORTED_LANGUAGES marks Arabic as RTL", () => {
    const ar = SUPPORTED_LANGUAGES.find((l) => l.code === "ar");
    expect(ar?.dir).toBe("rtl");
  });

  it("SUPPORTED_LANGUAGES marks English as LTR", () => {
    const en = SUPPORTED_LANGUAGES.find((l) => l.code === "en");
    expect(en?.dir).toBe("ltr");
  });
});
