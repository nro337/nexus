# Nexus — Personal Knowledge Graph

[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/nro337/nexus/badge)](https://scorecard.dev/viewer/?uri=github.com/nro337/nexus)

A local-first browser application for collecting, organizing, and connecting information from across the web. Runs entirely in-browser with no backend — your data stays in IndexedDB.

## Features

- **Quick Capture** — Save links, snippets, and notes via the app, Chrome extension, or bookmarklet (Cmd+K)
- **Smart Organization** — Tag resources, filter by type/source, full-text fuzzy search
- **Knowledge Graph** — Visualize connections between resources as an interactive force-directed graph
- **Data Portability** — Export your entire knowledge base as JSON, commit to Git for version history

## Tech Stack

- React 18 + TypeScript + Vite
- Dexie.js (IndexedDB) for local storage
- Fuse.js for fuzzy full-text search
- react-force-graph-2d for graph visualization
- Zustand for state management
- Tailwind CSS v4

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Chrome Extension

1. Navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` directory
4. Use the extension popup or right-click context menu to save pages to Nexus

## Bookmarklet

Visit `/bookmarklet.html` from your running Nexus instance to install the bookmarklet.

## Data Export

From the app, export your data as `nexus-backup.json` and commit to this repo for version history.

## Project Structure

```
src/
├── db/           # Dexie database schema + CRUD operations
├── store/        # Zustand state stores
├── components/   # React components (layout, capture, resources, graph, search)
├── pages/        # Page-level components
├── lib/          # Utilities (search, metadata, helpers)
└── types/        # TypeScript type definitions

extension/        # Chrome Extension (Manifest V3)
```

## License

Private / Personal Use
