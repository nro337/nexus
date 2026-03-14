# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (auto-opens browser at localhost:5173)
npm run build     # Type-check and build for production
npm run lint      # Run ESLint
npx vitest        # Run all tests (jsdom environment, globals enabled)
npx vitest run path/to/test.ts  # Run a single test file
```

## Architecture

Nexus is a **local-first, no-backend** personal knowledge graph. All data lives in IndexedDB via Dexie.js. There is no server, no auth, no network requests for data.

### Data Layer (`src/db/`)

- [schema.ts](src/db/schema.ts) — `NexusDB` class (extends Dexie) defines all tables: `resources`, `tags`, `resourceTags`, `notes`, `connections`. Import `db` singleton from here.
- Each other file in `src/db/` (resources, tags, notes, connections, export) contains async CRUD functions operating directly on `db`.
- `deleteResource` cascades: removes associated `resourceTags`, `notes`, and `connections` in a single transaction.

### State Management (`src/store/`)

Three Zustand stores bridge the DB and UI:
- `useResourceStore` — primary store; holds the filtered resource list, current `ResourceFilters`, and loading state. Every mutation calls `loadResources()` afterward to re-sync from DB.
- `useSearchStore` — wraps `searchResources()` from `src/lib/search.ts` (Fuse.js index). The index is rebuilt by `buildSearchIndex()` every time `loadResources()` runs.
- `useGraphStore` — loads all resources + connections for the force-graph visualization; builds `GraphNode[]`/`GraphLink[]` for `react-force-graph-2d`.

### Types (`src/types/index.ts`)

All shared types live here. Key entities: `Resource`, `Tag`, `ResourceTag`, `Note`, `Connection`. Input types (e.g. `CreateResourceInput`) omit `id`, `createdAt`, `updatedAt`, and `archived` — these are assigned by the DB layer.

### Routing / Navigation

There is **no React Router**. Navigation is handled by `App.tsx` via a `currentPage` state (`PageId` union). The `Sidebar` and `Header` call `onNavigate(pageId)` to switch views.

### Chrome Extension (`extension/`)

Manifest V3 extension. `background.js` handles context-menu captures and communicates with the running Nexus app via `postMessage` / URL params (`?capture=true`). Load unpacked from `extension/` in Chrome developer mode.

### Key Patterns

- All DB calls are async; mutations go through the Zustand store (not directly to `db`) from components.
- Archived resources are excluded from the graph and from `loadResources()` by default (`filters.archived === false`).
- `generateId()` from `src/lib/utils.ts` (nanoid) is used everywhere for entity IDs.
- Tailwind CSS v4 is configured via the Vite plugin (`@tailwindcss/vite`), not a `tailwind.config` file.
