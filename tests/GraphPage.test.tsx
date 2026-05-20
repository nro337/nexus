import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GraphPage } from "../src/pages/GraphPage";

type MockGraphState = {
  graphData: { nodes: Array<{ id: string; label: string }>; links: Array<{ source: string; target: string }> };
  loading: boolean;
  selectedNodeId: string | null;
  loadGraph: () => Promise<void>;
  selectNode: (id: string | null) => void;
};

let mockGraphState: MockGraphState;
let mockForceGraphProps: { width?: number; height?: number } = {};
let resizeCallback: (() => void) | null = null;
let observedElement: HTMLElement | null = null;
let disconnectCalls = 0;

vi.mock("react-force-graph-2d", () => ({
  default: (props: { width?: number; height?: number }) => {
    mockForceGraphProps = props;
    return <div data-testid="force-graph" />;
  },
}));

vi.mock("../src/store/useGraphStore", () => ({
  useGraphStore: () => mockGraphState,
}));

vi.mock("../src/store/useThemeStore", () => ({
  useThemeStore: () => ({ theme: "dark" }),
}));

class ResizeObserverMock {
  constructor(cb: () => void) {
    resizeCallback = cb;
  }

  observe(element: Element) {
    observedElement = element as HTMLElement;
  }

  disconnect() {
    disconnectCalls += 1;
  }
}

describe("GraphPage", () => {
  beforeEach(() => {
    mockForceGraphProps = {};
    resizeCallback = null;
    observedElement = null;
    disconnectCalls = 0;
    globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
    mockGraphState = {
      graphData: { nodes: [], links: [] },
      loading: false,
      selectedNodeId: null,
      loadGraph: vi.fn().mockResolvedValue(undefined),
      selectNode: vi.fn(),
    };
  });

  it("starts observing size when graph renders after loading", async () => {
    mockGraphState.loading = true;
    const { rerender, unmount } = render(<GraphPage />);

    expect(observedElement).toBeNull();

    mockGraphState = {
      ...mockGraphState,
      loading: false,
      graphData: { nodes: [{ id: "n1", label: "Node 1" }], links: [] },
    };
    rerender(<GraphPage />);

    await waitFor(() => {
      expect(observedElement).not.toBeNull();
    });

    unmount();
    expect(disconnectCalls).toBeGreaterThan(0);
  });

  it("updates graph width and height from container dimensions", async () => {
    mockGraphState.graphData = { nodes: [{ id: "n1", label: "Node 1" }], links: [] };
    render(<GraphPage />);

    await waitFor(() => {
      expect(observedElement).not.toBeNull();
      expect(resizeCallback).not.toBeNull();
    });

    if (!observedElement) {
      throw new Error("Expected graph container element to be observed.");
    }

    Object.defineProperties(observedElement, {
      clientWidth: { configurable: true, value: 1234 },
      clientHeight: { configurable: true, value: 678 },
    });

    act(() => {
      resizeCallback?.();
    });

    await waitFor(() => {
      expect(mockForceGraphProps.width).toBe(1234);
      expect(mockForceGraphProps.height).toBe(678);
    });
  });
});
