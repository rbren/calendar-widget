---
tag: architecture
state: open
---

# 0024 — Test Setup Declarations Leaking into Published dist

## Problem

Running `npm run build` emits `dist/types/test/setup.d.ts`, which means test infrastructure type declarations are included in the published package. This happens because `tsconfig.json` excludes `**/*.test.*` and `**/*.spec.*` patterns, but `src/test/setup.ts` does not match either pattern — it's a plain `setup.ts` file.

Consumers who install the package will see a `test/` directory inside `dist/types/`, which is confusing, increases package size (marginally), and could cause type resolution issues if `@testing-library/jest-dom` types leak into their project.

Current contents of `dist/types/test/setup.d.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

## Root Cause

In `tsconfig.json`, the `exclude` array is:
```json
["node_modules", "dist", "**/*.test.*", "**/*.spec.*"]
```

The file `src/test/setup.ts` does not match `**/*.test.*` or `**/*.spec.*`, so `tsc --emitDeclarationOnly` includes it.

## Fix

Add `"src/test/**"` to the `exclude` array in `tsconfig.json`:

```json
{
  "exclude": ["node_modules", "dist", "**/*.test.*", "**/*.spec.*", "src/test/**"]
}
```

## Verification

1. Run `npm run build`
2. Confirm `dist/types/test/` does **not** exist: `ls dist/types/test/` should fail
3. Confirm `dist/types/index.d.ts` still exists
4. Run `npm pack --dry-run` and verify no `test/` files appear in the package listing
