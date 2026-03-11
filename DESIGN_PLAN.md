# Nexus — Personal Knowledge Graph

## Overview

Nexus is a local-first browser application for collecting, organizing, and connecting information from across the web. It runs entirely in-browser with no backend, stores data in IndexedDB (via Dexie.js), and visualizes your knowledge as an interactive graph.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Browser                            │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  React App  │  │   Browser    │  │ Bookmarklet │ │
│  │  (Main UI)  │  │  Extension   │  │  (Fallback) │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                │                  │        │
│         └────────────────┼──────────────────┘        │
│                          ▼                           │
│              ┌───────────────────────┐               │
│              │    Core Data Layer    │               │
│              │   (Dexie.js / IDB)   │               │
│              └───────────┬──────────┘               │
│                          │                           │
│              ┌───────────▼──────────┐               │
│              │  Full-Text Search    │               │
│              │   (Fuse.js index)    │               │
│              └──────────────────────┘               │
└──────────────────────────────────────────────────────┘
```

**Tech Stack:**

| Layer           | Technology                          |
| --------------- | ----------------------------------- |
| Framework       | React 18 + TypeScript               |
| Build           | Vite                                |
| Styling         | Tailwind CSS                        |
| Local DB        | Dexie.js (IndexedDB wrapper)        |
| Search          | Fuse.js (fuzzy full-text)           |
| Graph Viz       | react-force-graph-2d (d3-force)     |
| State           | Zustand (lightweight global state)  |
| Quick Capture   | Chrome Extension + Bookmarklet      |
| Data Portability| JSON export/import                  |
| Testing         | Vitest + React Testing Library      |

---

## Data Model

### Entity-Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  Resource    │──────<│  ResourceTag │>──────│    Tag       │
│             │       └──────────────┘       │             │
│  id (PK)    │                              │  id (PK)    │
│  title      │       ┌──────────────┐       │  name       │
│  url?       │──────<│     Note     │       │  color      │
│  content    │       │              │       │  createdAt  │
│  type       │       │  id (PK)     │       └─────────────┘
│  source     │       │  resourceId  │
│  createdAt  │       │  body        │
│  updatedAt  │       │  createdAt   │
│  favicon?   │       │  updatedAt   │
│  thumbnail? │       └──────────────┘
│  archived   │
└──────┬──────┘
       │
       │         ┌──────────────┐
       └────────<│  Connection  │>────────┘
                 │              │
                 │  id (PK)     │
                 │  sourceId    │  ← Resource.id
                 │  targetId    │  ← Resource.id
                 │  type        │  (e.g. "related", "builds_on", "contradicts")
                 │  label?      │  (optional freeform description)
                 │  createdAt   │
                 └──────────────┘
```

### TypeScript Interfaces

```typescript
type ResourceType = "link" | "snippet" | "image" | "note" | "file";
type SourcePlatform = "web" | "reddit" | "twitter" | "bluesky" | "notion"
                    | "youtube" | "github" | "manual" | "other";
type ConnectionType = "related_to" | "builds_on" | "contradicts"
                    | "source_for" | "inspired_by" | "part_of" | "custom";

interface Resource {
  id: string;            // nanoid
  title: string;
  url?: string;
  content: string;       // raw text, markdown, or HTML snippet
  type: ResourceType;
  source: SourcePlatform;
  createdAt: Date;
  updatedAt: Date;
  favicon?: string;      // base64 or data URL
  thumbnail?: string;    // base64 or data URL
  archived: boolean;
}

interface Tag {
  id: string;
  name: string;          // unique, lowercase, slugified
  color: string;         // hex color for graph/UI
  createdAt: Date;
}

interface ResourceTag {
  resourceId: string;
  tagId: string;
}

interface Note {
  id: string;
  resourceId: string;
  body: string;          // markdown
  createdAt: Date;
  updatedAt: Date;
}

interface Connection {
  id: string;
  sourceId: string;      // Resource.id
  targetId: string;      // Resource.id
  type: ConnectionType;
  label?: string;        // freeform description of relationship
  createdAt: Date;
}
```

### Dexie Schema

```typescript
const db = new Dexie("NexusDB");
db.version(1).stores({
  resources: "id, title, type, source, createdAt, updatedAt, archived",
  tags: "id, &name",
  resourceTags: "[resourceId+tagId], resourceId, tagId",
  notes: "id, resourceId, createdAt",
  connections: "id, sourceId, targetId, type, createdAt",
});
```

---

## Feature Breakdown by Phase

### Phase 1 — Core Data + Quick Capture (MVP)

**Goal:** Get data IN fast, see it, search it.

1. **Dexie database layer** with all tables above
2. **Quick Capture panel** — a minimal form:
   - URL field (auto-fetches title/favicon via client-side fetch or og:tags)
   - Title (editable, auto-populated)
   - Content/snippet textarea
   - Type selector (link, snippet, note)
   - Source selector (web, reddit, twitter, etc.)
   - Tag picker (create-on-the-fly with combobox)
   - "Save" → writes to IndexedDB
3. **Chrome Extension (Manifest V3)**
   - Context menu: "Save to Nexus"
   - Popup with the same quick-capture form, pre-filled with current tab URL + selected text
   - Communicates with main app via `BroadcastChannel` or by writing directly to IDB
4. **Bookmarklet** (no-install fallback)
   - Opens a small popup window pointing to `/capture?url=...&title=...&text=...`
   - Main app reads query params and pre-fills the form
5. **Resource list view**
   - Sortable/filterable table of all resources
   - Filter by: tags, type, source, date range, archived status
   - Inline preview (expand row to see content + notes)
6. **Full-text search** (Fuse.js)
   - Searches across: title, content, note bodies, tag names
   - Debounced search bar always visible in header
   - Results ranked by relevance with highlighted matches

### Phase 2 — Graph Visualization + Connections

**Goal:** See and build relationships between resources.

7. **Connection manager**
   - From any resource detail view: "Connect to..." button
   - Search/select target resource
   - Choose connection type + optional label
   - Bidirectional display (resource A shows connection to B, and vice versa)
8. **Interactive graph view** (react-force-graph-2d)
   - Nodes = resources (colored by type or primary tag)
   - Edges = connections (styled by connection type)
   - Node size = number of connections (more connected = larger)
   - Click node → opens resource detail sidebar
   - Click edge → shows connection label
   - Zoom, pan, drag to reorganize
   - Filter graph by tags, types, date range
   - Subgraph view: select a resource → show only its N-degree neighborhood
9. **Tag-based clustering**
   - Toggle: group nodes by shared tags
   - Visual clusters with tag-colored halos

### Phase 3 — Notes, Import, Export

**Goal:** Deepen annotations and portability.

10. **Rich notes editor**
    - Markdown editor (with preview) attached to each resource
    - Multiple notes per resource (threaded, timestamped)
    - Cross-reference: type `[[` to link to another resource inline
11. **JSON export/import**
    - Full database export as a single JSON file
    - Import from JSON (merge or replace)
    - Designed to be committed to a GitHub repo as a backup
12. **Source importers** (modular, one at a time)
    - Notion export (JSON/CSV) → Resources
    - Reddit saved posts (via Reddit JSON export) → Resources
    - Twitter/X bookmarks (via data export) → Resources
    - Browser bookmarks (HTML export) → Resources

### Phase 4 — Polish + Power Features

13. **Keyboard shortcuts** (CMD+K command palette)
14. **Bulk operations** (multi-select → tag, archive, connect, delete)
15. **Dashboard** with stats (total resources, tags, recent activity, orphaned nodes)
16. **PWA support** (offline, installable)
17. **Optional: AI-assisted tagging** (call an LLM API to suggest tags/connections)

---

## Project Structure

```
nexus/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── index.html
├── public/
│   └── icons/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── db/
│   │   ├── schema.ts          # Dexie DB definition + interfaces
│   │   ├── resources.ts       # CRUD operations for resources
│   │   ├── tags.ts            # CRUD operations for tags
│   │   ├── connections.ts     # CRUD operations for connections
│   │   ├── notes.ts           # CRUD operations for notes
│   │   └── export.ts          # JSON import/export
│   ├── store/
│   │   ├── useResourceStore.ts
│   │   ├── useSearchStore.ts
│   │   └── useGraphStore.ts
│   ├── hooks/
│   │   ├── useSearch.ts       # Fuse.js integration
│   │   ├── useCapture.ts      # Quick capture logic
│   │   └── useGraph.ts        # Graph data preparation
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── capture/
│   │   │   ├── CaptureForm.tsx
│   │   │   └── TagCombobox.tsx
│   │   ├── resources/
│   │   │   ├── ResourceList.tsx
│   │   │   ├── ResourceCard.tsx
│   │   │   ├── ResourceDetail.tsx
│   │   │   └── ResourceFilters.tsx
│   │   ├── graph/
│   │   │   ├── GraphView.tsx
│   │   │   ├── GraphControls.tsx
│   │   │   └── NodeTooltip.tsx
│   │   ├── connections/
│   │   │   ├── ConnectionForm.tsx
│   │   │   └── ConnectionList.tsx
│   │   ├── notes/
│   │   │   ├── NoteEditor.tsx
│   │   │   └── NoteList.tsx
│   │   └── search/
│   │       ├── SearchBar.tsx
│   │       └── SearchResults.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── ResourcesPage.tsx
│   │   ├── GraphPage.tsx
│   │   └── CapturePage.tsx     # For bookmarklet redirect
│   ├── lib/
│   │   ├── metadata.ts        # URL metadata extraction
│   │   ├── search.ts          # Fuse.js config
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── extension/                  # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── background.ts
│   ├── popup.html
│   ├── popup.tsx
│   └── content.ts
└── tests/
    ├── db/
    ├── components/
    └── hooks/
```

---

## Implementation Plan

| Sprint | Duration | Deliverables                                                                 |
| ------ | -------- | ---------------------------------------------------------------------------- |
| 1      | 3 days   | Project scaffolding, Dexie DB layer, TypeScript types, basic CRUD operations |
| 2      | 3 days   | CaptureForm component, TagCombobox, resource creation flow                   |
| 3      | 3 days   | ResourceList with filtering/sorting, ResourceDetail view                     |
| 4      | 2 days   | Fuse.js search integration, SearchBar, search results view                   |
| 5      | 3 days   | Chrome Extension (Manifest V3) — popup, context menu, IDB communication     |
| 6      | 1 day    | Bookmarklet capture fallback                                                 |
| 7      | 3 days   | Connection CRUD, ConnectionForm, bidirectional display                        |
| 8      | 4 days   | Graph visualization with react-force-graph-2d, filtering, subgraph view      |
| 9      | 3 days   | Notes editor (markdown), cross-references                                    |
| 10     | 2 days   | JSON export/import, GitHub-friendly backup format                            |
| 11     | 3 days   | Source importers (Notion, Reddit, Twitter, bookmarks)                        |
| 12     | 2 days   | Dashboard, keyboard shortcuts, bulk operations, PWA                          |

**Total estimate: ~32 working days for the full feature set.**
**MVP (Sprints 1–6): ~15 days.**

---

## Key Design Decisions & Rationale

**Dexie.js over sql.js/WASM:** Dexie wraps IndexedDB with a clean Promise API, supports compound indexes and live queries (`useLiveQuery` hook for reactive UI), and adds zero WASM bundle overhead. IndexedDB is universally supported and has generous storage limits (~50% of disk on Chrome).

**Fuse.js over IDB cursors for search:** IndexedDB doesn't support full-text search natively. Fuse.js gives us fuzzy matching, weighted fields, and configurable scoring — all in-memory, which is fast for the scale of a personal knowledge base (thousands, not millions of records).

**react-force-graph-2d over D3 directly:** Wraps d3-force with a React component API, handles WebGL/Canvas rendering for performance, and gives us zoom/pan/click for free. The 2D variant keeps the graph readable without the complexity of 3D navigation.

**Zustand over Redux/Context:** Minimal boilerplate, works great with async Dexie operations, and avoids the Context re-render issues that plague large React trees.

**Nanoid for IDs:** Compact, URL-safe, collision-resistant. No auto-increment needed since we're not in a relational DB.

**BroadcastChannel for extension → app communication:** Both the extension and the main app share the same origin's IndexedDB. The extension writes directly to IDB, then sends a BroadcastChannel message to tell the open app tab to refresh. No server needed.

---

## Data Portability / GitHub Strategy

The entire database can be exported as a single `nexus-backup.json`:

```json
{
  "version": 1,
  "exportedAt": "2026-03-10T12:00:00Z",
  "resources": [...],
  "tags": [...],
  "resourceTags": [...],
  "notes": [...],
  "connections": [...]
}
```

Commit this file to a GitHub repo on a schedule (manual or via a "Save to file" button). On a new machine, import the JSON to hydrate IndexedDB. This gives you version history of your knowledge base for free via Git.

---

## Getting Started (Dev)

```bash
# Create project
npm create vite@latest nexus -- --template react-ts
cd nexus

# Install dependencies
npm install dexie dexie-react-hooks fuse.js react-force-graph-2d zustand nanoid
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react

# Run dev server
npm run dev
```
