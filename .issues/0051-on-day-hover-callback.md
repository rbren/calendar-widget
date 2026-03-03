---
tag: pm
state: open
---

# 0051 — onDayHover Callback

## Problem

There is no callback when a user hovers over (or moves focus to) a day cell. This prevents several important use cases:

1. **Date range selection preview (issue 0012):** After selecting the start date, the consumer needs to know which date the user is hovering over to render a visual range preview. Without an `onDayHover` callback, the range preview UX described in issue 0012 cannot be implemented.

2. **Tooltips and popovers:** Consumers may want to show additional information (events, availability, pricing) when hovering over a date. Currently this requires `renderDay` (issue 0016) with internal mouse listeners in every custom cell—clunky and error-prone.

3. **Analytics / heatmap interaction:** Dashboards with calendar heatmaps need hover callbacks to show detail panels.

This is a foundational event callback that most calendar libraries provide (react-day-picker's `onDayMouseEnter`, FullCalendar's `dateMouseEnter`).

## Requirements

### New props

```ts
interface CalendarWidgetProps {
  /** Called when the mouse enters a day cell.
   *  Fires with the date under the cursor, or null when the cursor leaves all day cells. */
  onDayHover?: (date: Date | null) => void;
}
```

### Behavior

- **Mouse enter a day cell:** Fire `onDayHover(date)` with that cell's date.
- **Mouse leave the calendar grid entirely:** Fire `onDayHover(null)` to signal no date is hovered.
- **Moving directly between adjacent day cells:** Fire `onDayHover(newDate)` for the entered cell. Do NOT fire `onDayHover(null)` between cells (avoid a null flash when sliding across cells).
- **Disabled days:** `onDayHover` fires for disabled days too. The consumer can check disability if needed; the callback should not silently suppress hover events.
- **Outside days:** `onDayHover` fires for outside days if they are visible.

### Implementation guidance

Add `onMouseEnter` to each `<td>` in `CalendarDayCell`:

```tsx
<td
  onMouseEnter={() => onDayHover?.(date)}
  // ... existing props
>
```

Add `onMouseLeave` to the `<table>` element in `CalendarGrid`:

```tsx
<table
  onMouseLeave={() => onDayHover?.(null)}
  // ... existing props
>
```

This pattern avoids the null-between-cells problem: mouse-leave on an individual cell is not tracked, only mouse-leave on the entire table fires null.

### Prop threading

```ts
interface CalendarDayCellProps {
  // ... existing props
  /** Called when mouse enters this cell */
  onDayHover?: (date: Date) => void;
}

interface CalendarGridProps {
  // ... existing props
  /** Called when a day cell is hovered or the grid is left */
  onDayHover?: (date: Date | null) => void;
}
```

### Performance

- The callback should NOT be wrapped in `useCallback` inside the cell (it's a pass-through). The parent should memoize if needed.
- Do NOT debounce or throttle the callback by default. If the consumer needs debouncing (e.g., for expensive tooltip fetches), they can debounce on their end.

## Verification

- Hover over March 15 → `onDayHover` fires with a Date for March 15.
- Move mouse from March 15 directly to March 16 → `onDayHover` fires with March 16. No intermediate `null` call.
- Move mouse out of the calendar grid → `onDayHover(null)` fires.
- Hover over a disabled date → `onDayHover` still fires with that date.
- Hover over an outside day → `onDayHover` fires with the outside day's date.
- `onDayHover` not provided → no errors, no extra DOM event listeners (verify no performance regression).
- Build a range preview demo: select a start date, then use `onDayHover` to highlight all days between start and hovered date. Verify smooth highlighting as cursor moves across cells.
- Unit tests cover: callback invocation on mouseenter, null on grid mouseleave, no null between adjacent cells, disabled day hover, outside day hover, callback not provided (no crash).
