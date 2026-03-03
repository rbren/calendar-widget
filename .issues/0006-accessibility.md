---
tag: architecture
state: closed
---

# 0006 — Accessibility (a11y)

## Problem

Calendar widgets are notoriously inaccessible. WCAG 2.1 AA compliance must be designed in from the start, not bolted on later.

## Requirements

Follow the [WAI-ARIA APG Dialog Date Picker pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/):

### Roles & attributes

| Element | Role / Attribute |
|---|---|
| Calendar grid | `role="grid"`, `aria-label="Calendar"` |
| Header row (day names) | `role="row"` with `role="columnheader"` cells |
| Each week | `role="row"` |
| Each day cell | `role="gridcell"` |
| Selected day | `aria-selected="true"` |
| Disabled day | `aria-disabled="true"` |
| Today | identified via `aria-current="date"` |
| Prev/Next buttons | `aria-label="Previous month"` / `aria-label="Next month"` |
| Live region for month changes | `aria-live="polite"` on the month/year heading |

### Keyboard navigation

| Key | Action |
|---|---|
| `ArrowRight` | Move focus to next day |
| `ArrowLeft` | Move focus to previous day |
| `ArrowDown` | Move focus to same day next week |
| `ArrowUp` | Move focus to same day previous week |
| `Home` | Move focus to first day of week |
| `End` | Move focus to last day of week |
| `PageUp` | Move to same day in previous month |
| `PageDown` | Move to same day in next month |
| `Enter` / `Space` | Select focused date |
| `Escape` | Close calendar (if in a popup context) |

### Focus management

- Only one day cell is in the tab order at a time (`tabIndex={0}`); all others are `tabIndex={-1}`.
- Arrow keys move the roving `tabIndex`.
- When the month changes via keyboard, focus stays on the equivalent date in the new month.

### Testing

- Write tests with `@testing-library/react` that verify:
  - Arrow key navigation moves focus correctly
  - `aria-selected`, `aria-disabled`, `aria-current` are set on the right elements
  - Screen-reader-only text is present for prev/next buttons
- Consider adding `eslint-plugin-jsx-a11y`:
  ```bash
  npm install --save-dev eslint-plugin-jsx-a11y
  ```
  and integrating it into the ESLint config.

## Verification

- `npm run lint` includes jsx-a11y rules and passes
- Every interactive element is reachable and operable via keyboard alone
- `npm test` includes at least 5 a11y-specific test cases covering keyboard nav, ARIA attributes, and focus management
- Manual test: use a screen reader (VoiceOver / NVDA) to navigate the calendar — month changes are announced
