---
tag: architecture
state: open
---

# 0057 — CI Pipeline Missing `npm audit` Step

## Problem

Issue 0011 specifies that `npm audit --audit-level=high` should be a step in the CI pipeline, running immediately after `npm ci` to fail fast on known vulnerabilities. The current CI workflow (`.github/workflows/ci.yml`) does not include this step:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
      cache: 'npm'
  - run: npm ci
  # ← npm audit should be here
  - run: npm run format:check
  - run: npm run lint
  - run: npm run typecheck
  - run: npm test
  - run: npm run test:coverage
  - run: npm run build
```

Without this step, a dependency with a known high-severity vulnerability could be silently merged and shipped. The `npm audit` command currently passes cleanly (`0 vulnerabilities`), so adding this step will not break CI.

## Fix

Add the audit step to `.github/workflows/ci.yml` immediately after `npm ci`:

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
  - run: npm test
  - run: npm run test:coverage
  - run: npm run build
```

## Verification

1. The CI pipeline includes `npm audit --audit-level=high` as a step after `npm ci`.
2. CI passes on the main branch (currently 0 vulnerabilities).
3. If a high-severity vulnerability is introduced (e.g., via a compromised transitive dependency), the CI job fails.
