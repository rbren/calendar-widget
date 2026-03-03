---
tag: pm
state: open
---

# 0032 — Disabled Date Predicate Function

## Problem

The current `disabledDates` prop (issue 0005) accepts only a static array of `Date` objects. This is impractical for common real-world patterns:

- Disable all weekends → requires generating every Saturday/Sunday in the visible range.
- Disable all dates except Tuesdays and Thursdays → same problem.
- Disable dates based on external availability data → requires rebuilding the array on every month change.
- Disable past dates → requires regenerating the array daily.

A predicate function is the standard solution (used by `react-day-picker`, MUI Date Picker, Ant Design, etc.). Without it, consumers write boilerplate to generate date arrays, which is error-prone and wasteful.

## Requirements

### New prop

```ts
interface CalendarWidgetProps {
  /** Static list of disabled dates (existing prop, unchanged). */
  disabledDates?: Date[];
  /** Function that returns true if a date should be disabled.
   *  Called for every visible date in the grid. Takes precedence alongside disabledDates —
   *  a date is disabled if it appears in disabledDates OR if isDateDisabled returns true. */
  isDateDisabled?: (date: Date) => boolean;
}
```

### Behavior

- `isDateDisabled` is called for each date cell rendered in the grid (typically 42 cells per month view).
- A date is disabled if `isDateDisabled(date)` returns `true` **OR** if it appears in the `disabledDates` array **OR** if it falls outside `minDate`/`maxDate`.
- The function receives a plain `Date` object set to midnight of that day.
- Disabled dates via the predicate function should have the same visual treatment and ARIA attributes (`aria-disabled="true"`) as statically disabled dates.

### Performance considerations

- The function is called on every render for every visible cell. Document that it should be a fast, pure function.
- Consumers should memoize the function with `useCallback` if it has dependencies. Add a note to the JSDoc and README.
- The component should not call `isDateDisabled` more than once per date per render cycle. Cache results internally for the current grid (invalidated when the view month changes or when the function reference changes).

### Common pattern examples (for documentation)

```tsx
// Disable weekends
<CalendarWidget isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6} />

// Disable past dates
<CalendarWidget isDateDisabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} />

// Disable specific days of week (only allow Tuesday and Thursday)
<CalendarWidget isDateDisabled={(date) => ![2, 4].includes(date.getDay())} />

// Combine with static list
<CalendarWidget
  disabledDates={holidays}
  isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}
/>
```

### Integration with other features

- **Range selection** (issue 0012): Disabled dates inside a range do not break the range visually but cannot be individually selected as start/end.
- **Multi-date selection** (issue 0020): Disabled dates cannot be toggled.
- **Keyboard navigation** (issue 0006): Arrow keys skip disabled dates (move to next non-disabled date in the same direction).

## Verification

- `isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}` → all Saturdays and Sundays appear disabled, clicking them does nothing, `onChange` does not fire.
- Combine `disabledDates={[specific date]}` with `isDateDisabled` → both the specific date and predicate-matched dates are disabled.
- `isDateDisabled` dates have `aria-disabled="true"`.
- Keyboard navigation skips disabled dates.
- Change the predicate function reference → grid re-evaluates which dates are disabled.
- Performance: rendering a month grid does not call `isDateDisabled` more than 42 times.
- Unit tests cover: predicate disabling weekends, combining predicate with static list, combining with minDate/maxDate, keyboard skipping disabled dates, ARIA attributes, function reference change triggering re-evaluation.
