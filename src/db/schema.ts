import Dexie, { type Table } from "dexie";
import type { Resource, Tag, ResourceTag, Note, Connection } from "../types";

export class NexusDB extends Dexie {
  resources!: Table<Resource, string>;
  tags!: Table<Tag, string>;
  resourceTags!: Table<ResourceTag, string>;
  notes!: Table<Note, string>;
  connections!: Table<Connection, string>;

  constructor() {
    super("NexusDB");

    this.version(1).stores({
      resources: "id, title, type, source, createdAt, updatedAt, archived",
      tags: "id, &name",
      resourceTags: "[resourceId+tagId], resourceId, tagId",
      notes: "id, resourceId, createdAt",
      connections: "id, sourceId, targetId, type, createdAt",
    });
  }
}

export const db = new NexusDB();
