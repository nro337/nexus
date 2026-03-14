import { useState, useEffect } from "react";
import { useResourceStore } from "../../store/useResourceStore";
import { TagCombobox } from "../capture/TagCombobox";
import { getResourceTags, setResourceTags } from "../../db/resources";
import type { Resource, ResourceType, SourcePlatform } from "../../types";
import { RESOURCE_TYPE_LABELS, SOURCE_LABELS } from "../../lib/utils";

interface EditResourceModalProps {
  resource: Resource;
  onClose: () => void;
}

export function EditResourceModal({ resource, onClose }: EditResourceModalProps) {
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
      onClose();
    } finally {
      setSaving(false);
    }
  };

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
            Edit Resource
          </h2>
          <button
            onClick={onClose}
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
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
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

          {/* Content / Notes */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
              Content / Notes
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste a snippet, write notes, or leave blank..."
              rows={4}
              className="nexus-input resize-y"
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

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="nexus-btn nexus-btn-primary w-full"
            style={{ opacity: !title.trim() || saving ? 0.5 : 1 }}
          >
            {saving ? "Saving..." : "Save changes"}
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
