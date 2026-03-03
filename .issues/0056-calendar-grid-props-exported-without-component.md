---
tag: architecture
state: closed
---

# 0056 — `CalendarGridProps` Type Exported Without `CalendarGrid` Component

## Problem

The barrel export (`src/index.ts`) exports the `CalendarGridProps` type but does **not** export the `CalendarGrid` component:

```ts
// Components
export { CalendarWidget } from './components/CalendarWidget';
export { CalendarHeader } from './components/CalendarHeader';
export { CalendarDayCell } from './components/CalendarDayCell';

// Types
export type {
  CalendarWidgetProps,
  CalendarHeaderProps,
  CalendarGridProps,      // ← exported
  CalendarDayCellProps,
} from './types/calendar';
```

This creates an inconsistency in the public API:

- A consumer can import `CalendarGridProps` but cannot import `CalendarGrid`, making the type useless.
- `CalendarHeader` and `CalendarDayCell` are exported as both component and type, but `CalendarGrid` gets different treatment with no documented reason.
- If `CalendarGrid` is intentionally internal, its props type should not be part of the public API surface.

## Fix

Choose one of two approaches:

### Option A: Export `CalendarGrid` (recommended if the component is useful for custom layouts)

Add the component to the barrel export:

```ts
export { CalendarGrid } from './components/CalendarGrid';
```

This lets advanced consumers compose their own calendar layouts using the grid directly.

### Option B: Remove `CalendarGridProps` from exports (if the grid is strictly internal)

Remove the type from the barrel:

```ts
export type {
  CalendarWidgetProps,
  CalendarHeaderProps,
  // CalendarGridProps removed
  CalendarDayCellProps,
} from './types/calendar';
```

**Recommendation:** Option A is preferred. Exporting all sub-components gives advanced users composition flexibility, which is a common pattern in component libraries. The types are already public in the generated `.d.ts` files, so there is no size or security reason to hide them.

## Verification

- If Option A: `import { CalendarGrid } from '@calendar-widget/core'` resolves without error.
- If Option B: `CalendarGridProps` does not appear in `dist/types/index.d.ts`.
- `npm run build` succeeds.
- `npm run typecheck` succeeds.
- All existing tests pass.

## Architect Notes

Closed as of commit `a87c45d` (review at `2026-03-03T20:00Z`).

Option A was implemented in commit `a87c45d`: `CalendarGrid` is now exported from the barrel alongside `CalendarWidget`, `CalendarHeader`, and `CalendarDayCell`. Additionally, `useCalendarState` hook and all date utility functions were also added to the barrel export. See issue 0060 for a review of the overall public API surface.
