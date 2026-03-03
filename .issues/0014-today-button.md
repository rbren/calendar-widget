---
tag: pm
state: open
---

# 0014 — "Today" Button

## Problem

After navigating away from the current month (especially when combined with year/month quick navigation from issue 0013), users have no fast way to return to today's date. A "Today" button is a standard calendar UX convention that reduces friction.

## Requirements

### Behavior

Add an optional "Today" button to the calendar header area:

1. Clicking "Today" navigates the view to the month containing today's date.
2. It does **not** select today's date — it only changes the displayed month. Selection should remain a deliberate user action.
3. The button should be visually de-emphasized (secondary style) so it doesn't compete with prev/next navigation.
4. If the calendar is already showing the current month, the button should be present but visually dimmed / disabled to indicate "you're already here".

### Props

```ts
interface CalendarWidgetProps {
  /** Show a "Today" button for quick navigation to the current month (default: true) */
  showTodayButton?: boolean;
  /** Custom label for the today button (default: "Today"). Useful for i18n. */
  todayButtonLabel?: string;
}
```

### Placement

The button should appear in the header row, centered between the prev/next arrows, below the month-year label. If space is constrained, it may appear as a small text link below the heading.

### Accessibility

- `aria-label="Navigate to current month"` (or include the actual month, e.g., "Navigate to March 2026").
- Keyboard accessible: reachable via `Tab`, activatable via `Enter`/`Space`.
- If disabled (already showing current month): `aria-disabled="true"`.

## Verification

- Navigate to a distant month → click "Today" → view jumps to the current month, no date is selected.
- Already on current month → "Today" button appears disabled.
- `showTodayButton={false}` → button is not rendered.
- `todayButtonLabel="Aujourd'hui"` → button reads "Aujourd'hui".
- Keyboard: Tab to Today button → Enter → view changes to current month.
- Unit tests cover: navigation to today, disabled state when on current month, hidden when `showTodayButton={false}`, custom label rendering.
