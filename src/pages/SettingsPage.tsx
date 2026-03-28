import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/schema";
import { deleteTag } from "../db/tags";
import { TagEditModal } from "../components/settings/TagEditModal";
import { CustomThemeModal } from "../components/settings/CustomThemeModal";
import { useLanguageStore } from "../store/useLanguageStore";
import { useThemeStore, PREDEFINED_THEMES } from "../store/useThemeStore";
import { SUPPORTED_LANGUAGES } from "../i18n";
import type { Tag } from "../types";

export function SettingsPage() {
  const { t } = useTranslation();
  const tags = useLiveQuery(() => db.tags.orderBy("name").toArray(), []) ?? [];
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const { language, setLanguage } = useLanguageStore();
  const { theme, setTheme } = useThemeStore();

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

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {/* Predefined themes */}
          {PREDEFINED_THEMES.map((pt) => {
            const isActive = theme === pt.id;
            return (
              <button
                key={pt.id}
                onClick={() => setTheme(pt.id)}
                className="flex flex-col items-center gap-2 rounded-xl border p-2 transition-all duration-150"
                style={{
                  borderColor: isActive ? "var(--color-nexus-accent)" : "var(--color-nexus-border)",
                  background: isActive
                    ? "color-mix(in srgb, var(--color-nexus-accent) 8%, transparent)"
                    : "transparent",
                  boxShadow: isActive ? "0 0 0 1px var(--color-nexus-accent)" : "none",
                }}
                aria-label={pt.label}
                aria-pressed={isActive}
              >
                {/* Color swatch preview */}
                <div
                  className="w-full h-10 rounded-lg overflow-hidden flex"
                  style={{ background: pt.preview.bg }}
                >
                  {/* Surface strip */}
                  <div
                    className="w-1/2 h-full"
                    style={{ background: pt.preview.surface }}
                  />
                  {/* Accent dot */}
                  <div className="flex-1 flex items-center justify-center">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: pt.preview.accent }}
                    />
                  </div>
                </div>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isActive ? "var(--color-nexus-accent)" : "var(--color-nexus-text-muted)",
                  }}
                >
                  {pt.label}
                </span>
              </button>
            );
          })}

          {/* Custom theme button */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex flex-col items-center gap-2 rounded-xl border p-2 transition-all duration-150"
            style={{
              borderColor: theme === "custom" ? "var(--color-nexus-accent)" : "var(--color-nexus-border)",
              background: theme === "custom"
                ? "color-mix(in srgb, var(--color-nexus-accent) 8%, transparent)"
                : "transparent",
              boxShadow: theme === "custom" ? "0 0 0 1px var(--color-nexus-accent)" : "none",
            }}
            aria-label="Custom theme"
            aria-pressed={theme === "custom"}
          >
            {/* Rainbow / gradient preview */}
            <div
              className="w-full h-10 rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, #6c8cff 0%, #f46c6c 33%, #4caf6c 66%, #ef8c38 100%)",
              }}
            />
            <span
              className="text-xs font-medium"
              style={{
                color: theme === "custom" ? "var(--color-nexus-accent)" : "var(--color-nexus-text-muted)",
              }}
            >
              {t("settings.themeCustom")}
            </span>
          </button>
        </div>
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

      {showCustomModal && (
        <CustomThemeModal onClose={() => setShowCustomModal(false)} />
      )}
    </div>
  );
}
