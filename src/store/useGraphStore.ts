import { create } from "zustand";
import type { GraphData, GraphNode, GraphLink, Resource, Connection } from "../types";
import { getAllResources } from "../db/resources";
import { getAllConnections } from "../db/connections";
import { getTagsForResource } from "../db/tags";

interface GraphStore {
  graphData: GraphData;
  selectedNodeId: string | null;
  loading: boolean;

  loadGraph: () => Promise<void>;
  selectNode: (id: string | null) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  graphData: { nodes: [], links: [] },
  selectedNodeId: null,
  loading: false,

  loadGraph: async () => {
    set({ loading: true });

    const [resources, connections] = await Promise.all([
      getAllResources(),
      getAllConnections(),
    ]);

    const connectionCounts = new Map<string, number>();
    for (const conn of connections) {
      connectionCounts.set(
        conn.sourceId,
        (connectionCounts.get(conn.sourceId) || 0) + 1
      );
      connectionCounts.set(
        conn.targetId,
        (connectionCounts.get(conn.targetId) || 0) + 1
      );
    }

    const nodes: GraphNode[] = await Promise.all(
      resources
        .filter((r) => !r.archived)
        .map(async (r: Resource) => {
          const tags = await getTagsForResource(r.id);
          const count = connectionCounts.get(r.id) || 0;
          return {
            id: r.id,
            label: r.title,
            type: r.type,
            tags: tags.map((t) => t.name),
            connectionCount: count,
            color: getTypeColor(r.type),
            val: Math.max(2, count * 2 + 2),
          };
        })
    );

    const resourceIds = new Set(resources.map((r) => r.id));
    const links: GraphLink[] = connections
      .filter(
        (c: Connection) =>
          resourceIds.has(c.sourceId) && resourceIds.has(c.targetId)
      )
      .map((c: Connection) => ({
        source: c.sourceId,
        target: c.targetId,
        type: c.type,
        label: c.label,
      }));

    set({ graphData: { nodes, links }, loading: false });
  },

  selectNode: (id) => set({ selectedNodeId: id }),
}));

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    link: "#60a5fa",
    snippet: "#f59e0b",
    image: "#a78bfa",
    note: "#34d399",
    file: "#fb7185",
    paper: "#2dd4bf",
  };
  return colors[type] || "#94a3b8";
}
