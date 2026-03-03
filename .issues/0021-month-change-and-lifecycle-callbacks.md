---
tag: pm
state: open
---

# 0021 — Month Change & Lifecycle Callbacks

## Problem

Consumers often need to react to navigation changes — for example, to lazy-load events for the newly visible month, update a URL parameter, or sync with external state. The current design has `onChange` for date selection but no callback for when the displayed month changes or when the calendar mounts into a specific view.

## Requirements

### `onMonthChange` callback

```ts
interface CalendarWidgetProps {
  /** Called when the displayed month changes via navigation, quick-nav, or today button.
   *  Receives a Date representing the first day of the newly displayed month. */
  onMonthChange?: (month: Date) => void;
}
```

This fires when:
- The user clicks prev/next arrows.
- The user selects a month/year via quick navigation (issue 0013).
- The user clicks the "Today" button and it changes the view (issue 0014).
- In multi-month view (issue 0017), `month` represents the first (leftmost) month.

It does **not** fire when:
- The component initially mounts (use `defaultMonth` or `month` prop to know the initial month).
- The parent updates the `month` prop in controlled mode (the parent already knows).

### `onDayFocus` callback (optional, recommended)

```ts
interface CalendarWidgetProps {
  /** Called when keyboard focus moves to a new day cell.
   *  Useful for showing previews or loading details for the focused date. */
  onDayFocus?: (date: Date) => void;
}
```

This fires during keyboard navigation as the user arrows through days. It enables "preview pane" patterns where an adjacent panel shows details for the focused date.

### Implementation notes

- `onMonthChange` should be called with a `Date` set to the first day of the new month at midnight (e.g., `new Date(2026, 2, 1)` for March 2026). This gives consumers a clean, predictable date to work with.
- Avoid firing `onMonthChange` redundantly — if the user navigates away and back to the same month, it should fire twice (once for each navigation), but rapid-fire calls (e.g., from React re-renders) should be deduplicated.

## Verification

- Navigate forward 3 months → `onMonthChange` fires 3 times with sequential first-of-month dates.
- Use quick navigation to jump to a different year → `onMonthChange` fires once with the target month.
- Click "Today" while on a different month → `onMonthChange` fires with the current month.
- Click "Today" while already on the current month → `onMonthChange` does not fire.
- Mount the component → `onMonthChange` does not fire.
- `onDayFocus`: arrow key through 5 days → callback fires 5 times with the correct dates.
- Unit tests cover: forward/back navigation callbacks, quick-nav callback, today button callback, no-fire on mount, no-fire on redundant today click, `onDayFocus` during keyboard nav.
