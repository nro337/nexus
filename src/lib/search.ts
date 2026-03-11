import Fuse, { type IFuseOptions } from "fuse.js";
import type { Resource, SearchResult } from "../types";

const fuseOptions: IFuseOptions<Resource> = {
  keys: [
    { name: "title", weight: 0.4 },
    { name: "content", weight: 0.3 },
    { name: "url", weight: 0.15 },
    { name: "source", weight: 0.1 },
    { name: "type", weight: 0.05 },
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

let fuseIndex: Fuse<Resource> | null = null;

export function buildSearchIndex(resources: Resource[]): void {
  fuseIndex = new Fuse(resources, fuseOptions);
}

export function searchResources(query: string): SearchResult[] {
  if (!fuseIndex || !query.trim()) return [];

  const results = fuseIndex.search(query, { limit: 50 });

  return results.map((r) => ({
    resource: r.item,
    score: r.score ?? 1,
    matches: r.matches as SearchResult["matches"],
  }));
}

export function getSearchIndex(): Fuse<Resource> | null {
  return fuseIndex;
}
