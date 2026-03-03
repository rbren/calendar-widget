---
tag: architecture
state: open
---

# 0055 — `useCalendarState` Does Not Sync With External `value` Changes

## Problem

The `useCalendarState` hook initializes `viewDate` and `focusedDate` from the `value` prop via `useState`:

```ts
const initialDate = value instanceof Date ? value : new Date();
const [viewDate, setViewDate] = useState(
  new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
);
const [focusedDate, setFocusedDate] = useState(initialDate);
```

`useState` only uses its argument for the **initial** render. If the consumer later changes the `value` prop (e.g., programmatically selecting a date from a text input, or resetting the selection), the hook's `viewDate` and `focusedDate` remain stale:

1. **The calendar stays on the old month.** If `value` changes from March 15 to August 1, the calendar still displays March.
2. **Keyboard navigation starts from the wrong date.** The roving tabindex is anchored to `focusedDate`, which still points to the old date.
3. **Switching from a `Date` to `null` (clearing selection) has no visible effect on the calendar view.** The view stays on whatever month was previously displayed from the initial value.

This breaks the contract of a controlled component. Consumers who manage `value` externally (controlled mode) expect the calendar to reflect prop changes.

## Fix

Add a `useEffect` (or equivalent synchronization logic) that updates `viewDate` and `focusedDate` when the `value` prop changes from external sources. Take care to avoid infinite update loops — the sync should only fire when the value prop's date identity meaningfully changes (i.e., a different calendar day), not on every render.

A suggested approach:

```ts
useEffect(() => {
  if (value instanceof Date) {
    const newMonth = value.getMonth();
    const newYear = value.getFullYear();
    setViewDate((prev) => {
      if (prev.getMonth() !== newMonth || prev.getFullYear() !== newYear) {
        return new Date(newYear, newMonth, 1);
      }
      return prev;
    });
    setFocusedDate((prev) => {
      if (!isSameDay(prev, value)) {
        return value;
      }
      return prev;
    });
  }
}, [value]);
```

When `value` is `null` or an array, decide on reasonable behavior:
- `null`: Keep the current view (do not navigate away). This avoids jarring jumps when clearing selection.
- `Date[]`: Optionally sync to the first/last date in the array, or keep current view.

## Verification

1. Render `<CalendarWidget value={dateA} />`, then re-render with `value={dateB}` where `dateB` is in a different month. The calendar should navigate to `dateB`'s month.
2. After an external value change, pressing arrow keys should start navigation from the new `value`, not the old `focusedDate`.
3. Changing `value` to `null` should not crash or navigate unexpectedly.
4. Internal navigation (clicking prev/next month) should still work normally after an external value update.
5. All existing tests continue to pass.
