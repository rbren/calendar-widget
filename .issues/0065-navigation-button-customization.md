---
tag: pm
state: open
---

# 0065 — Navigation Button Customization

## Problem

The prev/next month navigation buttons in `CalendarHeader` use hardcoded Unicode characters (`‹` and `›`). Consumers cannot replace these with custom icons (SVG, icon library components, or image elements) without completely replacing the header (issue 0035). This is the most frequent customization request for calendar widgets — every design system has its own icon set, and a calendar that forces specific arrow characters looks out of place.

Additionally, the "Previous month" / "Next month" aria-labels are hardcoded in English, which breaks accessibility for non-English locales.

## Requirements

### New props for icon content

```ts
interface CalendarWidgetProps {
  /** Custom content for the previous-month button. Default: "‹" */
  prevMonthIcon?: React.ReactNode;
  /** Custom content for the next-month button. Default: "›" */
  nextMonthIcon?: React.ReactNode;
  /** Custom aria-label for the previous-month button. Default: "Previous month" */
  prevMonthAriaLabel?: string;
  /** Custom aria-label for the next-month button. Default: "Next month" */
  nextMonthAriaLabel?: string;
}
```

### Pass-through to CalendarHeader

Add the corresponding props to `CalendarHeaderProps`:

```ts
interface CalendarHeaderProps {
  // ... existing
  prevMonthIcon?: React.ReactNode;
  nextMonthIcon?: React.ReactNode;
  prevMonthAriaLabel?: string;
  nextMonthAriaLabel?: string;
}
```

### Implementation

In `CalendarHeader`, replace the hardcoded content:

```tsx
<button
  type="button"
  className={styles.navBtn}
  aria-label={prevMonthAriaLabel ?? 'Previous month'}
  onClick={onPrevMonth}
>
  {prevMonthIcon ?? '‹'}
</button>
```

Same pattern for the next-month button.

In `CalendarWidget`, pass these props through to `CalendarHeader`.

### Usage examples

```tsx
// With an icon library
import { ChevronLeft, ChevronRight } from 'lucide-react';
<CalendarWidget
  prevMonthIcon={<ChevronLeft size={16} />}
  nextMonthIcon={<ChevronRight size={16} />}
/>

// Localized labels
<CalendarWidget
  locale="de-DE"
  prevMonthAriaLabel="Vorheriger Monat"
  nextMonthAriaLabel="Nächster Monat"
/>

// Text arrows
<CalendarWidget
  prevMonthIcon="←"
  nextMonthIcon="→"
/>
```

## Verification

- Render with default props → `‹` and `›` characters display, aria-labels say "Previous month" / "Next month".
- Render with `prevMonthIcon={<svg>...</svg>}` and `nextMonthIcon={<svg>...</svg>}` → SVG icons render inside the buttons.
- Render with `prevMonthAriaLabel="Mois précédent"` → button has the French aria-label.
- Clicking customized buttons still navigates months correctly.
- Keyboard navigation (Tab to button, Enter) still works.
- When `prevMonthIcon` is a React component with its own click handler, the calendar's navigation handler is not interfered with.
- Unit tests cover: default rendering, custom ReactNode icons render correctly, custom aria-labels apply, navigation still functions.
