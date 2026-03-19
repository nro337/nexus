import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { useResourceStore } from "../../store/useResourceStore";
import { useSearchStore } from "../../store/useSearchStore";
import { ResourceCard } from "./ResourceCard";
import { EditResourceModal } from "./EditResourceModal";
import { db } from "../../db/schema";
import type { Resource, ResourceType, SourcePlatform } from "../../types";

export function ResourceList() {
  const { t } = useTranslation();
  const { resources, filters, setFilters, loading } = useResourceStore();
  const { query, results } = useSearchStore();
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const allTags = useLiveQuery(() => db.tags.orderBy("name").toArray(), []) ?? [];

  const displayResources = query.trim()
    ? results.map((r) => r.resource)
    : resources;

  const resourceTypeOptions: { value: ResourceType; label: string }[] = [
    { value: "link", label: t("resourceTypes.link") },
    { value: "snippet", label: t("resourceTypes.snippet") },
    { value: "image", label: t("resourceTypes.image") },
    { value: "note", label: t("resourceTypes.note") },
    { value: "file", label: t("resourceTypes.file") },
  ];

  const sourceOptions: { value: SourcePlatform; label: string }[] = [
    { value: "web", label: t("sources.web") },
    { value: "reddit", label: t("sources.reddit") },
    { value: "twitter", label: t("sources.twitter") },
    { value: "bluesky", label: t("sources.bluesky") },
    { value: "notion", label: t("sources.notion") },
    { value: "youtube", label: t("sources.youtube") },
    { value: "github", label: t("sources.github") },
    { value: "manual", label: t("sources.manual") },
    { value: "other", label: t("sources.other") },
  ];

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
          <option value="">{t("resources.allTypes")}</option>
          {resourceTypeOptions.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
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
          {sourceOptions.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
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
          {filters.archived ? t("resources.hideArchived") : t("resources.showArchived")}
        </button>
      </div>

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
