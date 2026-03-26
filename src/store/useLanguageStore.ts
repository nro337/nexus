import { create } from "zustand";
import i18n, { applyLanguage, getStoredLanguage, type LanguageCode } from "../i18n";

interface LanguageState {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getStoredLanguage(),
  setLanguage: (code: LanguageCode) => {
    applyLanguage(code);
    localStorage.setItem("nexus-language", code);
    i18n.changeLanguage(code);
    set({ language: code });
  },
}));
