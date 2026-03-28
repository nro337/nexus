import { useEffect, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ForceGraph2D from "react-force-graph-2d";
import { useGraphStore } from "../store/useGraphStore";
import { useThemeStore } from "../store/useThemeStore";

type FGNode = { id: string; label: string; color?: string; val?: number; x?: number; y?: number };
type FGLink = { source: string; target: string };
type FGGraphData = { nodes: FGNode[]; links: FGLink[] };

export function GraphPage() {
  const { t } = useTranslation();
  const { graphData, loading, loadGraph, selectNode, selectedNodeId } = useGraphStore();
  const { theme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDimensions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
        <p style={{ color: "var(--color-nexus-text-muted)" }}>{t("graph.loading")}</p>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm" style={{ color: "var(--color-nexus-text-muted)" }}>
          {t("graph.noDataHint")}
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full rounded-xl overflow-hidden border"
      style={{ borderColor: "var(--color-nexus-border)", background: "var(--color-nexus-bg)" }}>
      <ForceGraph2D
        graphData={graphData as FGGraphData}
        nodeLabel="label"
        nodeColor="color"
        nodeVal="val"
        linkColor={() => "rgba(108,140,255,0.25)"}
        linkWidth={1.5}
        onNodeClick={handleNodeClick}
        backgroundColor="transparent"
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as FGNode;
          const label = n.label;
          const fontSize = Math.max(10 / globalScale, 3);
          const labelColorSelected = theme === "light" ? "#1a1d27" : "#ffffff";
          const labelColorDefault = theme === "light" ? "rgba(26, 29, 39, 0.75)" : "rgba(226, 228, 234, 0.8)";
          ctx.font = `${fontSize}px DM Sans, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = node.id === selectedNodeId ? labelColorSelected : labelColorDefault;
          ctx.fillText(label, node.x!, (node.y ?? 0) + (n.val ?? 4) + 2);
        }}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 rounded-lg border px-3 py-2 text-[10px] space-y-1"
        style={{ background: "var(--color-nexus-surface)", borderColor: "var(--color-nexus-border)" }}
      >
        {[
          { typeKey: "link" as const, color: "var(--color-type-link)" },
          { typeKey: "snippet" as const, color: "var(--color-type-snippet)" },
          { typeKey: "image" as const, color: "var(--color-type-image)" },
          { typeKey: "note" as const, color: "var(--color-type-note)" },
          { typeKey: "file" as const, color: "var(--color-type-file)" },
        ].map(({ typeKey, color }) => (
          <div key={typeKey} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span style={{ color: "var(--color-nexus-text-muted)" }}>{t(`resourceTypes.${typeKey}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
