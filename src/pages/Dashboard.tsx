import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/schema";
import { useSearchStore } from "../store/useSearchStore";
import { SearchResults } from "../components/search/SearchResults";
import { ResourceCard } from "../components/resources/ResourceCard";
import type { PageId } from "../App";

interface DashboardProps {
  onNavigate: (page: PageId) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { query } = useSearchStore();

  const resourceCount = useLiveQuery(() => db.resources.count(), []) ?? 0;
  const tagCount = useLiveQuery(() => db.tags.count(), []) ?? 0;
  const connectionCount = useLiveQuery(() => db.connections.count(), []) ?? 0;
  const noteCount = useLiveQuery(() => db.notes.count(), []) ?? 0;

  const recentResources = useLiveQuery(
    () => db.resources.orderBy("createdAt").reverse().limit(5).toArray(),
    []
  ) ?? [];

  if (query.trim()) {
    return <SearchResults />;
  }

  return (
    <div className="max-w-4xl">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-nexus-text)" }}>
          Welcome to Nexus
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--color-nexus-text-muted)" }}>
          Your personal knowledge graph. Capture, connect, and discover.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Resources", count: resourceCount, color: "var(--color-type-link)", page: "resources" as PageId },
          { label: "Tags", count: tagCount, color: "var(--color-type-snippet)", page: "resources" as PageId },
          { label: "Connections", count: connectionCount, color: "var(--color-type-image)", page: "graph" as PageId },
          { label: "Notes", count: noteCount, color: "var(--color-type-note)", page: "resources" as PageId },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => onNavigate(stat.page)}
            className="nexus-card text-left"
          >
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.count}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-nexus-text-muted)" }}>
              {stat.label}
            </p>
          </button>
        ))}
      </div>

      {/* Recent resources */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-nexus-text)" }}>
            Recently added
          </h3>
          {resourceCount > 5 && (
            <button
              onClick={() => onNavigate("resources")}
              className="text-xs"
              style={{ color: "var(--color-nexus-accent)" }}
            >
              View all →
            </button>
          )}
        </div>

        {recentResources.length === 0 ? (
          <div
            className="nexus-card flex flex-col items-center justify-center py-12"
            style={{ borderStyle: "dashed" }}
          >
            <p className="text-sm mb-2" style={{ color: "var(--color-nexus-text-muted)" }}>
              Nothing here yet
            </p>
            <button
              onClick={() => onNavigate("capture")}
              className="nexus-btn nexus-btn-primary text-sm"
            >
              Capture your first resource
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentResources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
