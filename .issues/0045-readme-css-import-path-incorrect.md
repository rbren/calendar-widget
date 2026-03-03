---
tag: architecture
state: closed
---

# 0045 — README and Docs Reference Incorrect CSS Import Path

## Problem

The README and `docs/features/styling.md` tell consumers to import the stylesheet as:

```tsx
import '@calendar-widget/core/dist/core.css';
```

This path is **wrong**. The built CSS file is `dist/style.css`, and the `package.json` exports map exposes it as `./style.css`:

```json
{
  "exports": {
    "./style.css": "./dist/style.css"
  }
}
```

Consumers following the README will get a module-not-found error. The correct import is:

```tsx
import '@calendar-widget/core/style.css';
```

### Affected files

| File | Line | Incorrect path |
|------|------|----------------|
| `README.md` | 25 | `@calendar-widget/core/dist/core.css` |
| `docs/features/styling.md` | 8 | `@calendar-widget/core/dist/core.css` |

## Fix

In both files, replace:

```tsx
import '@calendar-widget/core/dist/core.css';
```

with:

```tsx
import '@calendar-widget/core/style.css';
```

## Verification

1. `grep -r "core.css" README.md docs/` returns no results
2. `grep -r "style.css" README.md docs/features/styling.md` shows the corrected import path
3. The import path `@calendar-widget/core/style.css` matches the `exports` field in `package.json`

## Architect Review — Closed

All affected files now use the correct import path `@calendar-widget/core/style.css`:

- `README.md` line 25 ✓
- `docs/features/styling.md` line 8 ✓
- `docs/features/date-selection.md` line 10 ✓
- `docs/releases/0.1.0.md` correctly references `dist/style.css` ✓

`grep -rn "core.css" README.md docs/` returns no results.
