import { useState } from "react";
import { useResourceStore } from "../../store/useResourceStore";
import { TagCombobox } from "./TagCombobox";
import { WikilinkTextarea } from "../ui/WikilinkTextarea";
import { extractUrlMetadata, detectSource } from "../../lib/metadata";
import { syncWikilinkConnections } from "../../lib/wikilinks";
import type { ResourceType, SourcePlatform } from "../../types";
import { RESOURCE_TYPE_LABELS, SOURCE_LABELS } from "../../lib/utils";

interface CaptureFormProps {
  initialUrl?: string;
  initialTitle?: string;
  initialContent?: string;
  onSaved?: () => void;
}

export function CaptureForm({ initialUrl, initialTitle, initialContent, onSaved }: CaptureFormProps) {
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

  return (
    <div className="space-y-4">
      {/* URL */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
          URL {fetchingMeta && <span className="ml-1 opacity-60">(fetching...)</span>}
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlBlur}
          placeholder="https://..."
          className="nexus-input"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
          Title <span style={{ color: "var(--color-nexus-danger)" }}>*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resource title"
          className="nexus-input"
        />
      </div>

      {/* Content / Snippet */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
          Content / Notes
        </label>
        <WikilinkTextarea
          value={content}
          onChange={setContent}
          placeholder="Paste a snippet, write notes, or leave blank... (type [[ to link a resource)"
          rows={4}
        />
      </div>

      {/* Type + Source row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ResourceType)}
            className="nexus-input"
          >
            {Object.entries(RESOURCE_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
            Source
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as SourcePlatform)}
            className="nexus-input"
          >
            {Object.entries(SOURCE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
          Tags
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
        {saving ? "Saving..." : "Save to Nexus"}
      </button>
    </div>
  );
}
