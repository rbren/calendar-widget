---
tag: pm
state: open
---

# 0042 — Show/Hide Outside Days

## Problem

The calendar grid always renders 6 rows × 7 columns, including days from the previous and next months (outside days). These days are visually dimmed but still visible and clickable. Some calendar designs prefer to hide outside days entirely — showing blank cells or hiding trailing rows — for a cleaner, less cluttered appearance. Others want outside days visible but not interactive. This behavior should be configurable.

## Requirements

### `showOutsideDays` prop

```ts
interface CalendarWidgetProps {
  /** Control visibility and behavior of days from adjacent months. Default: true. */
  showOutsideDays?: boolean;
}
```

### Behavior

- `showOutsideDays={true}` (default): current behavior. Days from adjacent months are visible, dimmed, and clickable.
- `showOutsideDays={false}`: days from adjacent months render as empty cells. No day number, no click handler, no hover state. The cell element is present (to maintain grid layout) but visually blank.

### `onOutsideDayClick` prop

```ts
interface CalendarWidgetProps {
  /** Control what happens when an outside-month day is clicked. Default: 'select'. */
  onOutsideDayClick?: 'select' | 'navigate' | 'none';
}
```

- `'select'` (default): clicking an outside day selects it and calls `onChange`. The view does not change.
- `'navigate'`: clicking an outside day navigates to that day's month and selects it. Both `onMonthChange` and `onChange` fire.
- `'none'`: outside days are visible but not interactive (rendered without click handlers, dimmed like disabled days). Useful when outside days provide visual context but shouldn't be actionable.

`onOutsideDayClick` is only relevant when `showOutsideDays={true}`. When `showOutsideDays={false}`, there are no outside days to click.

### `fixedWeeks` prop

```ts
interface CalendarWidgetProps {
  /** Always render 6 rows even if the month fits in fewer. Default: true. */
  fixedWeeks?: boolean;
}
```

- `fixedWeeks={true}` (default): always 6 rows, matching current behavior. Prevents the widget from changing height between months.
- `fixedWeeks={false}`: render only the rows needed for the current month (4–6 rows depending on the month). This saves vertical space but causes the widget height to change between months.

When `fixedWeeks={false}` and `showOutsideDays={false}`, the trailing empty rows are removed entirely.

### Visual treatment for empty cells

When `showOutsideDays={false}`, empty cells should:
- Have a background matching `--cw-color-bg` (blend into the widget background).
- Have no border, no hover state, no focus state.
- Be skipped by keyboard navigation (arrow keys jump from the last day of the month to the first day, wrapping within the current month).

### Integration with range selection (issue 0012)

When `showOutsideDays={false}` and `mode="range"`, the range highlight band should still visually span across empty cells at the edges of the month to indicate the range continues into the adjacent month. This is a visual hint only — the empty cells remain non-interactive.

## Verification

- `showOutsideDays={false}` → cells for adjacent months show no day number, no hover, no click.
- `showOutsideDays={true}` (default) → current behavior, no regression.
- `onOutsideDayClick="navigate"` → click Jan 31 while viewing February → view navigates to January, Jan 31 is selected.
- `onOutsideDayClick="none"` → outside days visible but cursor is default, no click response.
- `fixedWeeks={false}` → February 2026 (starts on Sunday) renders 4–5 rows instead of 6.
- `fixedWeeks={false}` + `showOutsideDays={false}` → no empty trailing rows.
- Range mode with `showOutsideDays={false}` → range band continues through empty cells visually.
- Keyboard nav with `showOutsideDays={false}` → arrow keys skip empty cells, wrap within month.
- Unit tests cover: empty cell rendering when hidden, onOutsideDayClick modes, fixedWeeks row count for various months, keyboard wrapping behavior, range band on empty cells, grid structure stability.
