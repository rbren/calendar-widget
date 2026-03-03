---
tag: pm
state: open
---

# 0013 — Year & Month Quick Navigation

## Problem

Users can currently only navigate one month at a time with prev/next arrows. If someone needs to jump from January 2026 to March 2019, that's 82 clicks. Calendar widgets without quick navigation are unusable for date-of-birth fields, historical date lookups, or any scenario where the target date is far from today.

## Requirements

### Month/year header becomes interactive

Clicking the month-year heading in `CalendarHeader` (e.g., "March 2026") should open a drill-up view that allows rapid navigation:

1. **First click on heading** → switch from the day grid to a **month picker**: a 4×3 grid showing Jan–Dec for the currently displayed year, with left/right arrows to change the year.
2. **Click on a month** → return to the day grid showing that month.
3. Optionally (recommended): **click on the year label in month-picker view** → switch to a **year picker**: a 4×3 grid showing a range of 12 years, with arrows to move the range. Clicking a year returns to the month picker for that year.

### Props

```ts
interface CalendarWidgetProps {
  /** Set to false to disable the drill-up month/year picker (default: true) */
  quickNavigation?: boolean;
}
```

### Visual design

- The month picker and year picker replace the day grid in-place (not a dropdown/popup) to keep the widget self-contained.
- The currently selected month (or year) should be highlighted with the accent color.
- Today's month/year should have a subtle indicator (e.g., a ring, matching the "today" treatment on the day grid).
- Transition between views should feel immediate (no animation required, but avoid layout shifts — keep the widget dimensions constant).

### Accessibility

- The month/year heading should be a `<button>` with `aria-label="Choose month and year, currently March 2026"`.
- Month picker grid: `role="grid"` with `role="gridcell"` for each month. Arrow key navigation matching the day grid pattern (left/right/up/down).
- Year picker grid: same pattern.
- `aria-live="polite"` announcement when view changes (e.g., "Month picker, 2026").

### Keyboard

- `Enter`/`Space` on the month-year heading opens the month picker.
- Arrow keys navigate months/years. `Enter` selects.
- `Escape` returns to the previous view (year picker → month picker → day grid).

## Verification

- Click month-year heading → month picker appears with 12 months. Click "Jun" → day grid shows June.
- In month picker, click year → year picker appears. Select a different year → month picker updates. Select a month → day grid shows that month/year.
- Set `quickNavigation={false}` → heading is not clickable, no drill-up behavior.
- Full keyboard flow: Tab to heading → Enter → arrow to desired month → Enter → day grid updates.
- Widget dimensions remain constant across all three views.
- Unit tests cover: opening/closing month picker, selecting a month, year picker navigation, keyboard navigation through all views, `quickNavigation={false}` disabling.
