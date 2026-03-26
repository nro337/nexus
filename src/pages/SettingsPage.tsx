import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/schema";
import { deleteTag } from "../db/tags";
import { TagEditModal } from "../components/settings/TagEditModal";
import { useLanguageStore } from "../store/useLanguageStore";
import { useThemeStore } from "../store/useThemeStore";
import { SUPPORTED_LANGUAGES } from "../i18n";
import type { Tag } from "../types";

export function SettingsPage() {
  const { t } = useTranslation();
  const tags = useLiveQuery(() => db.tags.orderBy("name").toArray(), []) ?? [];
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { language, setLanguage } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleDelete = async (tag: Tag) => {
    setDeletingId(tag.id);
    setDeleteError(null);
    try {
      await deleteTag(tag.id);
    } catch {
      setDeleteError(t("errors.deleteTag", { name: tag.name }));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-nexus-text)" }}>
          {t("settings.title")}
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--color-nexus-text-muted)" }}>
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Language section */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-nexus-text)" }}>
          {t("settings.language")}
        </h3>
        <p className="text-xs mb-3" style={{ color: "var(--color-nexus-text-muted)" }}>
          {t("settings.languageSubtitle")}
        </p>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                lang={lang.code}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border"
                style={{
                  background: isActive ? "rgba(108, 140, 255, 0.12)" : "transparent",
                  borderColor: isActive ? "var(--color-nexus-accent)" : "var(--color-nexus-border)",
                  color: isActive ? "var(--color-nexus-accent)" : "var(--color-nexus-text-muted)",
                }}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Theme section */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-nexus-text)" }}>
          {t("settings.theme")}
        </h3>
        <p className="text-xs mb-3" style={{ color: "var(--color-nexus-text-muted)" }}>
          {t("settings.themeSubtitle")}
        </p>
        <button
          onClick={toggleTheme}
          className="nexus-btn nexus-btn-ghost text-sm"
        >
          {theme === "dark" ? "☀ " + t("header.switchToLight") : "☾ " + t("header.switchToDark")}
        </button>
      </section>

      {/* Tags section */}
      <section>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-nexus-text)" }}>
          {t("settings.tags")}
        </h3>

        {tags.length === 0 ? (
          <div
            className="nexus-card flex flex-col items-center justify-center py-12"
            style={{ borderStyle: "dashed" }}
          >
            <p className="text-sm" style={{ color: "var(--color-nexus-text-muted)" }}>
              {t("settings.noTags")}
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl border divide-y"
            style={{
              borderColor: "var(--color-nexus-border)",
              background: "var(--color-nexus-surface)",
            }}
          >
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                {/* Color dot */}
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: tag.color }}
                />

                {/* Tag chip */}
                <span
                  className="nexus-tag"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </span>

                {/* Spacer */}
                <span className="flex-1" />

                {/* Edit button */}
                <button
                  onClick={() => setEditingTag(tag)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{ color: "var(--color-nexus-text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-nexus-surface-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {t("settings.edit")}
                </button>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(tag)}
                  disabled={deletingId === tag.id}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{
                    color: "var(--color-nexus-danger)",
                    opacity: deletingId === tag.id ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(244,108,108,0.08)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {deletingId === tag.id ? t("settings.deleting") : t("settings.delete")}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {deleteError && (
        <p className="mt-3 text-xs" style={{ color: "var(--color-nexus-danger)" }}>
          {deleteError}
        </p>
      )}

      {editingTag && (
        <TagEditModal
          tag={editingTag}
          onClose={() => setEditingTag(null)}
        />
      )}
    </div>
  );
}
