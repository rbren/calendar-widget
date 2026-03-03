---
tag: architecture
state: open
---

# 0025 — React Peer Dependency Range Too Narrow

## Problem

The `peerDependencies` in `package.json` are pinned to `^19.2.4` for both `react` and `react-dom`:

```json
{
  "peerDependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  }
}
```

This means any project still on React 18 (which remains very widely used) cannot install this widget without peer dependency warnings or errors. This severely limits adoption. The calendar widget does not use any React 19-only APIs (like `use()`, `useActionState`, server components, etc.), so there is no technical reason to exclude React 18.

## Fix

Widen the peer dependency range to accept React 18 or 19:

```json
{
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

The `devDependencies` can stay pinned to React 19 (that's the version used for development and testing). Only the `peerDependencies` range needs to be widened.

If React 19-specific APIs are adopted in the future, the minimum can be raised at that time with a major version bump.

## Verification

1. Confirm `package.json` `peerDependencies` shows the widened range
2. Run `npm install` — no errors
3. Run `npm run build` — exits 0
4. Run `npm test` — exits 0
5. In a separate test project with React 18 installed, run `npm install <path-to-tarball>` and confirm no peer dependency warnings
