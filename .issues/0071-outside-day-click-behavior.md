---
tag: pm
state: open
---

# 0071 — Outside Day Click Behavior

## Problem

The calendar grid always renders 6 rows × 7 columns, which means days from the previous and next month ("outside days") are visible. Currently, clicking an outside day selects it and navigates to that day's month. This is the only available behavior, but different applications need different handling:

- **Date pickers** (e.g., flight booking): Clicking an outside day should select it and navigate — current behavior is correct.
- **Month-focused calendars** (e.g., event planners, schedule views): Clicking an outside day should do nothing — users don't expect to leave the current month by clicking a faded date.
- **Navigation-only**: Clicking an outside day should navigate to that month but not select the date — useful for browsing.

Without a prop to control this, consumers who want month-focused behavior must use CSS `pointer-events: none` on outside days (fragile) or add logic in `onChange` to reject outside-month selections (poor UX since the calendar still navigates).

Issue 0042 covers *showing or hiding* outside days. This issue covers what happens when they are visible and the user *clicks* them.

## Requirements

### New prop

```ts
interface CalendarWidgetProps {
  /** Behavior when clicking a day outside the displayed month.
   *  - 'select' — select the date and navigate to its month (default).
   *  - 'navigate' — navigate to the date's month without selecting it.
   *  - 'none' — ignore the click entirely; outside days are inert.
   */
  outsideDayAction?: 'select' | 'navigate' | 'none';
}
```

### Behavior details

| `outsideDayAction` | Click on outside day | `onChange` fires? | View navigates? |
|---|---|---|---|
| `'select'` (default) | Selects date, navigates to its month | Yes | Yes |
| `'navigate'` | Does not select, but navigates to that month | No | Yes |
| `'none'` | Nothing happens | No | No |

### Visual treatment for `outsideDayAction="none"`

When outside days are completely inert:
- They should still be visible (for grid completeness), styled with `--cw-color-text-muted`.
- They should have `cursor: default` (not `pointer`).
- They should have no hover highlight.
- They should have `aria-disabled="true"` and `tabIndex={-1}` — keyboard navigation skips them.

### Visual treatment for `outsideDayAction="navigate"`

When outside days navigate but don't select:
- They should remain clickable with `cursor: pointer` and a hover highlight.
- They should **not** have `aria-selected` after click.
- Keyboard: arrow keys can navigate to them; Enter/Space navigates the view without selecting.

### Integration with other features

- **Show/hide outside days** (issue 0042): If `showOutsideDays={false}`, `outsideDayAction` is irrelevant — outside day cells are empty.
- **Range mode** (issue 0012): In range mode with `outsideDayAction="none"`, outside days cannot be used as range start/end. With `outsideDayAction="select"` (default), they can.
- **Keyboard navigation**: When `outsideDayAction="none"`, arrow keys that would move to an outside day should wrap or stop at the month boundary. When `outsideDayAction="navigate"`, arrowing to an outside day changes the displayed month (existing behavior).

## Verification

- `outsideDayAction="select"` (default): Click outside day → date selected, month navigates. This is existing behavior; verify no regression.
- `outsideDayAction="navigate"`: Click outside day in previous month → view navigates to that month, `onChange` does NOT fire.
- `outsideDayAction="none"`: Click outside day → nothing happens. No navigation, no selection.
- `outsideDayAction="none"`: Outside days have `aria-disabled="true"`, no hover effect, `cursor: default`.
- `outsideDayAction="none"`: Keyboard arrows at month boundary do not move to outside days.
- Range mode + `outsideDayAction="none"`: Cannot start or end a range on an outside day.
- Combined with `showOutsideDays={false}` (issue 0042): `outsideDayAction` has no observable effect.
- Unit tests cover: each action mode for click behavior, onChange invocation, navigation behavior, ARIA attributes per mode, keyboard boundary behavior per mode, range mode interaction, combination with showOutsideDays.
