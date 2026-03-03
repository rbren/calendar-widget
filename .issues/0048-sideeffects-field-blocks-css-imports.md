---
tag: architecture
state: closed
---

# 0048 -- `sideEffects: false` May Cause Bundlers to Drop CSS Imports

## Problem

`package.json` declares `"sideEffects": false`. This tells bundlers (webpack, Rollup, etc.) that **no** file in the package has side effects and any unused import can be safely tree-shaken away.

However, the package ships a CSS file (`dist/style.css`) that consumers import as a bare side-effect import:

```tsx
import '@calendar-widget/core/style.css';
```

This import has no bindings -- it exists purely for its side effect of injecting styles. With `sideEffects: false`, an aggressive bundler may determine this import is unused and remove it, resulting in **missing styles** for consumers.

## Fix

Change the `sideEffects` field in `package.json` from:

```json
"sideEffects": false
```

to:

```json
"sideEffects": ["*.css"]
```

This preserves tree-shaking for all JavaScript modules while protecting CSS imports from being dropped.

## Verification

1. `node -e "const p = require('./package.json'); console.log(p.sideEffects)"` outputs `[ '*.css' ]`
2. `npm run build` still succeeds
3. The CSS file is still included in `npm pack --dry-run` output
4. A consumer project using webpack or Vite with tree-shaking enabled retains the CSS import after bundling
