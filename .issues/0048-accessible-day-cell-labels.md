---
tag: pm
state: closed
---

# 0048 — Accessible Day Cell Labels (aria-label)

## Problem

Each day cell currently renders only `date.getDate()` as its text content (e.g., "15") and has no `aria-label`. Screen readers announce just the bare number with no month or year context. When navigating through the grid, a user hears "15… 16… 17…" but cannot tell what month they're in without navigating back to the header. This is especially problematic when focus crosses into outside days from an adjacent month—the number alone gives no indication that the month has changed.

This is a WCAG 2.1 SC 1.1.1 (Non-text Content) and SC 4.1.2 (Name, Role, Value) compliance gap. Every major calendar implementation (react-day-picker, MUI DateCalendar, Ant Design DatePicker, ARIA APG date picker example) provides full date labels on day cells.

## Requirements

### Full date aria-label on every day cell

Each `<td>` in the day grid must have an `aria-label` containing the fully formatted date, using `Intl.DateTimeFormat` with the component's `locale`:

```
aria-label="Saturday, March 15, 2026"
```

The format should include: weekday (long), month (long), day (numeric), year (numeric). This gives screen reader users complete context on every cell without needing to refer to the header.

### Compose additional context into the label

When other features add semantic meaning to a date, the aria-label must include that context. Append status information after the date:

- If the date is today: `"Saturday, March 15, 2026 (today)"`
- If the date is selected: `"Saturday, March 15, 2026 (selected)"`
- If the date is disabled: `"Saturday, March 15, 2026 (unavailable)"`
- If the date has markers (issue 0019): `"Saturday, March 15, 2026, Team standup"`
- Combine statuses: `"Saturday, March 15, 2026 (today, selected)"`

### Implementation guidance

Add a utility function:

```ts
function formatDayLabel(
  date: Date,
  locale: string | undefined,
  flags: { isToday: boolean; isSelected: boolean; isDisabled: boolean },
  markerLabel?: string
): string
```

Call this in `CalendarDayCell` and pass the result as `aria-label` on the `<td>`. The `locale` prop must flow down from `CalendarWidget` → `CalendarGrid` → `CalendarDayCell`. Currently `CalendarDayCellProps` does not include `locale`—it needs to be added.

### Props change

```ts
interface CalendarDayCellProps {
  // ... existing props
  /** Locale for formatting the accessible date label */
  locale?: string;
  /** Optional marker/event label to include in the accessible name */
  markerLabel?: string;
}
```

## Verification

- With a screen reader (VoiceOver, NVDA, or JAWS), navigate through day cells with arrow keys. Each cell should announce the full date (e.g., "Saturday, March 15, 2026").
- Navigate from March 31 to an April outside day. The announcement should include "April" in the label.
- Select a date, then navigate back to it. The label includes "(selected)".
- Navigate to today. The label includes "(today)".
- Navigate to a disabled date. The label includes "(unavailable)".
- Set `locale="de-DE"`. Labels should render in German (e.g., "Samstag, 15. März 2026").
- Inspect the DOM: every `<td role="gridcell">` has an `aria-label` attribute with the full date string.
- Unit tests cover: label generation for all status combinations, locale formatting, marker label inclusion, composed multi-status labels.
