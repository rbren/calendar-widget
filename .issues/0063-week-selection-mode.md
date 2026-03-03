---
tag: pm
state: open
---

# 0063 — Week Selection Mode

## Problem

Many business applications require selecting an entire week at a time — timesheet entry, weekly reports, sprint planning, work schedules, and payroll systems all operate on a week-by-week basis. Currently the widget supports `mode: 'single'` and `mode: 'range'`, but there is no efficient way to select a full week. Users would have to click the first and last day of the week in range mode, which is cumbersome and error-prone.

A dedicated `mode: 'week'` would let users click any day in a week row to select the entire Mon–Sun (or Sun–Sat, depending on `weekStartsOn`) range in one click.

## Requirements

### New mode value

Extend the `mode` prop:

```ts
interface CalendarWidgetProps {
  mode?: 'single' | 'range' | 'week';
}
```

### Interaction behavior

1. Clicking any day in a week selects the entire week as a `DateRange` from the first day of that week to the last day of that week (based on `weekStartsOn`).
2. `onChange` fires with a `DateRange` where `start` is the first day of the week and `end` is the last day.
3. Hovering over any day highlights the entire row (all 7 cells in that week) with a preview style, so the user can see which week they're about to select.
4. The entire week row should be visually treated as a unit — the start day gets left-rounded corners, the end day gets right-rounded corners, and intermediate days get the continuous range band, reusing the existing range CSS styles.

### Implementation guidance

In `useCalendarState`, when `mode === 'week'`:

```ts
const selectDate = (date: Date) => {
  // ... existing min/max/disabled checks ...
  if (mode === 'week') {
    const dayOfWeek = date.getDay();
    const diff = (dayOfWeek - weekStartsOn + 7) % 7;
    const start = new Date(date);
    start.setDate(date.getDate() - diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    onChange?.({ start, end });
    return;
  }
  // ... existing single/range logic ...
};
```

For hover preview in `CalendarGrid`, when `mode === 'week'`, compute the full week range from the hovered date and apply `isInPreview`/`isPreviewStart`/`isPreviewEnd` to the entire row.

### Min/max constraints

If `minDate` or `maxDate` partially clips a week, the selection should still be allowed — the returned `DateRange` is the full week, and the consumer can decide how to handle boundary overlap. However, if the clicked day itself is outside `minDate`/`maxDate` or is disabled, the click is ignored.

### Accessibility

- The entire week row should announce contextually: when focus is on a day in week mode, the `aria-label` should indicate the week context, e.g., "Wednesday, March 18, 2026, week of March 16–22".
- `aria-selected="true"` on all days in the selected week.

## Verification

- Render `<CalendarWidget mode="week" />` and click any day → `onChange` fires with a `DateRange` spanning exactly 7 days starting from the correct `weekStartsOn` day.
- Hover over a day → the entire week row shows preview highlighting.
- Click a different week → previous selection clears, new week is selected.
- With `weekStartsOn={1}`: clicking Wednesday March 18 selects Mon March 16 – Sun March 22.
- With `weekStartsOn={0}` (default): clicking Wednesday March 18 selects Sun March 15 – Sat March 21.
- Clicking a disabled day does nothing.
- Selected week displays with range start/end styling (rounded corners on first/last day, continuous band between).
- Unit tests cover: week selection with different weekStartsOn values, hover preview for full row, onChange returns correct DateRange, disabled day rejection, min/max boundary behavior.
