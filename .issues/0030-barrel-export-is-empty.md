---
tag: architecture
state: review
---

# 0030 — Barrel Export (`src/index.ts`) Is Empty

## Problem

`src/index.ts` currently contains only:

```ts
export {};
```

This means the library exports nothing. Running `npm run build` produces empty output:

```
Generated an empty chunk: "index".
dist/calendar-widget.mjs  0.00 kB
```

Consumers who install the package cannot import any components, hooks, types, or utilities. The library is non-functional as a distributable.

Meanwhile, source files exist under `src/components/`, `src/hooks/`, `src/utils/`, and `src/types/` that define the public API described in issue 0005.

## Requirements

Update `src/index.ts` to re-export all public API surface:

```ts
// Components
export { CalendarWidget } from './components/CalendarWidget';
export { CalendarHeader } from './components/CalendarHeader';
export { CalendarDayCell } from './components/CalendarDayCell';

// Hooks
export { useCalendarState } from './hooks/useCalendarState';

// Types
export type {
  CalendarWidgetProps,
  CalendarHeaderProps,
  CalendarGridProps,
  CalendarDayCellProps,
} from './types/calendar';

// Utilities (optional — expose only if they're part of the public API)
export {
  getCalendarDays,
  isSameDay,
  isDateInRange,
  isDateDisabled,
  formatMonthYear,
} from './utils/dates';
```

**Note:** `CalendarWidget` and `CalendarGrid` components do not yet exist (they are part of issue 0005). The barrel export should be updated incrementally as components are implemented. At minimum, export whatever is currently implemented and functional.

### Design decisions

- **Export types with `export type`** — Ensures types are erased at runtime and don't create unnecessary imports.
- **Consider what's public** — Internal utilities or sub-components that consumers shouldn't depend on can be left unexported. At minimum, `CalendarWidget` and `CalendarWidgetProps` must be exported.
- **Export utilities cautiously** — Date utility functions are useful for consumers but commit the library to a stable API for those functions. If uncertain, keep them internal initially.

## Verification

1. `npm run build` exits 0 and produces non-empty output bundles
2. `dist/calendar-widget.mjs` is not 0 bytes
3. `dist/types/index.d.ts` contains the exported type declarations
4. A consumer project can `import { CalendarWidget } from '@calendar-widget/core'` without errors
