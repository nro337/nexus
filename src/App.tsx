import { useEffect, useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { ResourcesPage } from "./pages/ResourcesPage";
import { GraphPage } from "./pages/GraphPage";
import { Dashboard } from "./pages/Dashboard";
import { CapturePage } from "./pages/CapturePage";
import { SettingsPage } from "./pages/SettingsPage";
import { useResourceStore } from "./store/useResourceStore";
import { CaptureModal } from "./components/capture/CaptureModal";

export type PageId = "dashboard" | "resources" | "graph" | "capture" | "settings";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("capture") === "true" ? "capture" : "dashboard";
  });
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const loadResources = useResourceStore((s) => s.loadResources);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCaptureModalOpen(true);
      }
      if (e.key === "Escape") {
        setCaptureModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <Dashboard onNavigate={setCurrentPage} />;
      case "resources": return <ResourcesPage />;
      case "graph": return <GraphPage />;
      case "capture": return <CapturePage />;
      case "settings": return <SettingsPage />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onQuickCapture={() => setCaptureModalOpen(true)} currentPage={currentPage} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
      {captureModalOpen && <CaptureModal onClose={() => setCaptureModalOpen(false)} />}
    </div>
  );
}
