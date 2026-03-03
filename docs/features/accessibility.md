# Accessibility

The calendar widget follows [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apd/patterns/grid/) conventions.

## ARIA roles and attributes

| Element | Role / Attribute | Purpose |
|---------|-----------------|---------|
| Date grid `<table>` | `role="grid"`, `aria-label="Calendar"` | Identifies the grid to assistive technology |
| Weekday headers `<th>` | `role="columnheader"` | Labels each column |
| Day cells `<td>` | `role="gridcell"` | Identifies each interactive cell |
| Day cells | `aria-selected` | Reflects selection state (including range start/end) |
| Day cells | `aria-disabled` | Reflects disabled state |
| Day cells | `aria-label` | Full descriptive label, e.g. `"Saturday, March 15, 2026 (today, selected)"` |
| Today's cell | `aria-current="date"` | Identifies today |
| Month/year label | `aria-live="polite"` | Announces month changes to screen readers |
| Navigation buttons | `aria-label` | `"Previous month"` / `"Next month"` |

### Day cell labels

Every day cell has a descriptive `aria-label` built from the full date and its current state. Examples:

- `"Sunday, March 15, 2026"` — plain day
- `"Sunday, March 15, 2026 (today)"` — today's date
- `"Sunday, March 15, 2026 (today, selected)"` — today and selected
- `"Monday, March 10, 2026 (selected, start of range)"` — range start
- `"Friday, March 20, 2026 (selected, end of range)"` — range end
- `"Wednesday, March 12, 2026 (in selected range)"` — within a range
- `"Thursday, March 25, 2026 (unavailable)"` — disabled date

## Keyboard navigation

The grid uses a **roving tabindex** pattern — only one cell at a time has `tabIndex={0}`, all others have `tabIndex={-1}`. This means `Tab` moves focus in/out of the grid, while arrow keys move between cells:

| Key | Action |
|-----|--------|
| `←` | Move focus to the previous day |
| `→` | Move focus to the next day |
| `↑` | Move focus to the same day in the previous week |
| `↓` | Move focus to the same day in the next week |
| `Home` | Move focus to the first day of the current week |
| `End` | Move focus to the last day of the current week |
| `PageUp` | Move focus to the same day in the previous month |
| `PageDown` | Move focus to the same day in the next month |
| `Enter` / `Space` | Select the focused date |

When keyboard navigation moves the focus outside the currently displayed month, the calendar automatically navigates to show that month.

## Focus management

- On initial render, the focused date defaults to the selected date (or today if no date is selected).
- After keyboard navigation changes the focused date, DOM focus is moved to the new cell automatically (only if the grid already contains the active element).
- The focus indicator uses `:focus-visible` styling with a 2px primary-color outline.
