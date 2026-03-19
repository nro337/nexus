import { useTranslation } from "react-i18next";
import { CaptureForm } from "./CaptureForm";

interface CaptureModalProps {
  onClose: () => void;
}

export function CaptureModal({ onClose }: CaptureModalProps) {
  const { t } = useTranslation();

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
            {t("capture.title")}
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

        <CaptureForm onSaved={onClose} />
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
