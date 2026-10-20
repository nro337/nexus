import { create } from "zustand";
import type { Resource, ResourceFilters, CreateResourceInput } from "../types";
import {
  getAllResources,
  getFilteredResources,
  createResource,
  updateResource as updateResourceDb,
  deleteResource as deleteResourceDb,
  archiveResource as archiveResourceDb,
  unarchiveResource as unarchiveResourceDb,
} from "../db/resources";
import { buildSearchIndex } from "../lib/search";

interface ResourceStore {
  resources: Resource[];
  filters: ResourceFilters;
  loading: boolean;

  loadResources: () => Promise<void>;
  addResource: (input: CreateResourceInput, tagIds?: string[]) => Promise<Resource>;
  updateResource: (id: string, changes: Partial<Resource>) => Promise<void>;
  removeResource: (id: string) => Promise<void>;
  archiveResource: (id: string) => Promise<void>;
  unarchiveResource: (id: string) => Promise<void>;
  setFilters: (filters: ResourceFilters) => Promise<void>;
  clearFilters: () => Promise<void>;
}

function hasActiveFilters(filters: ResourceFilters): boolean {
  return Boolean(
    filters.types?.length ||
      filters.sources?.length ||
      filters.tagIds?.length ||
      filters.dateFrom ||
      filters.dateTo
  );
}

function applyArchivedFilter(resources: Resource[], filters: ResourceFilters): Resource[] {
  if (filters.archived === undefined) return resources;
  return resources.filter((r) => r.archived === filters.archived);
}

export const useResourceStore = create<ResourceStore>((set, get) => ({
  resources: [],
  filters: { archived: false },
  loading: false,

  loadResources: async () => {
    set({ loading: true });
    const filters = get().filters;

    const resources = hasActiveFilters(filters)
      ? await getFilteredResources(filters)
      : await getAllResources();

    buildSearchIndex(await getAllResources());
    set({ resources: applyArchivedFilter(resources, filters), loading: false });
  },

  addResource: async (input, tagIds) => {
    const resource = await createResource(input, tagIds);
    await get().loadResources();
    return resource;
  },

  updateResource: async (id, changes) => {
    await updateResourceDb({ id, ...changes });
    await get().loadResources();
  },

  removeResource: async (id) => {
    await deleteResourceDb(id);
    await get().loadResources();
  },

  archiveResource: async (id) => {
    await archiveResourceDb(id);
    await get().loadResources();
  },

  unarchiveResource: async (id) => {
    await unarchiveResourceDb(id);
    await get().loadResources();
  },

  setFilters: async (filters) => {
    set({ filters: { ...get().filters, ...filters } });
    await get().loadResources();
  },

  clearFilters: async () => {
    set({ filters: { archived: false } });
    await get().loadResources();
  },
}));
