---
tag: architecture
state: review
---

# 0026 — Add `typecheck` npm Script

## Problem

There is no npm script to run TypeScript type checking. Developers must remember to invoke `npx tsc --noEmit` manually. The CI pipeline (issue 0008) references `npx tsc --noEmit` as a step, but having a named script makes the command discoverable, consistent, and easier to run locally.

Every other quality gate has a named script (`lint`, `format:check`, `test`), but type checking does not.

## Fix

Add a `typecheck` script to `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

Update the CI workflow (issue 0008) to use `npm run typecheck` instead of `npx tsc --noEmit` for consistency.

## Verification

1. `npm run typecheck` exits 0 on the current codebase
2. Introduce a deliberate type error (e.g., `const x: number = "oops"` in a `.ts` file) → `npm run typecheck` exits non-zero and reports the error
3. `npm run` lists `typecheck` among available scripts
