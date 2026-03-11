import { useEffect, useCallback, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useGraphStore } from "../store/useGraphStore";

export function GraphPage() {
  const { graphData, loading, loadGraph, selectNode, selectedNodeId } = useGraphStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const handleNodeClick = useCallback(
    (node: { id?: string | number }) => {
      selectNode(node.id ? String(node.id) : null);
    },
    [selectNode]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: "var(--color-nexus-text-muted)" }}>Loading graph...</p>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm" style={{ color: "var(--color-nexus-text-muted)" }}>
          No resources to visualize yet. Add some resources and connections first!
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full rounded-xl overflow-hidden border"
      style={{ borderColor: "var(--color-nexus-border)", background: "var(--color-nexus-bg)" }}>
      <ForceGraph2D
        graphData={graphData as any}
        nodeLabel="label"
        nodeColor="color"
        nodeVal="val"
        linkColor={() => "rgba(108,140,255,0.25)"}
        linkWidth={1.5}
        onNodeClick={handleNodeClick}
        backgroundColor="transparent"
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.label;
          const fontSize = Math.max(10 / globalScale, 3);
          ctx.font = `${fontSize}px DM Sans, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle =
            node.id === selectedNodeId
              ? "#ffffff"
              : "rgba(226, 228, 234, 0.8)";
          ctx.fillText(label, node.x!, (node.y ?? 0) + (node.val ?? 4) + 2);
        }}
        width={containerRef.current?.clientWidth ?? 800}
        height={containerRef.current?.clientHeight ?? 600}
      />

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 rounded-lg border px-3 py-2 text-[10px] space-y-1"
        style={{ background: "var(--color-nexus-surface)", borderColor: "var(--color-nexus-border)" }}
      >
        {[
          { label: "Link", color: "var(--color-type-link)" },
          { label: "Snippet", color: "var(--color-type-snippet)" },
          { label: "Image", color: "var(--color-type-image)" },
          { label: "Note", color: "var(--color-type-note)" },
          { label: "File", color: "var(--color-type-file)" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span style={{ color: "var(--color-nexus-text-muted)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
