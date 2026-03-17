import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/schema";
import { deleteTag } from "../db/tags";
import { exportDatabase, downloadExport, importDatabase } from "../db/export";
import { TagEditModal } from "../components/settings/TagEditModal";
import type { Tag } from "../types";

export function SettingsPage() {
  const tags = useLiveQuery(() => db.tags.orderBy("name").toArray(), []) ?? [];
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Export / Import state
  const [exportLoading, setExportLoading] = useState(false);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const data = await exportDatabase();
      downloadExport(data);
    } finally {
      setExportLoading(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportResult(null);
    setImportError(null);
    setImportLoading(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await importDatabase(data, importMode);
      setImportResult(result);
    } catch (err) {
      console.error("Import failed:", err);
      setImportError("Failed to import file. Make sure it is a valid Nexus backup (.json).");
    } finally {
      setImportLoading(false);
      // Reset the file input so the same file can be re-imported
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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

      {/* Data section */}
      <section className="mt-10">
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-nexus-text)" }}>
          Data
        </h3>
        <p className="text-xs mb-4" style={{ color: "var(--color-nexus-text-muted)" }}>
          Export your data as a JSON backup or import a previously exported file.
        </p>

        <div
          className="rounded-xl border divide-y"
          style={{
            borderColor: "var(--color-nexus-border)",
            background: "var(--color-nexus-surface)",
          }}
        >
          {/* Export row */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "var(--color-nexus-text)" }}>
                Export
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-nexus-text-muted)" }}>
                Download all your resources, tags, notes and connections as a JSON file.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                background: "var(--color-nexus-accent)",
                color: "#fff",
                opacity: exportLoading ? 0.6 : 1,
              }}
            >
              {exportLoading ? "Exporting…" : "Export"}
            </button>
          </div>

          {/* Import row */}
          <div className="px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--color-nexus-text)" }}>
                  Import
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-nexus-text-muted)" }}>
                  Restore from a Nexus backup file. Choose how to handle existing data.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importLoading}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0"
                style={{
                  background: "var(--color-nexus-accent)",
                  color: "#fff",
                  opacity: importLoading ? 0.6 : 1,
                }}
              >
                {importLoading ? "Importing…" : "Import"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
                aria-label="Import backup file"
              />
            </div>

            {/* Import mode selector */}
            <div className="mt-3 flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs" style={{ color: "var(--color-nexus-text-muted)" }}>
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === "merge"}
                  onChange={() => setImportMode("merge")}
                />
                Merge (keep existing data)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs" style={{ color: "var(--color-nexus-text-muted)" }}>
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === "replace"}
                  onChange={() => setImportMode("replace")}
                />
                Replace (overwrite all data)
              </label>
            </div>

            {/* Import result / error feedback */}
            {importResult && (
              <p className="mt-2 text-xs" style={{ color: "var(--color-nexus-text-muted)" }}>
                ✓ Imported {importResult.imported} record{importResult.imported !== 1 ? "s" : ""}
                {importResult.skipped > 0 ? `, skipped ${importResult.skipped} duplicate${importResult.skipped !== 1 ? "s" : ""}` : ""}.
              </p>
            )}
            {importError && (
              <p className="mt-2 text-xs" style={{ color: "var(--color-nexus-danger)" }}>
                {importError}
              </p>
            )}
          </div>
        </div>
      </section>

      {editingTag && (
        <TagEditModal
          tag={editingTag}
          onClose={() => setEditingTag(null)}
        />
      )}
    </div>
  );
}
