import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/schema";
import { deleteTag } from "../db/tags";
import { TagEditModal } from "../components/settings/TagEditModal";
import type { Tag } from "../types";

export function SettingsPage() {
  const tags = useLiveQuery(() => db.tags.orderBy("name").toArray(), []) ?? [];
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (tag: Tag) => {
    setDeletingId(tag.id);
    setDeleteError(null);
    try {
      await deleteTag(tag.id);
    } catch {
      setDeleteError(`Failed to delete tag "${tag.name}". Please try again.`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-nexus-text)" }}>
          Settings
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--color-nexus-text-muted)" }}>
          Manage your tags and preferences.
        </p>
      </div>

      {/* Tags section */}
      <section>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-nexus-text)" }}>
          Tags
        </h3>

        {tags.length === 0 ? (
          <div
            className="nexus-card flex flex-col items-center justify-center py-12"
            style={{ borderStyle: "dashed" }}
          >
            <p className="text-sm" style={{ color: "var(--color-nexus-text-muted)" }}>
              No tags yet. Create tags when capturing resources.
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl border divide-y"
            style={{
              borderColor: "var(--color-nexus-border)",
              background: "var(--color-nexus-surface)",
            }}
          >
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                {/* Color dot */}
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: tag.color }}
                />

                {/* Tag chip */}
                <span
                  className="nexus-tag"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </span>

                {/* Spacer */}
                <span className="flex-1" />

                {/* Edit button */}
                <button
                  onClick={() => setEditingTag(tag)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{ color: "var(--color-nexus-text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-nexus-surface-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Edit
                </button>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(tag)}
                  disabled={deletingId === tag.id}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{
                    color: "var(--color-nexus-danger)",
                    opacity: deletingId === tag.id ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(244,108,108,0.08)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {deletingId === tag.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {deleteError && (
        <p className="mt-3 text-xs" style={{ color: "var(--color-nexus-danger)" }}>
          {deleteError}
        </p>
      )}

      {editingTag && (
        <TagEditModal
          tag={editingTag}
          onClose={() => setEditingTag(null)}
        />
      )}
    </div>
  );
}
