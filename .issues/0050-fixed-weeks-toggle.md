---
tag: pm
state: open
---

# 0050 — Fixed Weeks Toggle

## Problem

The calendar grid always renders exactly 6 rows of weeks, regardless of how many are needed for the displayed month. Most months require only 5 rows; February in non-leap years starting on Sunday/Monday requires only 4. The extra blank-looking rows (filled with outside days) waste vertical space and can look visually awkward, especially in compact UIs, sidebars, or embedded widgets.

However, a fixed 6-row grid prevents layout shifts when navigating between months (a month with 5 rows followed by one with 6 would cause the widget height to jump). Both behaviors have valid use cases.

react-day-picker provides `fixedWeeks`, MUI uses a fixed grid, and FullCalendar allows configuration. Our widget should let the consumer choose.

## Requirements

### New prop

```ts
interface CalendarWidgetProps {
  /** Always show 6 weeks in the calendar grid, even if the month
   *  only needs 4 or 5. Fills extra rows with outside days.
   *  Default: true (current behavior, no layout shift between months). */
  fixedWeeks?: boolean;
}
```

### Behavior

- **`fixedWeeks={true}` (default):** Current behavior. Always 6 rows × 7 columns. Leading and trailing rows filled with days from adjacent months. Widget height is constant across all months.

- **`fixedWeeks={false}`:** Render only the rows that contain at least one day from the current month. The number of rows varies by month (typically 4–6). The widget height changes when navigating between months with different row counts.

### Implementation guidance

In `getCalendarDays` (or a wrapper), after generating the full 6-row grid, trim trailing rows where all 7 days belong to the next month. Also trim leading rows where all 7 days belong to the previous month (rare, but possible in edge cases).

```ts
export function getCalendarDays(
  year: number,
  month: number,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  fixedWeeks?: boolean
): Date[][] {
  // ... generate all 6 rows as today ...
  if (fixedWeeks === false) {
    // Remove trailing rows where every date is in month+1
    while (weeks.length > 0) {
      const lastRow = weeks[weeks.length - 1];
      if (lastRow.every(d => d.getMonth() !== month)) {
        weeks.pop();
      } else {
        break;
      }
    }
  }
  return weeks;
}
```

The `fixedWeeks` prop flows from `CalendarWidget` → `useCalendarState` → `getCalendarDays`.

### Interaction with showOutsideDays (issue 0042)

When `fixedWeeks={false}` and `showOutsideDays={false}`, trimmed rows that are all-outside-days should definitely be removed (they'd be entirely empty). When `showOutsideDays={true}`, the partial outside days in remaining rows are still shown—only fully-outside rows are dropped.

### CSS consideration

When `fixedWeeks={false}`, consumers may want a minimum height to prevent layout shifts from affecting surrounding content. Document that consumers can apply `min-height` to the root element if needed:

```css
.my-calendar {
  min-height: 320px; /* prevent layout shift */
}
```

## Verification

- Default (no prop): 6 rows always rendered. February 2026 (starts on Sunday, `weekStartsOn=0`) shows 4 weeks of February days + 2 rows of outside days. Total: 6 rows.
- `fixedWeeks={false}`: February 2026 shows 5 rows (or 4 if applicable). March 2026 shows 5 rows. Months that need 6 rows still show 6.
- Navigate between a 5-row month and a 6-row month with `fixedWeeks={false}`. The widget height changes smoothly (no broken layout, just a height difference).
- `fixedWeeks={true}` explicitly set: same as default, 6 rows.
- Keyboard navigation still works correctly at row boundaries with fewer rows.
- Unit tests cover: row count for various months, `fixedWeeks=true` vs `false`, edge cases (February starting on Sunday), interaction with `showOutsideDays`, keyboard navigation wrapping at last row.
