# CalendarGrid

Renders the weekday header row and the 6×7 grid of day cells. Handles keyboard navigation (arrow keys, Home/End, PageUp/PageDown) and mouse hover events for range preview.

```tsx
import { CalendarGrid } from '@calendar-widget/core';
```

> **Note:** You only need to import this directly if you are building a custom calendar layout. For standard usage, `CalendarWidget` renders it automatically.

## Props — `CalendarGridProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `weeks` | `Date[][]` | — | 2D array of dates for the calendar grid (6 rows × 7 cols). Generate with `getCalendarDays()`. |
| `viewDate` | `Date` | — | The date representing the currently displayed month. |
| `value` | `Date \| DateRange \| Date[] \| null` | `undefined` | Currently selected date(s) or range. |
| `mode` | `'single' \| 'range'` | `'single'` | Selection mode. |
| `minDate` | `Date` | `undefined` | Earliest selectable date. |
| `maxDate` | `Date` | `undefined` | Latest selectable date. |
| `disabledDates` | `Date[]` | `[]` | Dates that should be disabled. |
| `locale` | `string` | `undefined` | Locale for weekday header and day label formatting. |
| `weekStartsOn` | `0–6` | — | Day the week starts on. |
| `focusedDate` | `Date` | — | The date that currently holds the roving tabIndex. |
| `rangeStart` | `Date \| null` | `undefined` | The pending start date during range selection (after first click, before second). |
| `hoveredDate` | `Date \| null` | `undefined` | The hovered date during range selection preview. |
| `onSelectDate` | `(date: Date) => void` | — | Called when a day is clicked or activated via keyboard. |
| `onFocusDate` | `(date: Date) => void` | — | Called when keyboard navigation changes the focused date. |
| `onHoverDate` | `(date: Date \| null) => void` | `undefined` | Called when a day is hovered (for range preview) or the grid is mouse-left (`null`). |
| `renderDay` | `(dayNumber: ReactNode, info: DayRenderInfo) => ReactNode` | `undefined` | Custom render function for day cell content. Passed through to each `CalendarDayCell`. |

## Keyboard navigation

The grid handles keyboard events internally:

| Key | Action |
|-----|--------|
| `←` / `→` | Move focus to the previous / next day |
| `↑` / `↓` | Move focus to the same day in the previous / next week |
| `Home` / `End` | Move focus to the first / last day of the current week |
| `PageUp` / `PageDown` | Move focus to the same day in the previous / next month |

When focus moves outside the current view, `onFocusDate` is called and the parent is responsible for updating `viewDate` and `weeks`.

## Accessibility

- Rendered as a `<table>` with `role="grid"` and `aria-label="Calendar"`.
- Weekday headers use `<th>` with `role="columnheader"`.
- Each day is rendered as a `<CalendarDayCell>` inside a `<td>` with `role="gridcell"`.
- The roving tabindex pattern ensures only one cell is tabbable at a time.

## Usage

```tsx
import { CalendarGrid, useCalendarState } from '@calendar-widget/core';

function CustomCalendar() {
  const state = useCalendarState({ value: date, onChange: setDate });

  return (
    <CalendarGrid
      weeks={state.weeks}
      viewDate={state.viewDate}
      value={date}
      focusedDate={state.focusedDate}
      weekStartsOn={0}
      onSelectDate={state.selectDate}
      onFocusDate={state.focusDate}
    />
  );
}
```
