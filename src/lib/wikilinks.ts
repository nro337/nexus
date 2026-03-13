import { db } from "../db/schema";
import { createConnection } from "../db/connections";

const WIKILINK_REGEX = /\[\[([^\]]+)\]\]/g;

/** Label used on auto-created wikilink connections so they can be re-synced. */
export const WIKILINK_LABEL = "wikilink";

/**
 * Extract all `[[title]]` references from a string.
 * Returns an array of titles (trimmed, duplicates preserved).
 */
export function extractWikilinks(text: string): string[] {
  const titles: string[] = [];
  const regex = new RegExp(WIKILINK_REGEX.source, "g");
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const title = match[1].trim();
    if (title) titles.push(title);
  }
  return titles;
}

/**
 * Synchronise wikilink-derived connections for `resourceId`.
 * Deletes existing auto-created connections and recreates them based on
 * the `[[title]]` references found in `content`.
 */
export async function syncWikilinkConnections(
  resourceId: string,
  content: string
): Promise<void> {
  // Remove previously auto-created wikilink connections from this source.
  await db.connections
    .where("sourceId")
    .equals(resourceId)
    .filter((c) => c.label === WIKILINK_LABEL)
    .delete();

  const titles = extractWikilinks(content);
  if (!titles.length) return;

  const allResources = await db.resources.toArray();
  const titleToId = new Map(
    allResources.map((r) => [r.title.toLowerCase(), r.id])
  );

  const seen = new Set<string>();
  for (const title of titles) {
    const targetId = titleToId.get(title.toLowerCase());
    if (targetId && targetId !== resourceId && !seen.has(targetId)) {
      seen.add(targetId);
      await createConnection({
        sourceId: resourceId,
        targetId,
        type: "related_to",
        label: WIKILINK_LABEL,
      });
    }
  }
}
