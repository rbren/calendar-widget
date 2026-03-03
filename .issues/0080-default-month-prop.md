---
tag: pm
state: open
---

# 0080 — `defaultMonth` Prop for Initial Displayed Month

## Problem

Currently, the calendar determines its initial displayed month from the `value` prop, falling back to the current month if `value` is `null` or undefined. There is no way to render the calendar showing a specific month without also selecting a date in that month. This is a common need:

- Booking UIs that should open to next month even though nothing is selected yet.
- Event calendars that start on a specific month based on URL parameters.
- Controlled navigation where the parent wants to seed the initial view but let the user navigate freely.

Most calendar libraries (react-day-picker `defaultMonth`, MUI `defaultCalendarMonth`, etc.) support this.

## Requirements

### `defaultMonth` prop

```ts
interface CalendarWidgetProps {
  /** The month to display when the component first mounts, if no `value` is provided.
   *  Accepts any Date — only the year and month are used (day is ignored).
   *  If `value` is set, the calendar opens to the month containing `value` instead.
   *  This is an uncontrolled prop — it only affects the initial render. */
  defaultMonth?: Date;
}
```

### Precedence rules

1. If `value` is a `Date`, display the month containing that date (existing behavior).
2. If `value` is a `DateRange`, display the month containing `value.start` (existing behavior).
3. If `value` is `null`/`undefined` and `defaultMonth` is set, display that month.
4. If neither `value` nor `defaultMonth` is set, display the current month (existing behavior).

### Behavior

- `defaultMonth` is only read on initial mount. Subsequent changes to `defaultMonth` are ignored (uncontrolled pattern).
- The `focusedDate` should default to the 1st of the `defaultMonth` when no `value` is provided.
- After mount, the user can freely navigate away from `defaultMonth`.

## Implementation Notes

1. Add `defaultMonth?: Date` to `CalendarWidgetProps`.
2. In `useCalendarState`, update `getInitialDate()` to check `defaultMonth` when `value` is null:
   ```ts
   const getInitialDate = (): Date => {
     if (value instanceof Date) return value;
     if (isDateRange(value)) return value.start;
     if (defaultMonth) return new Date(defaultMonth.getFullYear(), defaultMonth.getMonth(), 1);
     return new Date();
   };
   ```
3. No other logic changes needed — the rest of the hook already works off `viewDate` state.

## Verification

- Render with `defaultMonth={new Date(2027, 5, 1)}` and no `value` → calendar opens showing June 2027.
- Render with `defaultMonth={new Date(2027, 5, 1)}` and `value={new Date(2026, 0, 15)}` → calendar opens showing January 2026 (value takes precedence).
- Render with no `defaultMonth` and no `value` → calendar shows the current month (unchanged behavior).
- Navigate away from `defaultMonth`, then re-render with a different `defaultMonth` → the view does NOT jump (uncontrolled).
- Unit tests: defaultMonth sets initial view, value overrides defaultMonth, no defaultMonth defaults to today, defaultMonth only used on mount.
