import { create } from "zustand";
import type { SearchResult } from "../types";
import { searchResources } from "../lib/search";

interface SearchStore {
  query: string;
  results: SearchResult[];
  isSearching: boolean;

  setQuery: (query: string) => void;
  search: (query: string) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: "",
  results: [],
  isSearching: false,

  setQuery: (query) => {
    set({ query });
    if (!query.trim()) {
      set({ results: [], isSearching: false });
      return;
    }
    set({ isSearching: true });
    const results = searchResources(query);
    set({ results, isSearching: false });
  },

  search: (query) => {
    const results = searchResources(query);
    set({ query, results, isSearching: false });
  },

  clearSearch: () => {
    set({ query: "", results: [], isSearching: false });
  },
}));
