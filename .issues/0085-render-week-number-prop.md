---
tag: pm
state: open
---

# 0085 — `renderWeekNumber` Prop for Custom Week Number Cells

## Problem

Issue 0015 added ISO week number display via `showWeekNumbers`. However, the week number cells are plain text and cannot be customized. Users may want to:

- Make week numbers clickable to select an entire week (complementing issue 0063 — week selection mode).
- Show a tooltip with the date range for that week.
- Style week numbers conditionally (e.g., highlight the current week).
- Render week numbers in a different format or with custom markup.

The `renderDay` prop (issue 0016) provides this flexibility for day cells, but there is no equivalent for week number cells. This asymmetry limits the usefulness of the week number column.

## Requirements

### `renderWeekNumber` prop

```ts
interface WeekNumberRenderInfo {
  /** ISO week number (1–53) */
  weekNumber: number;
  /** Array of 7 Date objects representing the days in this week row */
  dates: Date[];
}

interface CalendarWidgetProps {
  /** Custom render function for week number cells.
   *  Receives the default content (week number as a ReactNode) and context info.
   *  Return a ReactNode to replace the default content.
   *  Only called when showWeekNumbers is true. */
  renderWeekNumber?: (
    defaultContent: React.ReactNode,
    info: WeekNumberRenderInfo,
  ) => React.ReactNode;
}
```

### Behavior

- `renderWeekNumber` is only invoked when `showWeekNumbers={true}`.
- It receives the default content (a `<span>` with the week number) and an info object.
- The `dates` array in `WeekNumberRenderInfo` contains the 7 dates for that row, enabling the consumer to determine if this is the current week, check if any dates are selected, etc.
- The return value replaces the content inside the `<td>` week number cell. The `<td>` itself (with `role="rowheader"` and `aria-label`) is still rendered by the grid.
- If `renderWeekNumber` returns `null`, the cell is rendered empty (but still occupies space in the grid).

## Implementation Notes

1. Add `WeekNumberRenderInfo` interface and `renderWeekNumber` prop to types.
2. Pass `renderWeekNumber` through `CalendarWidget` → `CalendarGrid`.
3. In `CalendarGrid`, where week number cells are rendered:
   ```tsx
   const defaultWeekContent = <span>{weekNumber}</span>;
   const weekContent = renderWeekNumber
     ? renderWeekNumber(defaultWeekContent, { weekNumber, dates: week })
     : weekNumber;
   ```
4. Export `WeekNumberRenderInfo` from the barrel.

## Verification

- Render with `showWeekNumbers` and `renderWeekNumber` that wraps the number in a `<button>` → week numbers are clickable buttons.
- Render with `showWeekNumbers` and no `renderWeekNumber` → default week number display (no regression).
- The `info.dates` array contains 7 dates matching the row.
- The `info.weekNumber` matches the ISO week number for the row.
- Unit tests: custom renderWeekNumber output is rendered, info object has correct weekNumber and dates, default behavior without prop.
