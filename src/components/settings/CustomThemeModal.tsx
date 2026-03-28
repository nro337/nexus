import { useState } from "react";
import { deriveThemeColors } from "../../lib/colorUtils";
import { useThemeStore } from "../../store/useThemeStore";
import type { CustomThemeColors } from "../../lib/colorUtils";

interface CustomThemeModalProps {
  onClose: () => void;
}

interface ColorField {
  key: "bg" | "surface" | "accent" | "text" | "danger";
  label: string;
  hint: string;
}

const COLOR_FIELDS: ColorField[] = [
  { key: "bg", label: "Background", hint: "Main page background" },
  { key: "surface", label: "Surface", hint: "Cards and panels" },
  { key: "accent", label: "Accent", hint: "Buttons and highlights" },
  { key: "text", label: "Text", hint: "Primary text color" },
  { key: "danger", label: "Danger", hint: "Errors and deletions" },
];

function getDefaultColors(existing: CustomThemeColors | null) {
  if (existing) {
    return {
      bg: existing.bg,
      surface: existing.surface,
      accent: existing.accent,
      text: existing.text,
      danger: existing.danger,
    };
  }
  return {
    bg: "#0c0e14",
    surface: "#151821",
    accent: "#6c8cff",
    text: "#e2e4ea",
    danger: "#f46c6c",
  };
}

export function CustomThemeModal({ onClose }: CustomThemeModalProps) {
  const { customColors, setTheme } = useThemeStore();
  const defaults = getDefaultColors(customColors);

  const [bg, setBg] = useState(defaults.bg);
  const [surface, setSurface] = useState(defaults.surface);
  const [accent, setAccent] = useState(defaults.accent);
  const [text, setText] = useState(defaults.text);
  const [danger, setDanger] = useState(defaults.danger);

  const setters: Record<string, (v: string) => void> = {
    bg: setBg,
    surface: setSurface,
    accent: setAccent,
    text: setText,
    danger: setDanger,
  };

  const values: Record<string, string> = { bg, surface, accent, text, danger };

  const derived: CustomThemeColors = deriveThemeColors(bg, surface, accent, text, danger);

  const handleApply = () => {
    setTheme("custom", derived);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl p-6"
        style={{
          background: "var(--color-nexus-surface)",
          borderColor: "var(--color-nexus-border)",
          animation: "modalIn 0.15s ease-out",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--color-nexus-text)" }}>
              Custom Theme
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-nexus-text-muted)" }}>
              Choose your own colors
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-sm transition-colors"
            style={{ color: "var(--color-nexus-text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-nexus-surface-hover)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            ✕
          </button>
        </div>

        {/* Color pickers */}
        <div className="space-y-3 mb-5">
          {COLOR_FIELDS.map(({ key, label, hint }) => (
            <div key={key} className="flex items-center gap-3">
              {/* Color swatch / picker trigger */}
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={values[key]}
                  onChange={(e) => setters[key](e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                  style={{
                    background: values[key],
                    borderRadius: "8px",
                    outline: "1px solid var(--color-nexus-border)",
                  }}
                  title={label}
                />
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--color-nexus-text)" }}>
                  {label}
                </p>
                <p className="text-xs" style={{ color: "var(--color-nexus-text-muted)" }}>
                  {hint}
                </p>
              </div>

              {/* Hex input */}
              <input
                type="text"
                value={values[key]}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setters[key](val);
                }}
                onBlur={(e) => {
                  if (!/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    setters[key](defaults[key as keyof typeof defaults]);
                  }
                }}
                className="nexus-input w-24 font-mono text-xs"
                spellCheck={false}
              />
            </div>
          ))}
        </div>

        {/* Live preview */}
        <div
          className="rounded-xl border p-3 mb-5"
          style={{
            background: derived.bg,
            borderColor: derived.border,
          }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: derived.textMuted }}>
            Preview
          </p>
          <div
            className="rounded-lg border p-3 flex items-center justify-between"
            style={{ background: derived.surface, borderColor: derived.border }}
          >
            <span className="text-sm font-medium" style={{ color: derived.text }}>
              Sample card
            </span>
            <button
              className="px-3 py-1 rounded-md text-xs font-medium"
              style={{ background: derived.accent, color: "#fff" }}
            >
              Action
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-xs border"
              style={{ borderColor: derived.accent, color: derived.accent }}
            >
              tag
            </span>
            <span className="text-xs" style={{ color: derived.textMuted }}>
              Muted text example
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose} className="nexus-btn nexus-btn-ghost flex-1 text-sm">
            Cancel
          </button>
          <button onClick={handleApply} className="nexus-btn nexus-btn-primary flex-1 text-sm">
            Apply theme
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
