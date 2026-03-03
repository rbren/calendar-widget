---
tag: architecture
state: open
---

# 0008 — CI/CD Pipeline

## Problem

There is no continuous integration configuration. Without automated CI, lint failures, type errors, test regressions, and build breakages will go unnoticed until they compound. Every PR must be gated on a green pipeline.

## Requirements

### GitHub Actions workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run format:check
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test
      - run: npm run test:coverage
      - run: npm run build
```

### Key design decisions

1. **Matrix across Node versions** — Test on the active LTS versions (18, 20) and current (22) to ensure broad compatibility.
2. **`npm ci`** — Use `ci` (not `install`) for reproducible installs from `package-lock.json`.
3. **Ordered steps** — Format check and lint run first (fast, cheap) before tests and build (slower).
4. **All quality gates in one job** — Keeps the pipeline simple for a single-package repo. Split into parallel jobs only if CI time exceeds ~5 minutes.

### Branch protection

After the workflow is in place, configure the `main` branch to:
- Require the `quality` job to pass before merging
- Require at least one approving review (when the team grows)

### npm scripts prerequisite

This issue depends on issues 0001–0004 being complete so that the following scripts exist and work:
- `format:check` (issue 0002)
- `lint` (issue 0002)
- `test` (issue 0004)
- `test:coverage` (issue 0004)
- `build` (issue 0003)

## Verification

- Push a branch → the GitHub Actions workflow triggers and all steps pass
- Introduce a deliberate lint error on a branch → the `lint` step fails and the PR is blocked
- Introduce a failing test → the `test` step fails
- `npm run build` output is not committed (`.gitignore` covers `dist/`)
