// ─── Enums ───────────────────────────────────────────────

export type ResourceType = "link" | "snippet" | "image" | "note" | "file" | "paper";

export type SourcePlatform =
  | "web"
  | "reddit"
  | "twitter"
  | "bluesky"
  | "notion"
  | "youtube"
  | "github"
  | "doi"
  | "arxiv"
  | "manual"
  | "other";

export type ConnectionType =
  | "related_to"
  | "builds_on"
  | "contradicts"
  | "source_for"
  | "inspired_by"
  | "part_of"
  | "custom";

// ─── Entities ────────────────────────────────────────────

export interface Resource {
  id: string;
  title: string;
  url?: string;
  content: string;
  type: ResourceType;
  source: SourcePlatform;
  createdAt: Date;
  updatedAt: Date;
  favicon?: string;
  thumbnail?: string;
  archived: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface ResourceTag {
  resourceId: string;
  tagId: string;
}

export interface Note {
  id: string;
  resourceId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
  label?: string;
  createdAt: Date;
}

// ─── Input types (for creation, before ID/dates assigned) ─

export type CreateResourceInput = Omit<Resource, "id" | "createdAt" | "updatedAt" | "archived">;
export type UpdateResourceInput = Partial<Omit<Resource, "id" | "createdAt">> & { id: string };

export type CreateTagInput = Omit<Tag, "id" | "createdAt">;

export type CreateNoteInput = Omit<Note, "id" | "createdAt" | "updatedAt">;
export type UpdateNoteInput = { id: string; body: string };

export type CreateConnectionInput = Omit<Connection, "id" | "createdAt">;

// ─── Search ──────────────────────────────────────────────

export interface SearchResult {
  resource: Resource;
  score: number;
  matches?: ReadonlyArray<{
    key: string;
    value?: string;
    indices: ReadonlyArray<readonly [number, number]>;
  }>;
}

// ─── Graph ───────────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  type: ResourceType;
  tags: string[];
  connectionCount: number;
  color?: string;
  val?: number; // node size for react-force-graph
}

export interface GraphLink {
  source: string;
  target: string;
  type: ConnectionType;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// ─── Filters ─────────────────────────────────────────────

export interface ResourceFilters {
  types?: ResourceType[];
  sources?: SourcePlatform[];
  tagIds?: string[];
  archived?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  query?: string;
}
