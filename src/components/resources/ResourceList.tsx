import { useLiveQuery } from "dexie-react-hooks";
import { useResourceStore } from "../../store/useResourceStore";
import { useSearchStore } from "../../store/useSearchStore";
import { ResourceCard } from "./ResourceCard";
import { db } from "../../db/schema";
import type { ResourceType, SourcePlatform } from "../../types";
import { RESOURCE_TYPE_LABELS, SOURCE_LABELS } from "../../lib/utils";

export function ResourceList() {
  const { resources, filters, setFilters, loading } = useResourceStore();
  const { query, results } = useSearchStore();

  const allTags = useLiveQuery(() => db.tags.orderBy("name").toArray(), []) ?? [];

  const displayResources = query.trim()
    ? results.map((r) => r.resource)
    : resources;

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Type filter */}
        <select
          className="nexus-input w-auto text-xs"
          value={filters.types?.[0] || ""}
          onChange={(e) =>
            setFilters({ types: e.target.value ? [e.target.value as ResourceType] : undefined })
          }
        >
          <option value="">All types</option>
          {Object.entries(RESOURCE_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {/* Source filter */}
        <select
          className="nexus-input w-auto text-xs"
          value={filters.sources?.[0] || ""}
          onChange={(e) =>
            setFilters({ sources: e.target.value ? [e.target.value as SourcePlatform] : undefined })
          }
        >
          <option value="">All sources</option>
          {Object.entries(SOURCE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {/* Tag filter */}
        <select
          className="nexus-input w-auto text-xs"
          value={filters.tagIds?.[0] || ""}
          onChange={(e) =>
            setFilters({ tagIds: e.target.value ? [e.target.value] : undefined })
          }
        >
          <option value="">All tags</option>
          {allTags.map((tag) => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>

        {/* Archive toggle */}
        <button
          className="nexus-btn nexus-btn-ghost text-xs"
          onClick={() =>
            setFilters({ archived: filters.archived === true ? false : true })
          }
        >
          {filters.archived ? "Show active" : "Show archived"}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12" style={{ color: "var(--color-nexus-text-muted)" }}>
          Loading...
        </div>
      ) : displayResources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "var(--color-nexus-text-muted)" }}>
            {query ? "No matching resources found." : "No resources yet. Press ⌘K to capture something!"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}

      {/* Count */}
      {displayResources.length > 0 && (
        <p className="text-xs mt-4 text-center" style={{ color: "var(--color-nexus-text-muted)" }}>
          {displayResources.length} resource{displayResources.length !== 1 ? "s" : ""}
          {query && ` matching "${query}"`}
        </p>
      )}
    </div>
  );
}
