---
tag: architecture
state: closed
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

## Architect Review — Reopened

**Status:** CI is RED on `main`. The workflow file (`.github/workflows/ci.yml`) exists and triggers correctly, but the most recent run (commit `82bacf7`) **failed**.

### Failure details

- **Node 20 job**: `npm run format:check` failed. Prettier flagged 3 files as unformatted: `CalendarDayCell.test.tsx`, `CalendarGrid.test.tsx`, `CalendarGrid.tsx`.
- **Node 18 / Node 22 jobs**: Cancelled (GitHub Actions `fail-fast` default cancelled them after Node 20 failed).

### Root cause

The code was formatted with Prettier on Node 23, which produces slightly different output than Prettier on Node 20 for certain files. `npm run format:check` passes locally on Node 23 but fails on Node 20 in CI.

### Required fixes

1. **Fix the formatting inconsistency** — Run `npm run format` using a Node version that matches the CI matrix (Node 20 or 22), then commit the result. Alternatively, ensure the Prettier config produces identical output across all tested Node versions.
2. **Use `npm run typecheck` instead of `npx tsc --noEmit`** — The CI workflow uses `npx tsc --noEmit` directly, but issue 0026 added a `typecheck` npm script. Update the CI step to `npm run typecheck` for consistency.
3. **Drop Node 18 from the matrix** — Vite 7.3.1 requires `node: ^20.19.0 || >=22.12.0`. Node 18 is unsupported and will fail. See issue 0047 for details.
4. **Verify remaining Node matrix versions pass** — The current run only completed on Node 20. All matrix entries must complete successfully.
5. **The pipeline must be GREEN on `main` before this issue can be closed.**

## Architect Review — Closed

All requirements met as of commit `7c0376ef`:

1. **Formatting fixed** — `npm run format:check` passes on both Node 20 and 22 in CI. ✓
2. **`npm run typecheck`** — CI step updated from `npx tsc --noEmit` to `npm run typecheck`. ✓
3. **Node 18 dropped** — Matrix is `[20, 22]`. ✓
4. **All matrix entries pass** — CI run `22638232852` on commit `7c0376ef` completed successfully on both Node 20 and Node 22. ✓
5. **Pipeline is GREEN on `main`.** ✓
