---
tag: pm
state: open
---

# 0012 — Date Range Selection

## Problem

The current design (issue 0005) only supports single-date selection. Many real-world use cases — booking systems, reporting dashboards, leave management — require selecting a contiguous range of dates (start → end). Without this, the widget cannot compete with established alternatives like `react-date-range` or `react-day-picker`.

## Requirements

### New selection mode

Add a `mode` prop to `CalendarWidget`:

```ts
interface CalendarWidgetProps {
  /** Selection mode: pick one date, or a start–end range */
  mode?: 'single' | 'range';   // default: 'single'
  /** For range mode, the currently selected range */
  value?: Date | DateRange | null;
  /** Called when selection changes */
  onChange?: (value: Date | DateRange | null) => void;
}

interface DateRange {
  start: Date;
  end: Date;
}
```

Export `DateRange` from the public API.

### Interaction behavior (range mode)

1. First click sets `start` (and clears any existing range).
2. Second click sets `end`. If the second click is before `start`, swap them so `start ≤ end`.
3. After a complete range is selected, the next click starts a new range.
4. While hovering (after the first click, before the second), days between `start` and the hovered date should show a visual "preview" highlight so the user can see what range they're about to select.

### Visual treatment

- **Start date**: filled accent background with left-rounded corners.
- **End date**: filled accent background with right-rounded corners.
- **In-range dates**: light accent background spanning the full cell width to create a continuous band.
- **Preview (hover) range**: same band but at lower opacity.
- Add CSS custom properties for range colors:
  - `--cw-color-range-bg` (in-range background, default: a light tint of `--cw-color-primary`)
  - `--cw-color-range-preview-bg` (hover preview, default: same tint at 50% opacity)

### Constraints

- `minDate` / `maxDate` / `disabledDates` must still be respected. If a disabled date falls within a range, the range should still be selectable — the disabled date is simply not individually clickable but does appear inside the visual band.
- Range selection must work across month boundaries — selecting a start in January and navigating to February to click the end should work seamlessly.

### Accessibility

- Both `start` and `end` should have `aria-selected="true"`.
- In-range dates should convey their state, e.g. via an `aria-label` like "March 5, in selected range".
- Keyboard: after selecting start with `Enter`, continue arrowing to the desired end and press `Enter` again.

## Verification

- Render `<CalendarWidget mode="range" />` and click two dates → `onChange` fires with a `{ start, end }` object where `start ≤ end`.
- Hover between first and second click → preview highlight appears on intermediate days.
- Select a range spanning two months → range persists correctly when navigating back and forth.
- `minDate`/`maxDate` constraints are respected — clicks outside the range are ignored.
- Screen reader announces "selected, start of range" / "in selected range" on appropriate days.
- Unit tests cover: basic range selection, reversed click order, range across months, range with disabled dates inside, keyboard-only range selection.
