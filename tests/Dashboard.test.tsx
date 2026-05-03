import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { Dashboard } from "../src/pages/Dashboard";
import type { Resource } from "../src/types";

// ── Mocks ──────────────────────────────────────────────────────────────────

let mockQuery = "";

vi.mock("../src/store/useSearchStore", () => ({
  useSearchStore: () => ({ query: mockQuery }),
}));

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

vi.mock("../src/db/schema", () => ({
  db: {
    resources: {
      count: vi.fn(),
      orderBy: vi.fn().mockReturnValue({
        reverse: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    },
    tags: { count: vi.fn() },
    connections: { count: vi.fn() },
    notes: { count: vi.fn() },
  },
}));

vi.mock("../src/components/resources/ResourceCard", () => ({
  ResourceCard: ({ resource }: { resource: Resource }) => (
    <div data-testid="resource-card">{resource.title}</div>
  ),
}));

vi.mock("../src/components/resources/EditResourceModal", () => ({
  EditResourceModal: () => null,
}));

vi.mock("../src/components/search/SearchResults", () => ({
  SearchResults: () => <div data-testid="search-results" />,
}));

vi.mock("../src/db/tags", () => ({
  getTagsForResource: vi.fn().mockResolvedValue([]),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

import { useLiveQuery } from "dexie-react-hooks";

/** Configure the useLiveQuery mock to return values matching Dashboard's five useLiveQuery
 *  calls in order: resourceCount, tagCount, connectionCount, noteCount, recentResources. */
function setupLiveQuery(
  resourceCount = 0,
  tagCount = 0,
  connectionCount = 0,
  noteCount = 0,
  recentResources: Resource[] = []
) {
  const mock = vi.mocked(useLiveQuery);
  mock.mockReset();
  mock
    .mockReturnValueOnce(resourceCount)
    .mockReturnValueOnce(tagCount)
    .mockReturnValueOnce(connectionCount)
    .mockReturnValueOnce(noteCount)
    .mockReturnValueOnce(recentResources);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Dashboard", () => {
  beforeEach(() => {
    mockQuery = "";
    setupLiveQuery();
  });

  it("renders the welcome heading", () => {
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByText(/welcome to nexus/i)).toBeInTheDocument();
  });

  it("renders all four stat cards", () => {
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.getByText("Connections")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("calls onNavigate with 'graph' when Connections stat card is clicked", () => {
    const onNavigate = vi.fn();
    render(<Dashboard onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Connections").closest("button")!);
    expect(onNavigate).toHaveBeenCalledWith("graph");
  });

  it("calls onNavigate with 'resources' when Resources stat card is clicked", () => {
    const onNavigate = vi.fn();
    render(<Dashboard onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Resources").closest("button")!);
    expect(onNavigate).toHaveBeenCalledWith("resources");
  });

  it("shows 'nothing yet' empty state when there are no recent resources", () => {
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });

  it("shows 'Capture your first resource' button in empty state", () => {
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByRole("button", { name: /capture your first resource/i })).toBeInTheDocument();
  });

  it("navigates to capture page when 'Capture your first resource' is clicked", () => {
    const onNavigate = vi.fn();
    render(<Dashboard onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole("button", { name: /capture your first resource/i }));
    expect(onNavigate).toHaveBeenCalledWith("capture");
  });

  it("renders resource cards when recent resources exist", () => {
    const resources: Resource[] = [
      {
        id: "r1",
        title: "Recent Resource 1",
        content: "",
        type: "link",
        source: "manual",
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false,
      },
    ];
    setupLiveQuery(1, 0, 0, 0, resources);

    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByTestId("resource-card")).toBeInTheDocument();
    expect(screen.getByText("Recent Resource 1")).toBeInTheDocument();
  });

  it("shows 'View all' button when resourceCount > 5", () => {
    setupLiveQuery(10, 0, 0, 0, []);
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByText(/view all/i)).toBeInTheDocument();
  });

  it("does not show 'View all' button when resourceCount <= 5", () => {
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.queryByText(/view all/i)).not.toBeInTheDocument();
  });

  it("renders SearchResults component when search query is active", () => {
    mockQuery = "react hooks";
    setupLiveQuery();
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByTestId("search-results")).toBeInTheDocument();
    expect(screen.queryByText(/welcome to nexus/i)).not.toBeInTheDocument();
  });
});
