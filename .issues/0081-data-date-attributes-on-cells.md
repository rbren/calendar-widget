---
tag: pm
state: open
---

# 0081 — `data-date` Attributes on Day Cells

## Problem

Day cells in the calendar grid do not expose any DOM-queryable identifier for the date they represent. This makes several common tasks unnecessarily difficult:

- **Integration testing**: Finding a specific date cell requires traversing aria-labels or counting positions. A `data-date` attribute allows clean selectors like `[data-date="2026-03-15"]`.
- **CSS targeting**: Users cannot style specific dates via CSS selectors without resorting to `renderDay`. With `data-date`, they can write rules like `[data-date="2026-12-25"] { background: red; }`.
- **Automation / E2E testing**: Selenium, Playwright, and Cypress selectors become trivial with data attributes.
- **Analytics**: Click handlers can read the date from the DOM element directly.

This is a standard practice in calendar and datepicker components.

## Requirements

### `data-date` attribute on every day cell

Each `<td>` day cell should include a `data-date` attribute with the date in ISO 8601 format (`YYYY-MM-DD`):

```html
<td role="gridcell" data-date="2026-03-15" ...>15</td>
```

### Additional data attributes

For convenience, also add:
- `data-today="true"` — on the cell representing today's date.
- `data-selected="true"` — on selected cell(s).
- `data-outside="true"` — on cells from the previous/next month.
- `data-disabled="true"` — on disabled cells.

These are redundant with aria attributes and CSS classes, but data attributes are the conventional hook for external tools and CSS customization.

## Implementation Notes

1. In `CalendarDayCell.tsx`, add data attributes to the `<td>`:
   ```tsx
   <td
     role="gridcell"
     data-date={date.toISOString().slice(0, 10)}
     data-today={isToday || undefined}
     data-selected={isSelected || undefined}
     data-outside={!isCurrentMonth || undefined}
     data-disabled={isDisabled || undefined}
     // ... existing props
   >
   ```
2. Using `|| undefined` ensures attributes are only present when truthy (avoids `data-today="false"`).

## Verification

- Inspect the DOM → every `<td>` in the grid body has a `data-date="YYYY-MM-DD"` attribute.
- Today's cell has `data-today="true"`.
- A selected cell has `data-selected="true"`.
- Outside-month cells have `data-outside="true"`.
- Disabled cells have `data-disabled="true"`.
- `document.querySelector('[data-date="2026-03-15"]')` returns exactly one element.
- CSS rule `[data-date="2026-12-25"] { background: green; }` visually styles Christmas.
- Unit tests: verify data-date format, verify conditional data attributes, verify querySelectorability.
