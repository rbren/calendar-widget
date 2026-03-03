---
tag: pm
state: open
---

# 0044 — Initial Focus Management

## Problem

When keyboard focus enters the calendar grid (via Tab), which day cell receives focus? The current implementation has no `tabIndex` on any day cell, meaning the grid is not keyboard-accessible at all. Architecture issue 0006 specifies the roving tabindex pattern but does not fully define the *product rules* for which date should be the focus target in various scenarios.

Getting initial focus wrong creates disorienting keyboard experiences — the user tabs into the calendar and lands on an unexpected date, requiring many arrow presses to reach their target.

## Requirements

### Focus target priority

When focus enters the calendar grid, the initially focused cell should follow this priority:

1. **Selected date** — if a date is selected and it's visible in the current month view, focus that cell.
2. **Today** — if no date is selected but today is in the current month view, focus today.
3. **First day of the month** — if neither selected date nor today is in the current month, focus the 1st of the displayed month.

### `autoFocus` prop

```ts
interface CalendarWidgetProps {
  /** Automatically focus the calendar grid when the component mounts. Default: false.
   *  Useful when the calendar appears in a popover/dialog. */
  autoFocus?: boolean;
}
```

When `autoFocus={true}`, the appropriate day cell (per the priority above) receives focus on mount. This is essential for the DatePicker popover (issue 0038) where the calendar should be immediately keyboard-navigable when it opens.

### Focus restoration on month change

When the user navigates to a different month (via prev/next, quick nav, or today button), focus should move to:

1. **Same day number** in the new month (if it exists). E.g., if focused on March 15 and press PageDown, focus moves to April 15.
2. **Last day of the new month** if the same day doesn't exist. E.g., focused on March 31, PageDown → April 30.
3. **Selected date** if the selected date is in the newly displayed month.

### Focus behavior with outside days

When `showOutsideDays={true}` (issue 0042) and the user arrows past the last day of the month into an outside day:

- Focus moves to the outside day cell.
- If the user presses Enter on an outside day with `onOutsideDayClick="navigate"`, focus should land on that same date in the newly navigated month.

When `showOutsideDays={false}`, arrow keys wrap: pressing ArrowRight on the last day of the month wraps focus to the first day.

### `onFocusChange` callback

```ts
interface CalendarWidgetProps {
  /** Called when the focused date changes during keyboard navigation.
   *  Useful for showing a preview or tooltip for the focused date. */
  onFocusChange?: (date: Date | null) => void;
}
```

This fires when:
- Arrow keys move focus to a new date.
- Tab enters the grid (focus lands on a date).
- Tab leaves the grid (fires with `null`).

This is distinct from `onDayFocus` (issue 0021) — `onFocusChange` tracks focus state while `onDayFocus` tracks individual focus events. If both exist, keep `onFocusChange` as the canonical API and make `onDayFocus` an alias. Document the relationship.

### Disabled day focus behavior

When arrowing through the grid, disabled dates should be *focusable but not selectable*:

- Arrow keys can move focus onto a disabled date (so the user can read its label with a screen reader).
- Pressing Enter/Space on a disabled date does nothing (no selection, no error).
- The visual treatment should make it clear the date is disabled even when focused (disabled styling takes precedence, but a focus ring is still visible).

This matches the WAI-ARIA grid pattern recommendation: all cells are focusable for discoverability, but disabled cells don't respond to activation.

## Verification

- Tab into the calendar with a selected date → focus lands on the selected date cell.
- Tab into the calendar with no selection, today visible → focus lands on today.
- Tab into the calendar with no selection, showing a different month → focus lands on the 1st.
- `autoFocus={true}` → calendar grid cell is focused immediately on mount.
- Navigate to next month from March 15 → focus lands on April 15.
- Navigate to next month from March 31 → focus lands on April 30.
- Arrow to a disabled date → focus indicator visible, Enter does nothing.
- `onFocusChange` fires with the correct date on every arrow key press.
- `onFocusChange(null)` fires when Tab leaves the grid.
- With `showOutsideDays={false}`, ArrowRight from last day wraps to first day of month.
- Unit tests cover: focus priority logic (selected > today > first), autoFocus mounting, month-change focus restoration, day clamping (31→30), disabled day focus+no-select, onFocusChange callbacks, wrap behavior without outside days.
