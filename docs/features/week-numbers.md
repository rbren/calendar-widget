# Week Numbers

The calendar can display ISO 8601 week numbers in an extra column at the left of the grid.

## Enabling week numbers

Set `showWeekNumbers` to `true`:

```tsx
<CalendarWidget value={date} onChange={setDate} showWeekNumbers />
```

This adds a column before the weekday columns. Each row shows the ISO week number for that week's first day.

## ISO 8601 week numbering

Week numbers follow the ISO 8601 standard:

- Weeks start on Monday.
- Week 1 is the week containing the first Thursday of the year.
- Week numbers range from 1 to 53.

> **Note:** The week number column is informational only — it uses `weekStartsOn` for the calendar grid layout but always computes ISO week numbers based on the standard (Monday-based weeks).

## Accessibility

- The `#` column header uses `role="columnheader"`.
- Each week number cell uses `role="rowheader"` with `aria-label="Week {number}"`.
- Week number cells have `tabIndex={-1}` and are not part of the keyboard navigation flow.

## Using the utility directly

The `getISOWeekNumber` function is exported for use outside the calendar:

```ts
import { getISOWeekNumber } from '@calendar-widget/core';

getISOWeekNumber(new Date(2026, 0, 1));  // 1
getISOWeekNumber(new Date(2026, 2, 15)); // 11
```
