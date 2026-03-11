import { db } from "./schema";
import type { Tag, CreateTagInput } from "../types";
import { generateId, slugify, stringToColor } from "../lib/utils";

export async function createTag(input: CreateTagInput): Promise<Tag> {
  const name = slugify(input.name);
  const existing = await db.tags.where("name").equals(name).first();
  if (existing) return existing;

  const tag: Tag = {
    id: generateId(),
    name,
    color: input.color || stringToColor(name),
    createdAt: new Date(),
  };

  await db.tags.add(tag);
  return tag;
}

export async function getTag(id: string): Promise<Tag | undefined> {
  return db.tags.get(id);
}

export async function getTagByName(name: string): Promise<Tag | undefined> {
  return db.tags.where("name").equals(slugify(name)).first();
}

export async function getAllTags(): Promise<Tag[]> {
  return db.tags.orderBy("name").toArray();
}

export async function updateTag(
  id: string,
  changes: Partial<Pick<Tag, "name" | "color">>
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (changes.name) update.name = slugify(changes.name);
  if (changes.color) update.color = changes.color;
  await db.tags.update(id, update);
}

export async function deleteTag(id: string): Promise<void> {
  await db.transaction("rw", [db.tags, db.resourceTags], async () => {
    await db.tags.delete(id);
    await db.resourceTags.where("tagId").equals(id).delete();
  });
}

export async function getTagsForResource(resourceId: string): Promise<Tag[]> {
  const links = await db.resourceTags
    .where("resourceId")
    .equals(resourceId)
    .toArray();
  const tagIds = links.map((l) => l.tagId);
  if (!tagIds.length) return [];
  return db.tags.where("id").anyOf(tagIds).toArray();
}

export async function getTagCount(): Promise<number> {
  return db.tags.count();
}
