import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { useResourceStore } from "../../store/useResourceStore";
import { useSearchStore } from "../../store/useSearchStore";
import { ResourceCard } from "./ResourceCard";
import { EditResourceModal } from "./EditResourceModal";
import { db } from "../../db/schema";
import type { Resource, ResourceType, SourcePlatform } from "../../types";

const RESOURCE_TYPE_VALUES: ResourceType[] = ["link", "snippet", "image", "note", "file", "paper"];
const SOURCE_VALUES: SourcePlatform[] = ["web", "reddit", "twitter", "bluesky", "notion", "youtube", "github", "doi", "arxiv", "manual", "other"];

interface ResourceListFiltersProps {
  allTagOptions: { id: string; name: string }[];
}

function ResourceListFilters({ allTagOptions }: ResourceListFiltersProps) {
  const { t } = useTranslation();
  const { filters, setFilters } = useResourceStore();

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Type filter */}
      <select
        className="nexus-input w-auto text-xs"
        value={filters.types?.[0] || ""}
        onChange={(e) =>
          setFilters({ types: e.target.value ? [e.target.value as ResourceType] : undefined })
        }
      >
        <option value="">{t("resources.allTypes")}</option>
        {RESOURCE_TYPE_VALUES.map((value) => (
          <option key={value} value={value}>{t(`resourceTypes.${value}`)}</option>
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
        <option value="">{t("resources.allSources")}</option>
        {SOURCE_VALUES.map((value) => (
          <option key={value} value={value}>{t(`sources.${value}`)}</option>
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
        <option value="">{t("resources.tags")}</option>
        {allTagOptions.map((tag) => (
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
        {filters.archived ? t("resources.hideArchived") : t("resources.showArchived")}
      </button>
    </div>
  );
}

export function ResourceList() {
  const { t } = useTranslation();
  const { resources, loading } = useResourceStore();
  const { query, results } = useSearchStore();
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const allTags = useLiveQuery(() => db.tags.orderBy("name").toArray(), []) ?? [];

  const displayResources = query.trim()
    ? results.map((r) => r.resource)
    : resources;

  return (
    <div>
      <ResourceListFilters allTagOptions={allTags} />

      {/* Results */}
      {loading ? (
        <div className="text-center py-12" style={{ color: "var(--color-nexus-text-muted)" }}>
          {t("resources.loading")}
        </div>
      ) : displayResources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "var(--color-nexus-text-muted)" }}>
            {query ? t("search.noResults") + ` "${query}".` : t("resources.noResourcesHint")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} onEdit={setEditingResource} />
          ))}
        </div>
      )}

      {/* Count */}
      {displayResources.length > 0 && (
        <p className="text-xs mt-4 text-center" style={{ color: "var(--color-nexus-text-muted)" }}>
          {displayResources.length === 1
            ? t("resources.countOne", { count: 1 })
            : t("resources.countMany", { count: displayResources.length })}
          {query && ` matching "${query}"`}
        </p>
      )}

      {/* Edit modal */}
      {editingResource && (
        <EditResourceModal
          resource={editingResource}
          onClose={() => setEditingResource(null)}
        />
      )}
    </div>
  );
}
