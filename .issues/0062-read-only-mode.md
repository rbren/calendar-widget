---
tag: pm
state: open
---

# 0062 — Read-Only Mode

## Problem

There is currently no way to display a calendar for informational purposes without allowing date selection. The only mechanism to prevent interaction is `disabledDates`, which visually grays out every date and signals "broken" rather than "display-only". Common use cases for a read-only calendar include:

- Displaying a month view with event markers (issue 0019) or highlighted dates where clicking is not relevant.
- Embedding a mini-calendar in a dashboard that shows the current month with today highlighted.
- Showing a selected date range or date for confirmation without allowing changes.

A `readOnly` prop is a standard expectation for form-adjacent components (cf. `<input readOnly>`, MUI's `readOnly` prop, Ant Design's `disabled` vs. `readonly` distinction).

## Requirements

### New prop

```ts
interface CalendarWidgetProps {
  /** When true, the calendar displays normally but does not respond to date selection clicks.
   *  Navigation (prev/next month, quick-nav) still works. Default: false. */
  readOnly?: boolean;
}
```

### Behavior

- **Selection disabled**: Clicking a day cell does nothing. `onChange` is never called.
- **Navigation preserved**: Prev/next month buttons, quick navigation (month/year pickers), and keyboard month navigation (PageUp/PageDown) remain fully functional so the user can browse dates.
- **Keyboard day selection disabled**: `Enter`/`Space` on a day cell is a no-op in read-only mode.
- **Day cell keyboard navigation preserved**: Arrow keys still move focus between days (for accessibility — users should be able to navigate to read `aria-label` content).
- **Visual treatment**: Day cells should NOT appear grayed out or disabled. They render normally (today ring, selected highlight, range highlight all still visible). The cursor should change from `pointer` to `default` on day cells to hint at non-interactivity.
- **Hover**: No hover highlight on day cells in read-only mode.

### Implementation guidance

1. Add `readOnly?: boolean` to `CalendarWidgetProps`.
2. Pass it through to `CalendarGrid` and `CalendarDayCell`.
3. In `CalendarDayCell`: when `readOnly` is true, skip the `onSelect` call in `handleClick` and `handleKeyDown`, and set `cursor: default` via a CSS class.
4. In `CalendarGrid`: when `readOnly` is true, skip the `onHoverDate` calls.
5. Add a `.readOnly` CSS class to `CalendarDayCell.module.css`:
   ```css
   .readOnly {
     cursor: default;
   }
   .readOnly:hover {
     background: inherit;
   }
   ```

### Props addition

```ts
interface CalendarGridProps {
  // ... existing
  readOnly?: boolean;
}

interface CalendarDayCellProps {
  // ... existing
  readOnly?: boolean;
}
```

## Verification

- Render `<CalendarWidget readOnly value={new Date(2026, 2, 15)} />` → March 15 is visually selected, clicking any date does nothing, `onChange` never fires.
- Prev/next month buttons still work in read-only mode.
- Quick navigation (month/year picker) still works.
- Arrow keys move focus between day cells; `Enter` on a day does nothing.
- Day cells show `cursor: default` (not `pointer`).
- No hover highlight on day cells.
- Today ring and selected highlight are still visible.
- A range value is displayed correctly in read-only mode.
- Unit tests cover: click does not fire onChange, keyboard Enter/Space no-op, navigation still works, hover does not trigger callbacks.
