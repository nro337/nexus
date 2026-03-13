import { db } from "./schema";
import type {
  Resource,
  CreateResourceInput,
  UpdateResourceInput,
  ResourceFilters,
  ResourceTag,
} from "../types";
import { generateId } from "../lib/utils";

export async function createResource(
  input: CreateResourceInput,
  tagIds?: string[]
): Promise<Resource> {
  const now = new Date();
  const resource: Resource = {
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    archived: false,
  };

  await db.transaction("rw", [db.resources, db.resourceTags], async () => {
    await db.resources.add(resource);
    if (tagIds?.length) {
      const links: ResourceTag[] = tagIds.map((tagId) => ({
        resourceId: resource.id,
        tagId,
      }));
      await db.resourceTags.bulkAdd(links);
    }
  });

  return resource;
}

export async function getResource(id: string): Promise<Resource | undefined> {
  return db.resources.get(id);
}

export async function updateResource(input: UpdateResourceInput): Promise<void> {
  const { id, ...changes } = input;
  await db.resources.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteResource(id: string): Promise<void> {
  await db.transaction(
    "rw",
    [db.resources, db.resourceTags, db.notes, db.connections],
    async () => {
      await db.resources.delete(id);
      await db.resourceTags.where("resourceId").equals(id).delete();
      await db.notes.where("resourceId").equals(id).delete();
      await db.connections
        .where("sourceId")
        .equals(id)
        .or("targetId")
        .equals(id)
        .delete();
    }
  );
}

export async function archiveResource(id: string): Promise<void> {
  await db.resources.update(id, { archived: true, updatedAt: new Date() });
}

export async function unarchiveResource(id: string): Promise<void> {
  await db.resources.update(id, { archived: false, updatedAt: new Date() });
}

export async function getAllResources(): Promise<Resource[]> {
  return db.resources.orderBy("updatedAt").reverse().toArray();
}

export async function getFilteredResources(
  filters: ResourceFilters
): Promise<Resource[]> {
  const collection = db.resources.orderBy("updatedAt").reverse();

  let results = await collection.toArray();

  if (filters.types?.length) {
    results = results.filter((r) => filters.types!.includes(r.type));
  }
  if (filters.sources?.length) {
    results = results.filter((r) => filters.sources!.includes(r.source));
  }
  if (filters.archived !== undefined) {
    results = results.filter((r) => r.archived === filters.archived);
  }
  if (filters.dateFrom) {
    results = results.filter((r) => r.createdAt >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    results = results.filter((r) => r.createdAt <= filters.dateTo!);
  }
  if (filters.tagIds?.length) {
    const taggedResourceIds = await db.resourceTags
      .where("tagId")
      .anyOf(filters.tagIds)
      .toArray()
      .then((links) => new Set(links.map((l) => l.resourceId)));
    results = results.filter((r) => taggedResourceIds.has(r.id));
  }

  return results;
}

export async function getResourceTags(resourceId: string): Promise<string[]> {
  const links = await db.resourceTags
    .where("resourceId")
    .equals(resourceId)
    .toArray();
  return links.map((l) => l.tagId);
}

export async function setResourceTags(
  resourceId: string,
  tagIds: string[]
): Promise<void> {
  await db.transaction("rw", db.resourceTags, async () => {
    await db.resourceTags.where("resourceId").equals(resourceId).delete();
    if (tagIds.length) {
      const links: ResourceTag[] = tagIds.map((tagId) => ({
        resourceId,
        tagId,
      }));
      await db.resourceTags.bulkAdd(links);
    }
  });
}

export async function getResourceCount(): Promise<number> {
  return db.resources.count();
}
