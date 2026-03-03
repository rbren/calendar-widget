# Disabled Dates & Ranges

## Date range constraints

Use `minDate` and `maxDate` to restrict the selectable range. Dates outside the range are rendered as disabled:

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  minDate={new Date(2026, 0, 1)}   // January 1, 2026
  maxDate={new Date(2026, 11, 31)} // December 31, 2026
/>
```

Both bounds are **inclusive** — the min and max dates themselves are selectable.

## Specific disabled dates

Use the `disabledDates` prop to disable individual dates:

```tsx
const holidays = [
  new Date(2026, 0, 1),   // New Year's Day
  new Date(2026, 6, 4),   // Independence Day
  new Date(2026, 11, 25), // Christmas
];

<CalendarWidget
  value={date}
  onChange={setDate}
  disabledDates={holidays}
/>
```

## Combining constraints

`minDate`, `maxDate`, and `disabledDates` all work together. A date is disabled if it's outside the min/max range **or** appears in the `disabledDates` array:

```tsx
<CalendarWidget
  value={date}
  onChange={setDate}
  minDate={new Date(2026, 2, 1)}
  maxDate={new Date(2026, 2, 31)}
  disabledDates={[new Date(2026, 2, 17)]} // St. Patrick's Day
/>
```

## Behavior

- Disabled cells are styled with muted text and `pointer-events: none`.
- Clicking a disabled cell does nothing — `onChange` is not called.
- Keyboard activation (`Enter`/`Space`) on a disabled cell is also ignored.
- Dates are compared by calendar day only; time components are ignored.
