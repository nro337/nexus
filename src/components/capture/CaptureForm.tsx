import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useResourceStore } from "../../store/useResourceStore";
import { TagCombobox } from "./TagCombobox";
import { WikilinkTextarea } from "../ui/WikilinkTextarea";
import { extractUrlMetadata, detectSource } from "../../lib/metadata";
import { syncWikilinkConnections } from "../../lib/wikilinks";
import type { ResourceType, SourcePlatform } from "../../types";

interface CaptureFormProps {
  initialUrl?: string;
  initialTitle?: string;
  initialContent?: string;
  onSaved?: () => void;
}

export function CaptureForm({ initialUrl, initialTitle, initialContent, onSaved }: CaptureFormProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState(initialUrl || "");
  const [title, setTitle] = useState(initialTitle || "");
  const [content, setContent] = useState(initialContent || "");
  const [type, setType] = useState<ResourceType>("link");
  const [source, setSource] = useState<SourcePlatform>("web");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);

  const addResource = useResourceStore((s) => s.addResource);

  const handleUrlBlur = async () => {
    if (!url.trim()) return;
    setFetchingMeta(true);
    try {
      const detected = detectSource(url);
      setSource(detected as SourcePlatform);

      const meta = await extractUrlMetadata(url);
      if (!title) setTitle(meta.title);
      if (meta.description && !content) setContent(meta.description);
      if (meta.thumbnail) setThumbnail(meta.thumbnail);
    } catch {
      // fallback — keep what user typed
    }
    setFetchingMeta(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const resource = await addResource({ title, url: url || undefined, content, type, source, thumbnail }, tagIds);
      await syncWikilinkConnections(resource.id, content);
      // Reset
      setUrl("");
      setTitle("");
      setContent("");
      setType("link");
      setSource("web");
      setTagIds([]);
      setThumbnail(undefined);
      onSaved?.();
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
  ];

  const sourceOptions: { value: SourcePlatform; label: string }[] = [
    { value: "web", label: t("sources.web") },
    { value: "reddit", label: t("sources.reddit") },
    { value: "twitter", label: t("sources.twitter") },
    { value: "bluesky", label: t("sources.bluesky") },
    { value: "notion", label: t("sources.notion") },
    { value: "youtube", label: t("sources.youtube") },
    { value: "github", label: t("sources.github") },
    { value: "manual", label: t("sources.manual") },
    { value: "other", label: t("sources.other") },
  ];

  return (
    <div className="space-y-4">
      {/* URL */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
          {t("capture.url")} {fetchingMeta && <span className="ml-1 opacity-60">({t("capture.fetchingMeta")})</span>}
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlBlur}
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

      {/* Content / Snippet */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
          {t("capture.contentLabel")}
        </label>
        <WikilinkTextarea
          value={content}
          onChange={setContent}
          placeholder={t("capture.contentPlaceholder") + " (type [[ to link a resource)"}
          rows={4}
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

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!title.trim() || saving}
        className="nexus-btn nexus-btn-primary w-full"
        style={{ opacity: !title.trim() || saving ? 0.5 : 1 }}
      >
        {saving ? t("capture.saving") : t("capture.save")}
      </button>
    </div>
  );
}
