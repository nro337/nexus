import { db } from "./schema";
import type { Resource, Tag, ResourceTag, Note, Connection } from "../types";

interface NexusExport {
  version: number;
  exportedAt: string;
  resources: Resource[];
  tags: Tag[];
  resourceTags: ResourceTag[];
  notes: Note[];
  connections: Connection[];
}

export async function exportDatabase(): Promise<NexusExport> {
  const [resources, tags, resourceTags, notes, connections] = await Promise.all([
    db.resources.toArray(),
    db.tags.toArray(),
    db.resourceTags.toArray(),
    db.notes.toArray(),
    db.connections.toArray(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    resources,
    tags,
    resourceTags,
    notes,
    connections,
  };
}

export async function importDatabase(
  data: NexusExport,
  mode: "merge" | "replace" = "merge"
): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;

  await db.transaction(
    "rw",
    [db.resources, db.tags, db.resourceTags, db.notes, db.connections],
    async () => {
      if (mode === "replace") {
        await Promise.all([
          db.resources.clear(),
          db.tags.clear(),
          db.resourceTags.clear(),
          db.notes.clear(),
          db.connections.clear(),
        ]);
      }

      for (const resource of data.resources) {
        // Ensure dates are Date objects (JSON parse gives strings)
        resource.createdAt = new Date(resource.createdAt);
        resource.updatedAt = new Date(resource.updatedAt);
        try {
          await db.resources.add(resource);
          imported++;
        } catch {
          skipped++; // duplicate key in merge mode
        }
      }

      for (const tag of data.tags) {
        tag.createdAt = new Date(tag.createdAt);
        try {
          await db.tags.add(tag);
        } catch {
          // skip duplicate
        }
      }

      for (const link of data.resourceTags) {
        try {
          await db.resourceTags.add(link);
        } catch {
          // skip duplicate
        }
      }

      for (const note of data.notes) {
        note.createdAt = new Date(note.createdAt);
        note.updatedAt = new Date(note.updatedAt);
        try {
          await db.notes.add(note);
        } catch {
          // skip duplicate
        }
      }

      for (const conn of data.connections) {
        conn.createdAt = new Date(conn.createdAt);
        try {
          await db.connections.add(conn);
        } catch {
          // skip duplicate
        }
      }
    }
  );

  return { imported, skipped };
}

export function downloadExport(data: NexusExport): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nexus-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
