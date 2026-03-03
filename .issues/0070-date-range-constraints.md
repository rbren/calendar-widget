---
tag: pm
state: open
---

# 0070 — Date Range Length Constraints

## Problem

The range selection mode (issue 0012) allows users to select any two dates as a range, with no constraint on how many days the range can span. In real-world booking and scheduling UIs this is a critical gap:

- Hotel booking: minimum stay 2 nights, maximum stay 30 nights.
- Vacation rental: minimum 7-day rental.
- Time-off requests: maximum 10 consecutive business days.
- Event scheduling: appointment must be exactly 1 day.

Without built-in range length constraints, every consumer must implement their own validation and feedback loop, leading to poor UX where users select an invalid range, get an error, and have to start over. The calendar should prevent invalid ranges from being selected in the first place.

## Requirements

### New props

```ts
interface CalendarWidgetProps {
  /** Minimum number of days in a range selection (inclusive). Default: 1.
   *  Only applies when mode="range". */
  minRangeDays?: number;
  /** Maximum number of days in a range selection (inclusive). Default: Infinity.
   *  Only applies when mode="range". */
  maxRangeDays?: number;
}
```

### Behavior

1. **Enforcement during selection**: After the user clicks the range start date, dates that would create a range shorter than `minRangeDays` or longer than `maxRangeDays` should be visually disabled and unclickable for the second click.
2. **Preview feedback**: During hover preview (between first and second click), if the hovered date would produce an invalid range, the preview highlight should not appear (or should appear in an error/warning color using `--cw-color-range-invalid`).
3. **Range counting**: Range length is counted as the number of calendar days from start to end, inclusive. A range from March 1 to March 1 is 1 day. March 1 to March 3 is 3 days.
4. **Props ignored outside range mode**: `minRangeDays` and `maxRangeDays` have no effect when `mode="single"`.
5. **Edge case — minRangeDays > maxRangeDays**: Log a development warning and treat as no constraint.
6. **Edge case — minRangeDays = maxRangeDays**: Only ranges of exactly that length are allowed. This enables "select a week" or "select exactly 3 days" patterns.

### Utility function

Add to `src/utils/dates.ts`:

```ts
/** Calculate the number of calendar days between two dates (inclusive). */
function daysBetween(a: Date, b: Date): number;

/** Check whether a candidate end date would form a valid range with the given start. */
function isValidRangeEnd(
  start: Date,
  candidate: Date,
  minDays?: number,
  maxDays?: number,
): boolean;
```

### Visual treatment for constrained dates

- Dates outside the valid range (during the second click) should use the same disabled styling as `minDate`/`maxDate` constrained dates: muted color, no hover highlight, `cursor: default`.
- The preview highlight during hover should stop at the boundary of the valid range. If the user hovers beyond `maxRangeDays`, the preview should extend only to the last valid day.
- Add a CSS custom property `--cw-color-range-invalid` (default: `--cw-color-disabled`) for dates that fall outside the valid range constraint during range selection.

### Integration with other features

- **Disabled dates** (issues 0005, 0032): Disabled dates inside a constrained range are still disabled — the constraint is on total calendar days, not selectable days.
- **Keyboard navigation**: Arrow keys can move focus to constrained-out dates (they're only "disabled" for the second range click, not for navigation). Pressing Enter/Space on a constrained date during second click does nothing.
- **Multi-month view** (issue 0017): Constraints work across month boundaries.

## Verification

- `mode="range" maxRangeDays={7}`: Select a start date → dates more than 6 days away appear disabled. Hover beyond 7 days → no preview. Click a valid end → range selected. Click an invalid end → nothing happens.
- `mode="range" minRangeDays={3}`: Select start → the next 1 day is disabled for end selection. Day 3+ is selectable.
- `mode="range" minRangeDays={7} maxRangeDays={7}`: Only exactly 7-day ranges allowed.
- `mode="single"` with `maxRangeDays={7}` → prop ignored, single selection works normally.
- `minRangeDays={10} maxRangeDays={5}` → console warning, no constraints applied.
- `daysBetween` utility: verify March 1 to March 1 = 1, March 1 to March 7 = 7, across month boundary.
- `isValidRangeEnd` utility: cover boundary cases, cross-month, cross-year.
- Unit tests cover: visual disabled state during second click, preview boundary clamping, keyboard Enter blocked on invalid end, onChange not fired for invalid range, constraints ignored in single mode, min=max exact range, invalid config warning.
