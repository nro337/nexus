import type { PageId } from "../../App";

const NAV_ITEMS: { id: PageId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "◆" },
  { id: "resources", label: "Resources", icon: "☰" },
  { id: "graph", label: "Graph", icon: "◎" },
  { id: "capture", label: "Capture", icon: "+" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 flex flex-col border-r"
      style={{ borderColor: "var(--color-nexus-border)", background: "var(--color-nexus-surface)" }}>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <img src="/icon.svg" alt="Nexus logo" className="w-8 h-8 rounded-lg" />
        <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--color-nexus-text)" }}>
          Nexus
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: isActive ? "rgba(108, 140, 255, 0.12)" : "transparent",
                color: isActive ? "var(--color-nexus-accent)" : "var(--color-nexus-text-muted)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "var(--color-nexus-surface-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Keyboard shortcut hint */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "var(--color-nexus-border)" }}>
        <p className="text-xs" style={{ color: "var(--color-nexus-text-muted)" }}>
          Quick capture:{" "}
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{ background: "var(--color-nexus-bg)", color: "var(--color-nexus-text-muted)" }}>
            ⌘K
          </kbd>
        </p>
      </div>
    </aside>
  );
}
