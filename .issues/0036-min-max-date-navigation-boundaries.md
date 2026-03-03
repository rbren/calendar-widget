---
tag: pm
state: open
---

# 0036 — Min/Max Date Navigation Boundaries

## Problem

The architecture (issue 0005) defines `minDate` and `maxDate` props that prevent *selection* of dates outside the range, but there is no specification for how *navigation* should behave at boundaries. Current ambiguity leads to confusing UX:

- Can the user navigate to a month that's entirely before `minDate`? If so, they see a grid where every date is disabled — confusing and wasteful.
- Are the prev/next buttons disabled at the boundaries, or do they just keep navigating into empty months?
- Can the user navigate to a month that's entirely after `maxDate`?
- How does quick navigation (issue 0013) interact with min/max — can the user select a year that's entirely outside the range?

Without explicit boundary behavior, each consuming application will need to implement its own navigation guards, and the out-of-the-box experience will be poor.

## Requirements

### Navigation clamping

Navigation should be constrained to the range of months that contain at least one selectable date:

1. **Previous button**: Disabled (visually dimmed, `aria-disabled="true"`, click does nothing) when the currently displayed month is the same as `minDate`'s month (or earlier).
2. **Next button**: Disabled when the currently displayed month is the same as `maxDate`'s month (or later).
3. **Keyboard**: `PageUp` (previous month) and `PageDown` (next month) should also respect these boundaries — pressing `PageUp` at the minimum month does nothing.
4. **Quick navigation** (issue 0013): The month picker should gray out months that are entirely outside the min/max range. The year picker should gray out years with no valid months.
5. **Today button** (issue 0014): Disabled if the current month falls outside the min/max range.
6. **Imperative API** (issue 0023): `goToPrevMonth()` / `goToNextMonth()` should respect boundaries and not navigate outside them. `goToDate()` should clamp to the nearest valid month if the target is outside the range.

### Utility function

Add to `src/utils/dates.ts`:

```ts
/** Check if navigation to the previous month is allowed given a minDate constraint. */
function canNavigatePrev(viewDate: Date, minDate?: Date): boolean;

/** Check if navigation to the next month is allowed given a maxDate constraint. */
function canNavigateNext(viewDate: Date, maxDate?: Date): boolean;

/** Clamp a target navigation date to the valid min/max range. */
function clampViewDate(target: Date, minDate?: Date, maxDate?: Date): Date;
```

### Visual treatment for boundary buttons

- Disabled navigation buttons should use `--cw-color-disabled` and `cursor: not-allowed`.
- They should have `aria-disabled="true"` (not the HTML `disabled` attribute, to keep them in the tab order for screen reader discoverability).
- Keyboard focus on a disabled button followed by `Enter`/`Space` should do nothing.

### Edge cases

- `minDate` and `maxDate` in the same month → both prev and next are disabled, only that month is navigable.
- Only `minDate` set (no `maxDate`) → prev is constrained, next is always enabled.
- Only `maxDate` set (no `minDate`) → next is constrained, prev is always enabled.
- Neither set → no constraints, existing behavior.
- `minDate` after `maxDate` (invalid) → treat as no constraint, log a development warning.

### Multi-month view interaction (issue 0017)

When `numberOfMonths > 1`:
- Previous is disabled when the leftmost visible month is at `minDate`'s month.
- Next is disabled when the rightmost visible month is at `maxDate`'s month.

## Verification

- Set `minDate` to March 2026 → navigate to March 2026 → prev button is disabled, cannot navigate earlier. Next button works.
- Set `maxDate` to December 2026 → navigate to December 2026 → next button is disabled.
- Set both `minDate` and `maxDate` to dates in the same month → both buttons disabled.
- Quick navigation: month picker grays out months outside the range. Cannot select a grayed-out month.
- `PageUp` at minimum month → no navigation. `PageDown` at maximum month → no navigation.
- Today button disabled when today is outside min/max range.
- `goToDate()` with a date before `minDate` → navigates to `minDate`'s month instead.
- Invalid `minDate > maxDate` → console warning, no constraints applied.
- Screen reader: disabled buttons announce "Previous month, disabled".
- Unit tests cover: `canNavigatePrev`/`canNavigateNext` with various boundary conditions, button disabled states, keyboard PageUp/PageDown at boundaries, quick-nav month graying, today button disabled state, `goToDate` clamping, invalid min/max warning, multi-month boundary behavior.
