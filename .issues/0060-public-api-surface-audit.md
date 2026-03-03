---
tag: architecture
state: open
---

# 0060 — Public API Surface Needs Explicit Boundaries

## Problem

The barrel export (`src/index.ts`) has grown to export a large number of symbols without an explicit decision about what constitutes the public API:

```ts
// Components (4)
export { CalendarWidget, CalendarHeader, CalendarGrid, CalendarDayCell }

// Hooks (1)
export { useCalendarState }

// Types (5)
export type { DateRange, CalendarWidgetProps, CalendarHeaderProps, CalendarGridProps, CalendarDayCellProps }

// Utilities (8)
export { getCalendarDays, isSameDay, isDateInRange, isDateDisabled, isDateRange, isDateBetween, formatMonthYear, formatDayLabel }
```

Every symbol exported from the barrel is part of the package's **semver contract**. Changing the signature of `isSameDay`, renaming `formatDayLabel`, or altering the return type of `useCalendarState` would be a breaking change requiring a major version bump.

### Concerns

1. **Utility functions are implementation details.** Functions like `isSameDay`, `isDateBetween`, `isDateInRange`, `isDateDisabled`, and `getCalendarDays` are internal helpers used by components and hooks. Exporting them locks their signatures. Consumers who depend on them will break if the internal date logic is refactored (e.g., switching to a date library, changing parameter order).

2. **`formatDayLabel` is tightly coupled to component internals.** Its `flags` parameter shape mirrors the component's internal state, not a general-purpose API. Exporting it invites consumers to use it in ways that will break when the component's accessibility approach evolves.

3. **`useCalendarState` exposes the full internal state machine.** The hook's return type includes `rangeStart`, `hoveredDate`, `hoverDate`, `focusDate`, and other internal concerns. This is useful for advanced composition but creates a very wide API contract. Any internal state restructuring becomes a breaking change.

4. **No documentation distinguishes "stable" vs "advanced/experimental" exports.** Consumers cannot tell which exports are safe to rely on long-term.

## Recommendation

Adopt a tiered export strategy:

### Tier 1 — Stable Public API (main barrel)

Only export symbols that are part of the documented, supported API:

```ts
// src/index.ts
export { CalendarWidget } from './components/CalendarWidget';
export type { CalendarWidgetProps, DateRange } from './types/calendar';
```

### Tier 2 — Advanced / Composition API (sub-path export)

For consumers who want to compose custom layouts, expose sub-components and hooks via a separate entry point:

```ts
// src/advanced.ts (or src/composition.ts)
export { CalendarHeader, CalendarGrid, CalendarDayCell } from './components/...';
export { useCalendarState } from './hooks/useCalendarState';
export type { CalendarHeaderProps, CalendarGridProps, CalendarDayCellProps } from './types/calendar';
```

Add a sub-path export to `package.json`:

```json
{
  "exports": {
    ".": { "types": "...", "import": "...", "require": "..." },
    "./advanced": { "types": "...", "import": "...", "require": "..." },
    "./style.css": "./dist/style.css"
  }
}
```

### Tier 3 — Do Not Export

Internal utilities (`isSameDay`, `isDateBetween`, `getCalendarDays`, `formatMonthYear`, `formatDayLabel`, `isDateInRange`, `isDateDisabled`, `isDateRange`) should **not** be part of the public API. They are implementation details. If consumers need date utilities, they should use established libraries like `date-fns`.

## Alternative: Keep Current Exports But Document the Contract

If the team prefers a single flat export, at minimum:

1. Add JSDoc `@public` / `@internal` tags to every exported symbol.
2. Document in the README which exports are stable and which are subject to change.
3. Add a `@since` tag so consumers know when each export was introduced.

## Verification

- The barrel export (`src/index.ts`) contains only intentionally public symbols.
- `npm pack --dry-run` shows no unexpected type declarations.
- README or API docs clearly indicate which exports are stable vs advanced.
