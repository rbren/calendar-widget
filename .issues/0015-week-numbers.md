---
tag: pm
state: review
---

# 0015 — Week Number Display

## Problem

In many European and business contexts, dates are referenced by ISO week number (e.g., "CW 12" or "Week 48"). Project management tools, payroll systems, and logistics software all rely on week numbers. A calendar widget that cannot display them is incomplete for these audiences.

## Requirements

### Behavior

When enabled, display the ISO 8601 week number at the start of each row in the calendar grid.

- Week numbers appear as a new first column, visually separated from the day cells (lighter text color, no click interaction).
- The header row should show a label like "W" or "#" above the week number column.
- Week numbers follow [ISO 8601](https://en.wikipedia.org/wiki/ISO_week_date): the week containing the year's first Thursday is week 1, weeks start on Monday.

### Props

```ts
interface CalendarWidgetProps {
  /** Display ISO week numbers in the first column (default: false) */
  showWeekNumbers?: boolean;
}
```

### Utility function

Add to `src/utils/dates.ts`:

```ts
/** Returns the ISO 8601 week number for a given date (1–53). */
function getISOWeekNumber(date: Date): number;
```

This must be a pure function with no dependencies, independently unit-testable.

### Visual design

- Week number cells should use `--cw-color-text-muted` and a slightly smaller font.
- They should not be interactive (no hover state, no click handler, `tabIndex={-1}`).
- The grid should gracefully expand to accommodate the extra column without breaking the layout or violating `--cw-cell-size`.

### Accessibility

- Week number cells should have `role="rowheader"` with `aria-label="Week 12"` (using the actual number).
- They should be excluded from keyboard grid navigation (arrow keys skip them).

## Verification

- `<CalendarWidget showWeekNumbers />` → each row shows the correct ISO week number.
- Verify against known references: e.g., January 1, 2026 is in ISO week 1; December 31, 2026 is in ISO week 53.
- `showWeekNumbers={false}` (default) → no week column rendered.
- Grid layout does not break or overflow at 280px container width with week numbers enabled.
- Screen reader announces "Week 12" for week number cells.
- Unit tests for `getISOWeekNumber`: cover year boundaries, leap years, and edge cases (e.g., Dec 31 that falls in week 1 of the next year).
- Component tests: week numbers render in correct cells, no keyboard focus on week cells.
