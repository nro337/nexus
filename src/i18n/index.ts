import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import pt from "./locales/pt.json";
import ja from "./locales/ja.json";
import zh from "./locales/zh.json";
import ar from "./locales/ar.json";
import it from "./locales/it.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "ja", label: "日本語", dir: "ltr" },
  { code: "zh", label: "中文", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export function getStoredLanguage(): LanguageCode {
  const stored = localStorage.getItem("nexus-language");
  if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
    return stored as LanguageCode;
  }
  // Detect browser language
  const browserLang = navigator.language.split("-")[0];
  const match = SUPPORTED_LANGUAGES.find((l) => l.code === browserLang);
  return match ? match.code : "en";
}

export function applyLanguage(code: LanguageCode): void {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  if (!lang) return;
  document.documentElement.lang = code;
  document.documentElement.dir = lang.dir;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    pt: { translation: pt },
    ja: { translation: ja },
    zh: { translation: zh },
    ar: { translation: ar },
    it: { translation: it },
  },
  lng: getStoredLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Apply initial language attributes
applyLanguage(getStoredLanguage());

export default i18n;
