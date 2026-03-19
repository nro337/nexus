import { useTranslation } from "react-i18next";
import { useSearchStore } from "../../store/useSearchStore";
import { useThemeStore } from "../../store/useThemeStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { SUPPORTED_LANGUAGES } from "../../i18n";
import type { PageId } from "../../App";

interface HeaderProps {
  onQuickCapture: () => void;
  currentPage: PageId;
}

export function Header({ onQuickCapture, currentPage }: HeaderProps) {
  const { t } = useTranslation();
  const { query, setQuery } = useSearchStore();
  const { theme, toggleTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();

  const pageTitles: Record<PageId, string> = {
    dashboard: t("nav.dashboard"),
    resources: t("nav.resources"),
    graph: t("nav.graph"),
    capture: t("nav.capture"),
    settings: t("nav.settings"),
  };

  return (
    <header
      className="h-14 shrink-0 flex items-center justify-between px-6 border-b"
      style={{ borderColor: "var(--color-nexus-border)", background: "var(--color-nexus-surface)" }}
    >
      <h1 className="text-base font-semibold" style={{ color: "var(--color-nexus-text)" }}>
        {pageTitles[currentPage]}
      </h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={t("header.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="nexus-input w-64 pl-8 text-sm"
          />
          <span
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--color-nexus-text-muted)" }}
          >
            ⌕
          </span>
        </div>

        {/* Quick capture button */}
        <button onClick={onQuickCapture} className="nexus-btn nexus-btn-primary text-sm">
          <span className="text-lg leading-none">+</span> {t("header.captureButton")}
        </button>

        {/* Language selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as typeof language)}
          aria-label={t("header.languageSelector")}
          title={t("header.languageSelector")}
          className="nexus-btn nexus-btn-ghost text-sm"
          style={{ cursor: "pointer" }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="nexus-btn nexus-btn-ghost text-sm"
          aria-label={theme === "dark" ? t("header.switchToLight") : t("header.switchToDark")}
          title={theme === "dark" ? t("header.switchToLight") : t("header.switchToDark")}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}
