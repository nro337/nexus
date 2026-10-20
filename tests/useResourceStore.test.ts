import { vi, beforeEach, describe, it, expect } from "vitest";
import { useResourceStore } from "../src/store/useResourceStore";
import type { Resource } from "../src/types";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockGetAllResources = vi.fn();
const mockGetFilteredResources = vi.fn();
const mockCreateResource = vi.fn();
const mockBuildSearchIndex = vi.fn();

vi.mock("../src/db/resources", () => ({
  getAllResources: (...args: unknown[]) => mockGetAllResources(...args),
  getFilteredResources: (...args: unknown[]) => mockGetFilteredResources(...args),
  createResource: (...args: unknown[]) => mockCreateResource(...args),
  updateResource: vi.fn().mockResolvedValue(undefined),
  deleteResource: vi.fn().mockResolvedValue(undefined),
  archiveResource: vi.fn().mockResolvedValue(undefined),
  unarchiveResource: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/lib/search", () => ({
  buildSearchIndex: (...args: unknown[]) => mockBuildSearchIndex(...args),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeResource(id: string, archived = false): Resource {
  return {
    id,
    title: `Resource ${id}`,
    content: "",
    type: "link",
    source: "manual",
    createdAt: new Date(),
    updatedAt: new Date(),
    archived,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useResourceStore – loadResources", () => {
  beforeEach(() => {
    mockGetAllResources.mockReset();
    mockGetFilteredResources.mockReset();
    mockBuildSearchIndex.mockReset();

    // Reset store to default state between tests
    useResourceStore.setState({ resources: [], filters: { archived: false }, loading: false });
  });

  it("calls getAllResources when no type/source/tag/date filters are active", async () => {
    const allResources = [makeResource("r1")];
    mockGetAllResources.mockResolvedValue(allResources);

    await useResourceStore.getState().loadResources();

    expect(mockGetAllResources).toHaveBeenCalled();
    expect(mockGetFilteredResources).not.toHaveBeenCalled();
  });

  it("calls getFilteredResources when a type filter is active", async () => {
    const filtered = [makeResource("r1")];
    mockGetFilteredResources.mockResolvedValue(filtered);
    mockGetAllResources.mockResolvedValue(filtered);

    useResourceStore.setState({ filters: { types: ["link"] } });
    await useResourceStore.getState().loadResources();

    expect(mockGetFilteredResources).toHaveBeenCalled();
  });

  it("calls getFilteredResources when a source filter is active", async () => {
    const filtered = [makeResource("r1")];
    mockGetFilteredResources.mockResolvedValue(filtered);
    mockGetAllResources.mockResolvedValue(filtered);

    useResourceStore.setState({ filters: { sources: ["github"] } });
    await useResourceStore.getState().loadResources();

    expect(mockGetFilteredResources).toHaveBeenCalled();
  });

  it("calls getFilteredResources when a tagIds filter is active", async () => {
    const filtered = [makeResource("r1")];
    mockGetFilteredResources.mockResolvedValue(filtered);
    mockGetAllResources.mockResolvedValue(filtered);

    useResourceStore.setState({ filters: { tagIds: ["tag-1"] } });
    await useResourceStore.getState().loadResources();

    expect(mockGetFilteredResources).toHaveBeenCalled();
  });

  it("filters out archived resources when archived filter is false", async () => {
    const resources = [makeResource("r1", false), makeResource("r2", true)];
    mockGetAllResources.mockResolvedValue(resources);

    useResourceStore.setState({ filters: { archived: false } });
    await useResourceStore.getState().loadResources();

    const { resources: result } = useResourceStore.getState();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("r1");
  });

  it("filters to only archived resources when archived filter is true", async () => {
    const resources = [makeResource("r1", false), makeResource("r2", true)];
    mockGetAllResources.mockResolvedValue(resources);

    useResourceStore.setState({ filters: { archived: true } });
    await useResourceStore.getState().loadResources();

    const { resources: result } = useResourceStore.getState();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("r2");
  });

  it("returns all resources when archived filter is undefined", async () => {
    const resources = [makeResource("r1", false), makeResource("r2", true)];
    mockGetAllResources.mockResolvedValue(resources);

    useResourceStore.setState({ filters: { archived: undefined } });
    await useResourceStore.getState().loadResources();

    const { resources: result } = useResourceStore.getState();
    expect(result).toHaveLength(2);
  });

  it("sets loading to false after loadResources completes", async () => {
    mockGetAllResources.mockResolvedValue([]);
    await useResourceStore.getState().loadResources();
    expect(useResourceStore.getState().loading).toBe(false);
  });

  it("builds the search index from all resources", async () => {
    const allResources = [makeResource("r1")];
    mockGetAllResources.mockResolvedValue(allResources);

    await useResourceStore.getState().loadResources();

    expect(mockBuildSearchIndex).toHaveBeenCalledWith(allResources);
  });
});

describe("useResourceStore – setFilters / clearFilters", () => {
  beforeEach(() => {
    mockGetAllResources.mockResolvedValue([]);
    mockGetFilteredResources.mockResolvedValue([]);
    useResourceStore.setState({ resources: [], filters: { archived: false }, loading: false });
  });

  it("merges new filters with existing filters on setFilters", async () => {
    await useResourceStore.getState().setFilters({ types: ["note"] });
    const { filters } = useResourceStore.getState();
    expect(filters.types).toEqual(["note"]);
    expect(filters.archived).toBe(false); // preserved from initial
  });

  it("resets filters to default on clearFilters", async () => {
    useResourceStore.setState({ filters: { types: ["link"], archived: true } });
    await useResourceStore.getState().clearFilters();
    expect(useResourceStore.getState().filters).toEqual({ archived: false });
  });
});
