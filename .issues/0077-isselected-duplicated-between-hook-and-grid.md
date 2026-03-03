---
tag: architecture
state: review
---

# 0077 — `isSelected` Logic Duplicated Between useCalendarState and CalendarGrid

## Problem

Selection-checking logic is defined in two separate places with different behavior:

### 1. `useCalendarState.ts` (line 217)

```ts
const isSelected = useCallback(
  (date: Date): boolean => {
    if (!value) return false;
    if (value instanceof Date) return isSameDay(date, value);
    if (isDateRange(value)) {
      return isSameDay(date, value.start) || isSameDay(date, value.end);
    }
    if (Array.isArray(value)) return value.some((v) => isSameDay(date, v));
    return false;
  },
  [value],
);
```

### 2. `CalendarGrid.tsx` (line 42)

```ts
const isSelected = (date: Date): boolean => {
  if (mode === 'range' && rangeStart && !isDateRange(value)) {
    return isSameDay(date, rangeStart);
  }
  if (!value) return false;
  if (value instanceof Date) return isSameDay(date, value);
  if (isDateRange(value)) {
    return isSameDay(date, value.start) || isSameDay(date, value.end);
  }
  if (Array.isArray(value)) return value.some((v) => isSameDay(date, v));
  return false;
};
```

### Divergence

The CalendarGrid version handles the **range-in-progress** case: when `mode === 'range'` and the user has clicked the first date (`rangeStart` is set) but has not yet clicked the second date, the pending start date is shown as selected. The hook version **does not** handle this case — it only checks the committed `value`.

### Impact

1. **Broken public API**: `useCalendarState` returns `isSelected` as part of its public contract (exported from the barrel via the hook). External consumers who build custom grid components using `useCalendarState().isSelected()` will not see the pending range start as selected, causing visual inconsistency with the built-in CalendarGrid.

2. **Code duplication**: The core selection logic (4 branches: null, Date, DateRange, Date[]) is repeated verbatim. If the selection logic needs to change (e.g., to support a new value type), both copies must be updated in lockstep.

3. **Dead code internally**: `CalendarWidget.tsx` does not destructure or use `isSelected` from the hook — it relies entirely on CalendarGrid's internal copy. The hook's version is unreachable from the built-in widget.

## Fix

### Option A — Single source of truth in the hook (recommended)

1. Update `useCalendarState.isSelected` to also consider `rangeStart`:

   ```ts
   const isSelected = useCallback(
     (date: Date): boolean => {
       if (mode === 'range' && rangeStart && !isDateRange(value)) {
         return isSameDay(date, rangeStart);
       }
       if (!value) return false;
       if (value instanceof Date) return isSameDay(date, value);
       if (isDateRange(value)) {
         return isSameDay(date, value.start) || isSameDay(date, value.end);
       }
       if (Array.isArray(value)) return value.some((v) => isSameDay(date, v));
       return false;
     },
     [mode, value, rangeStart],
   );
   ```

2. Pass `isSelected` from the hook's return value through `CalendarWidget` → `CalendarGrid` as a prop (add `isSelected: (date: Date) => boolean` to `CalendarGridProps`).

3. Remove the inline `isSelected` function from `CalendarGrid.tsx`.

This ensures external consumers of `useCalendarState` get correct behavior, and there is only one definition.

### Option B — Remove `isSelected` from the hook

If the team decides `isSelected` is not a useful public API (since it requires knowledge of the internal `rangeStart` state), remove it from the hook's return value entirely. CalendarGrid keeps its own copy, and consumers who need selection logic can derive it from `value` and `rangeStart` (both already returned by the hook).

## Verification

1. In range mode, click one date to start a range. The clicked date should appear selected. Verify this works both in the built-in widget and when using `useCalendarState().isSelected()` directly.
2. `npm test` passes.
3. `grep -rn 'isSelected' src/` shows only one definition of the selection logic (either in the hook or in CalendarGrid, not both).
