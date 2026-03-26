import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CaptureForm } from "../components/capture/CaptureForm";

export function CapturePage() {
  const { t } = useTranslation();
  const initialData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      url: params.get("url") || "",
      title: params.get("title") || "",
      content: params.get("text") || "",
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-nexus-text)" }}>
          {t("capture.title")}
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-nexus-text-muted)" }}>
          {t("capture.subtitle")}
        </p>
      </div>

      <div className="nexus-card">
        <CaptureForm
          initialUrl={initialData.url}
          initialTitle={initialData.title}
          initialContent={initialData.content}
        />
      </div>
    </div>
  );
}
