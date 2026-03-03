---
tag: pm
state: open
---

# 0017 — Multiple Month View

## Problem

Date range selection (issue 0012) is significantly better with two months visible at once — the user can see both the start and end month simultaneously. Multi-month views are standard in booking and travel UIs (Airbnb, hotel sites, flight search). Showing only one month at a time forces constant back-and-forth navigation.

## Requirements

### `numberOfMonths` prop

```ts
interface CalendarWidgetProps {
  /** Number of consecutive months to display side-by-side (default: 1, max recommended: 3) */
  numberOfMonths?: number;
}
```

### Layout behavior

- Months are displayed in a horizontal row, left to right, each showing a complete calendar grid.
- Each month has its own day-of-week header row.
- The month-year heading spans across all months, or each month has its own heading — either approach is acceptable, but each month must clearly indicate which month/year it represents.
- The **prev** arrow appears on the leftmost month; the **next** arrow appears on the rightmost month. Clicking either shifts all months by one.
- When `numberOfMonths={2}` and the view shows March–April, clicking "next" shows April–May.

### Responsive behavior

- At narrow widths (below `numberOfMonths * 280px`), months should stack vertically instead of sitting side-by-side.
- Add a CSS custom property: `--cw-month-gap` (default: `16px`) for the space between months.

### Integration with other features

- **Range selection** (issue 0012): hovering/selecting across month boundaries should work seamlessly — the preview highlight spans from a day in the left month to a day in the right month.
- **Quick navigation** (issue 0013): clicking the heading opens the month picker for the leftmost month. After selection, all visible months shift accordingly.
- **Week numbers** (issue 0015): each month grid independently shows its week numbers if enabled.

### Props interaction

- `numberOfMonths={1}` (default) behaves exactly as the single-month widget — no visual or behavioral changes.
- `numberOfMonths` must be a positive integer. Values ≤ 0 should be treated as 1.

## Verification

- `<CalendarWidget numberOfMonths={2} />` renders two consecutive months side by side.
- `<CalendarWidget numberOfMonths={3} />` renders three months.
- Clicking next/prev shifts all months by one.
- Range selection across two visible months: click start in left month, click end in right month → range highlights across both grids.
- Resize container to narrow width → months stack vertically.
- `numberOfMonths={1}` → identical to current single-month behavior.
- Unit tests cover: correct months displayed, navigation shifting, range selection across months, responsive stacking (via container width mocking or CSS class assertions).
