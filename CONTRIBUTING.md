# Contributing to Nexus

Thank you for your interest in contributing to Nexus! This document explains how to get involved.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/nexus.git
   cd nexus
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your change:
   ```bash
   git checkout -b feat/my-feature
   ```

## How to Contribute

### Reporting Bugs

Before filing a bug report, please check the [existing issues](https://github.com/nro337/nexus/issues) to avoid duplicates.

When filing a bug, include:
- A clear, descriptive title.
- Steps to reproduce the issue.
- Expected vs. actual behaviour.
- Browser name and version.
- Any relevant console errors or screenshots.

### Suggesting Features

Feature requests are welcome. Please open an issue with:
- A clear description of the proposed feature.
- The problem it solves or the use case it addresses.
- Any relevant examples or mockups.

### Submitting Pull Requests

1. Ensure your branch is up to date with `main`.
2. Run the linter and tests before pushing:
   ```bash
   npm run lint
   npm test
   ```
3. Open a pull request against the `main` branch.
4. Fill in the pull request template — describe *what* changed and *why*.
5. Link any related issues with `Closes #<issue-number>`.
6. A maintainer will review your PR and may request changes.

## Development Setup

```bash
npm run dev      # Start the dev server at http://localhost:5173
npm run build    # Type-check and build for production
npm run lint     # Run ESLint
npm test         # Run the test suite (Vitest)
```

For Chrome Extension development, load the `extension/` directory as an unpacked extension in `chrome://extensions` (Developer mode enabled).

## Coding Guidelines

- **TypeScript** — all new code must be typed; avoid `any`.
- **React** — prefer functional components with hooks.
- **Styles** — use Tailwind CSS utility classes; avoid inline styles.
- **State** — go through the Zustand stores rather than calling `db` directly from components.
- **IDs** — use `generateId()` from `src/lib/utils.ts` (nanoid) for all new entities.
- Keep pull requests small and focused on a single concern.

## Commit Messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short summary>
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

Example: `feat(graph): add zoom-to-fit button`

## Attribution

Nexus is licensed under the [MIT License](LICENSE). By contributing, you agree that your contributions will be licensed under the same terms.
