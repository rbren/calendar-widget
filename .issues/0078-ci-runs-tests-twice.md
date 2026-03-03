---
tag: architecture
state: review
---

# 0078 — CI Workflow Runs Test Suite Twice

## Problem

The CI workflow (`.github/workflows/ci.yml`) executes both:

```yaml
- run: npm test            # vitest run
- run: npm run test:coverage  # vitest run --coverage
```

`npm run test:coverage` runs the full test suite and then generates a coverage report. The preceding `npm test` step runs the exact same test suite without coverage. This means every CI run executes 259 tests twice, doubling test execution time (~15s × 2 = ~30s of test time per matrix entry, across 2 Node versions).

There is no benefit to running tests without coverage first:

- If tests fail, `test:coverage` will catch the failure.
- If tests pass, the coverage report is always useful.
- Coverage thresholds (80% per category) are already configured in `vitest.config.ts` and enforced by the `test:coverage` run.

## Fix

Remove the `npm test` step from the CI workflow, keeping only `npm run test:coverage`:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
      cache: 'npm'
  - run: npm ci
  - run: npm audit --audit-level=high
  - run: npm run format:check
  - run: npm run lint
  - run: npm run typecheck
  - run: npm run test:coverage
  - run: npm run build
```

This halves test execution time in CI without losing any signal.

### Optional enhancement

Rename the `test` script to run coverage by default, so `npm test` always produces coverage:

```json
{
  "scripts": {
    "test": "vitest run --coverage",
    "test:watch": "vitest"
  }
}
```

This simplifies CI to just `npm test` and ensures local runs also produce coverage data. The `test:coverage` script can be removed as it would be redundant.

## Verification

1. Remove the `- run: npm test` step from `.github/workflows/ci.yml`.
2. Push and verify CI still passes on all matrix entries.
3. Coverage report is still generated and thresholds are enforced.
4. Total CI duration decreases by ~15s per matrix entry.
