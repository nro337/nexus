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

async function importResources(
  resources: Resource[],
  counts: { imported: number; skipped: number }
): Promise<void> {
  for (const resource of resources) {
    resource.createdAt = new Date(resource.createdAt);
    resource.updatedAt = new Date(resource.updatedAt);
    try {
      await db.resources.add(resource);
      counts.imported++;
    } catch {
      counts.skipped++; // duplicate key in merge mode
    }
  }
}

async function importTags(tags: Tag[]): Promise<void> {
  for (const tag of tags) {
    tag.createdAt = new Date(tag.createdAt);
    try {
      await db.tags.add(tag);
    } catch {
      // skip duplicate
    }
  }
}

async function importResourceTags(resourceTags: ResourceTag[]): Promise<void> {
  for (const link of resourceTags) {
    try {
      await db.resourceTags.add(link);
    } catch {
      // skip duplicate
    }
  }
}

async function importNotes(notes: Note[]): Promise<void> {
  for (const note of notes) {
    note.createdAt = new Date(note.createdAt);
    note.updatedAt = new Date(note.updatedAt);
    try {
      await db.notes.add(note);
    } catch {
      // skip duplicate
    }
  }
}

async function importConnections(connections: Connection[]): Promise<void> {
  for (const conn of connections) {
    conn.createdAt = new Date(conn.createdAt);
    try {
      await db.connections.add(conn);
    } catch {
      // skip duplicate
    }
  }
}

export async function importDatabase(
  data: NexusExport,
  mode: "merge" | "replace" = "merge"
): Promise<{ imported: number; skipped: number }> {
  const counts = { imported: 0, skipped: 0 };

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

      await importResources(data.resources, counts);
      await importTags(data.tags);
      await importResourceTags(data.resourceTags);
      await importNotes(data.notes);
      await importConnections(data.connections);
    }
  );

  return counts;
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
