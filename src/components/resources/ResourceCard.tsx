import { useState, useEffect } from "react";
import type { Resource, Tag } from "../../types";
import { getTagsForResource } from "../../db/tags";
import { useResourceStore } from "../../store/useResourceStore";
import { formatRelativeDate, RESOURCE_TYPE_LABELS, SOURCE_LABELS } from "../../lib/utils";

interface ResourceCardProps {
  resource: Resource;
  onSelect?: (resource: Resource) => void;
}

const TYPE_COLORS: Record<string, string> = {
  link: "var(--color-type-link)",
  snippet: "var(--color-type-snippet)",
  image: "var(--color-type-image)",
  note: "var(--color-type-note)",
  file: "var(--color-type-file)",
};

function getYouTubeEmbedUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    let videoId: string | null = null;
    if (host === "youtu.be") {
      videoId = parsed.pathname.slice(1).split("/")[0] || null;
    } else if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      videoId = parsed.searchParams.get("v");
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : undefined;
  } catch {
    return undefined;
  }
}

export function ResourceCard({ resource, onSelect }: ResourceCardProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const { removeResource, archiveResource, unarchiveResource } = useResourceStore();

  const embedUrl = getYouTubeEmbedUrl(resource.url);

  useEffect(() => {
    getTagsForResource(resource.id).then(setTags);
  }, [resource.id]);

  const typeColor = TYPE_COLORS[resource.type] || "var(--color-nexus-text-muted)";

  return (
    <div className="nexus-card group" onClick={() => onSelect?.(resource)}>
      {/* YouTube embed / thumbnail preview */}
      {embedUrl ? (
        <div className="mb-3 -mx-3 -mt-3 rounded-t overflow-hidden h-52.5" onClick={(e) => e.stopPropagation()}>
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : resource.thumbnail && showThumbnail ? (
        <div className="mb-3 -mx-3 -mt-3 rounded-t overflow-hidden h-35">
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="w-full h-full object-cover"
            onError={() => setShowThumbnail(false)}
          />
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type + Source badge row */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: typeColor, background: `color-mix(in srgb, ${typeColor} 15%, transparent)` }}
            >
              {RESOURCE_TYPE_LABELS[resource.type]}
            </span>
            <span className="text-[10px]" style={{ color: "var(--color-nexus-text-muted)" }}>
              {SOURCE_LABELS[resource.source]}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-sm font-medium leading-snug truncate"
            style={{ color: "var(--color-nexus-text)" }}
          >
            {resource.url ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="hover:underline"
              >
                {resource.title}
              </a>
            ) : (
              resource.title
            )}
          </h3>

          {/* Content preview */}
          {resource.content && (
            <p
              className={`text-xs mt-1 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}
              style={{ color: "var(--color-nexus-text-muted)" }}
            >
              {resource.content}
            </p>
          )}
          {resource.content && resource.content.length > 150 && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="text-[11px] mt-0.5"
              style={{ color: "var(--color-nexus-accent)" }}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <span key={tag.id} className="nexus-tag" style={{ borderColor: tag.color, color: tag.color }}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp + actions */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px]" style={{ color: "var(--color-nexus-text-muted)" }}>
            {formatRelativeDate(resource.createdAt)}
          </span>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1">
            {resource.archived ? (
              <button
                onClick={(e) => { e.stopPropagation(); unarchiveResource(resource.id); }}
                className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                style={{ color: "var(--color-nexus-text-muted)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-nexus-surface-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                title="Unarchive"
              >
                ▲
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); archiveResource(resource.id); }}
                className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                style={{ color: "var(--color-nexus-text-muted)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-nexus-surface-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                title="Archive"
              >
                ▼
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); removeResource(resource.id); }}
              className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
              style={{ color: "var(--color-nexus-danger)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(244,108,108,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
