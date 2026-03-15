import { useState } from "react";
import { updateTag } from "../../db/tags";
import type { Tag } from "../../types";

const PRESET_COLORS = [
  "hsl(220, 70%, 65%)",
  "hsl(260, 70%, 65%)",
  "hsl(300, 70%, 65%)",
  "hsl(340, 70%, 65%)",
  "hsl(10, 70%, 65%)",
  "hsl(30, 70%, 65%)",
  "hsl(50, 70%, 65%)",
  "hsl(80, 70%, 65%)",
  "hsl(140, 70%, 65%)",
  "hsl(170, 70%, 65%)",
  "hsl(190, 70%, 65%)",
  "hsl(205, 70%, 65%)",
];

const DEFAULT_CUSTOM_COLOR = "#6c8cff";

interface TagEditModalProps {
  tag: Tag;
  onClose: () => void;
}

export function TagEditModal({ tag, onClose }: TagEditModalProps) {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Tag name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateTag(tag.id, { name: name.trim(), color });
      onClose();
    } catch {
      setError("Failed to save tag. The name may already be in use.");
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
        className="relative w-full max-w-sm rounded-2xl border shadow-2xl p-6"
        style={{
          background: "var(--color-nexus-surface)",
          borderColor: "var(--color-nexus-border)",
          animation: "modalIn 0.15s ease-out",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: "var(--color-nexus-text)" }}>
            Edit Tag
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-sm transition-colors"
            style={{ color: "var(--color-nexus-text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-nexus-surface-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-nexus-text-muted)" }}>
              Name <span style={{ color: "var(--color-nexus-danger)" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="tag-name"
              className="nexus-input"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") onClose();
              }}
              autoFocus
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-nexus-text-muted)" }}>
              Color
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  title={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-transform"
                  style={{
                    background: c,
                    outline: color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color.startsWith("#") ? color : DEFAULT_CUSTOM_COLOR}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                title="Custom color"
              />
              <span className="text-xs" style={{ color: "var(--color-nexus-text-muted)" }}>
                Custom color
              </span>
              <span
                className="nexus-tag ml-auto"
                style={{ borderColor: color, color }}
              >
                {name || tag.name}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-xs" style={{ color: "var(--color-nexus-danger)" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="nexus-btn nexus-btn-primary w-full"
            style={{ opacity: !name.trim() || saving ? 0.5 : 1 }}
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
