import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { ResourceList } from "../src/components/resources/ResourceList";
import type { Resource } from "../src/types";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockSetFilters = vi.fn();

const defaultStoreState = {
  resources: [] as Resource[],
  filters: { archived: false },
  loading: false,
  setFilters: mockSetFilters,
};

// useResourceStore can be called with or without a selector
vi.mock("../src/store/useResourceStore", () => ({
  useResourceStore: (selector?: (s: typeof defaultStoreState) => unknown) =>
    selector ? selector(defaultStoreState) : defaultStoreState,
}));

vi.mock("../src/store/useSearchStore", () => ({
  useSearchStore: () => ({ query: "", results: [] }),
}));

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: () => [],
}));

vi.mock("../src/db/schema", () => ({
  db: {
    tags: { orderBy: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }) },
  },
}));

vi.mock("../src/db/tags", () => ({
  getTagsForResource: vi.fn().mockResolvedValue([]),
}));

vi.mock("../src/lib/utils", () => ({
  formatRelativeDate: () => "just now",
  generateId: () => "test-id",
}));

vi.mock("../src/components/resources/EditResourceModal", () => ({
  EditResourceModal: () => null,
}));

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ResourceList – filter bar", () => {
  beforeEach(() => {
    mockSetFilters.mockReset();
  });

  it("renders all type options including 'All types'", () => {
    render(<ResourceList />);
    const typeSelect = screen.getAllByRole("combobox")[0];
    expect(typeSelect).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /all types/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /link/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /snippet/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /note/i })).toBeInTheDocument();
  });

  it("renders all source options including 'All sources'", () => {
    render(<ResourceList />);
    expect(screen.getByRole("option", { name: /all sources/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /web/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /youtube/i })).toBeInTheDocument();
  });

  it("calls setFilters with the selected type when type filter changes", () => {
    render(<ResourceList />);
    const typeSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(typeSelect, { target: { value: "snippet" } });
    expect(mockSetFilters).toHaveBeenCalledWith({ types: ["snippet"] });
  });

  it("calls setFilters with undefined types when blank option selected", () => {
    render(<ResourceList />);
    const typeSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(typeSelect, { target: { value: "" } });
    expect(mockSetFilters).toHaveBeenCalledWith({ types: undefined });
  });

  it("calls setFilters with the selected source when source filter changes", () => {
    render(<ResourceList />);
    const sourceSelect = screen.getAllByRole("combobox")[1];
    fireEvent.change(sourceSelect, { target: { value: "github" } });
    expect(mockSetFilters).toHaveBeenCalledWith({ sources: ["github"] });
  });

  it("toggles archived filter when the archive button is clicked", () => {
    render(<ResourceList />);
    fireEvent.click(screen.getByText(/show archived/i));
    expect(mockSetFilters).toHaveBeenCalledWith({ archived: true });
  });

  it("shows 'Hide archived' text when filter is already showing archived", () => {
    // Override the store state to simulate archived=true
    defaultStoreState.filters = { archived: true };
    render(<ResourceList />);
    expect(screen.getByText(/hide archived/i)).toBeInTheDocument();
    defaultStoreState.filters = { archived: false };
  });
});

describe("ResourceList – results display", () => {
  it("shows loading indicator when loading is true", () => {
    defaultStoreState.loading = true;
    render(<ResourceList />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    defaultStoreState.loading = false;
  });

  it("shows empty state message when there are no resources", () => {
    defaultStoreState.resources = [];
    render(<ResourceList />);
    expect(screen.getByText(/start capturing/i)).toBeInTheDocument();
  });

  it("renders a card for each resource", () => {
    const resources: Resource[] = [
      {
        id: "r1",
        title: "First Resource",
        content: "",
        type: "link",
        source: "manual",
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false,
      },
      {
        id: "r2",
        title: "Second Resource",
        content: "",
        type: "note",
        source: "web",
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false,
      },
    ];
    defaultStoreState.resources = resources;
    render(<ResourceList />);
    expect(screen.getByText("First Resource")).toBeInTheDocument();
    expect(screen.getByText("Second Resource")).toBeInTheDocument();
    defaultStoreState.resources = [];
  });

  it("shows resource count when there are resources", () => {
    defaultStoreState.resources = [
      {
        id: "r1",
        title: "A Resource",
        content: "",
        type: "link",
        source: "manual",
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false,
      },
    ];
    render(<ResourceList />);
    expect(screen.getByText(/1 resource/i)).toBeInTheDocument();
    defaultStoreState.resources = [];
  });
});
