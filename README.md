<p align="center">
  <img src="assets/banner.svg" alt="Nexus — Personal Knowledge Graph" width="100%"/>
</p>

[![CI](https://github.com/nro337/nexus/actions/workflows/ci.yml/badge.svg)](https://github.com/nro337/nexus/actions/workflows/ci.yml)
[![CodeQL](https://github.com/nro337/nexus/actions/workflows/codeql.yml/badge.svg)](https://github.com/nro337/nexus/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/nro337/nexus/badge)](https://scorecard.dev/viewer/?uri=github.com/nro337/nexus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

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

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on reporting bugs, requesting features, and submitting pull requests.

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to abide by its terms.

## Security

To report a vulnerability, please follow the process described in [SECURITY.md](SECURITY.md). **Do not open a public issue for security reports.**

## License

[MIT](LICENSE) © nro337 — open source with attribution required (keep the copyright notice).
