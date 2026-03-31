import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useResourceStore } from "../../store/useResourceStore";
import { TagCombobox } from "../capture/TagCombobox";
import { WikilinkTextarea } from "../ui/WikilinkTextarea";
import { getResourceTags, setResourceTags } from "../../db/resources";
import { syncWikilinkConnections } from "../../lib/wikilinks";
import type { Resource, ResourceType, SourcePlatform } from "../../types";

interface EditResourceModalProps {
  resource: Resource;
  onClose: () => void;
}

export function EditResourceModal({ resource, onClose }: EditResourceModalProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState(resource.url || "");
  const [title, setTitle] = useState(resource.title);
  const [content, setContent] = useState(resource.content);
  const [type, setType] = useState<ResourceType>(resource.type);
  const [source, setSource] = useState<SourcePlatform>(resource.source);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const updateResource = useResourceStore((s) => s.updateResource);

  useEffect(() => {
    getResourceTags(resource.id).then(setTagIds).catch(() => {
      // fallback to empty tags on error
    });
  }, [resource.id]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateResource(resource.id, {
        title: title.trim(),
        url: url.trim() || undefined,
        content,
        type,
        source,
      });
      await setResourceTags(resource.id, tagIds);
      await syncWikilinkConnections(resource.id, content);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const resourceTypeOptions: { value: ResourceType; label: string }[] = [
    { value: "link", label: t("resourceTypes.link") },
    { value: "snippet", label: t("resourceTypes.snippet") },
    { value: "image", label: t("resourceTypes.image") },
    { value: "note", label: t("resourceTypes.note") },
    { value: "file", label: t("resourceTypes.file") },
    { value: "paper", label: t("resourceTypes.paper") },
  ];

  const sourceOptions: { value: SourcePlatform; label: string }[] = [
    { value: "web", label: t("sources.web") },
    { value: "reddit", label: t("sources.reddit") },
    { value: "twitter", label: t("sources.twitter") },
    { value: "bluesky", label: t("sources.bluesky") },
    { value: "notion", label: t("sources.notion") },
    { value: "youtube", label: t("sources.youtube") },
    { value: "github", label: t("sources.github") },
    { value: "doi", label: t("sources.doi") },
    { value: "arxiv", label: t("sources.arxiv") },
    { value: "manual", label: t("sources.manual") },
    { value: "other", label: t("sources.other") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl border shadow-2xl p-6"
        style={{
          background: "var(--color-nexus-surface)",
          borderColor: "var(--color-nexus-border)",
          animation: "modalIn 0.15s ease-out",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: "var(--color-nexus-text)" }}>
            {t("modal.editResource")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("modal.close")}
            className="w-7 h-7 rounded-md flex items-center justify-center text-sm transition-colors"
            style={{ color: "var(--color-nexus-text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-nexus-surface-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* URL */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
              {t("capture.url")}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("capture.urlPlaceholder")}
              className="nexus-input"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
              {t("capture.titleLabel")} <span style={{ color: "var(--color-nexus-danger)" }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("capture.titlePlaceholder")}
              className="nexus-input"
            />
          </div>

          {/* Content / Notes */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
              {t("capture.contentLabel")}
            </label>
            <WikilinkTextarea
              value={content}
              onChange={setContent}
              placeholder={t("capture.contentPlaceholder") + " (type [[ to link a resource)"}
              rows={4}
              excludeId={resource.id}
            />
          </div>

          {/* Type + Source row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
                {t("capture.typeLabel")}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ResourceType)}
                className="nexus-input"
              >
                {resourceTypeOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
                {t("capture.sourceLabel")}
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as SourcePlatform)}
                className="nexus-input"
              >
                {sourceOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
              {t("capture.tagsLabel")}
            </label>
            <TagCombobox selectedTagIds={tagIds} onChange={setTagIds} />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="nexus-btn nexus-btn-primary w-full"
            style={{ opacity: !title.trim() || saving ? 0.5 : 1 }}
          >
            {saving ? t("modal.saving") : t("modal.save")}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
