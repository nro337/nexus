import { useSearchStore } from "../../store/useSearchStore";
import type { PageId } from "../../App";

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: "Dashboard",
  resources: "Resources",
  graph: "Knowledge Graph",
  capture: "Capture",
};

interface HeaderProps {
  onQuickCapture: () => void;
  currentPage: PageId;
}

export function Header({ onQuickCapture, currentPage }: HeaderProps) {
  const { query, setQuery } = useSearchStore();

  return (
    <header
      className="h-14 shrink-0 flex items-center justify-between px-6 border-b"
      style={{ borderColor: "var(--color-nexus-border)", background: "var(--color-nexus-surface)" }}
    >
      <h1 className="text-base font-semibold" style={{ color: "var(--color-nexus-text)" }}>
        {PAGE_TITLES[currentPage]}
      </h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="nexus-input w-64 pl-8 text-sm"
          />
          <span
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--color-nexus-text-muted)" }}
          >
            ⌕
          </span>
        </div>

        {/* Quick capture button */}
        <button onClick={onQuickCapture} className="nexus-btn nexus-btn-primary text-sm">
          <span className="text-lg leading-none">+</span> Capture
        </button>
      </div>
    </header>
  );
}
