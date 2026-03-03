---
tag: architecture
state: closed
---

# 0047 — Node Engine Requirements and CI Matrix Mismatch

## Problem

The CI matrix (issue 0008) tests on Node 18, 20, and 22. However, the project's key dev dependency **Vite 7.3.1** requires:

```
"engines": { "node": "^20.19.0 || >=22.12.0" }
```

Node 18 is **not supported** by Vite 7. This means:

1. The Node 18 CI job will fail at build or test steps (Vite will refuse to run or behave unpredictably).
2. `package.json` has no `engines` field, so neither npm nor consumers know which Node versions are required.
3. The CI matrix wastes time testing an unsupported configuration.

## Fix

### 1. Add `engines` field to `package.json`

Declare the minimum Node version required for development:

```json
{
  "engines": {
    "node": ">=20.19.0"
  }
}
```

### 2. Update CI matrix to match

In `.github/workflows/ci.yml`, remove Node 18 from the matrix and use specific minor versions that satisfy Vite's requirement:

```yaml
strategy:
  matrix:
    node-version: [20, 22]
```

### 3. Update issue 0008 CI spec

The CI specification in issue 0008 originally called for Node 18, 20, and 22. Node 18 reached end-of-life in April 2025 and is no longer an Active LTS version. The matrix should reflect currently supported Node versions only.

## Verification

1. `node -e "const p = require('./package.json'); console.log(p.engines)"` shows the `engines` field
2. `.github/workflows/ci.yml` matrix does not include Node 18
3. CI pipeline passes on all matrix entries
4. `npm run build` exits 0 on Node 20 and Node 22

## Architect Notes

Partial progress as of commit `7c0376ef`:

- **CI matrix updated** -- Node 18 removed, matrix is now `[20, 22]`. CI passes on both. DONE.
- **`engines` field still missing** -- `package.json` has no `engines` field. This is the remaining work item. Without it, consumers and CI have no declared Node version requirement.

Verified as of commit `ec552f3` (which also fixed issue 0048) — `package.json` now declares `"engines": { "node": ">=20.19.0" }`. Both items complete. Closing.
