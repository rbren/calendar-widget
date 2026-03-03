---
tag: pm
state: open
---

# 0037 — className, style, and Subcomponent Class Props

## Problem

The architecture (issue 0005) defines a `className` prop on the root element, but many consumers need more granular styling control without overriding CSS custom properties or using CSS Modules internals. Common needs include:

- Adding a class to the header for layout integration.
- Styling the grid container for specific spacing.
- Adding inline styles for dynamic, runtime-computed values (e.g., positioning the calendar relative to an input).
- Passing `data-*` attributes for testing frameworks (e.g., Cypress `data-testid`).

Without explicit prop forwarding for common HTML attributes, consumers resort to fragile DOM queries or wrapper elements that break layout.

## Requirements

### Root element props

```ts
interface CalendarWidgetProps {
  /** Additional CSS class name for the root element (existing, unchanged). */
  className?: string;
  /** Inline styles for the root element. */
  style?: React.CSSProperties;
  /** HTML id for the root element. */
  id?: string;
}
```

### Subcomponent class name props

Provide targeted class name overrides for key internal elements:

```ts
interface CalendarWidgetProps {
  /** Additional class names for internal elements, merged with default classes. */
  classNames?: {
    /** Root container */
    root?: string;
    /** Header area (navigation + month label) */
    header?: string;
    /** Day-of-week header row */
    weekdayRow?: string;
    /** The grid/table of day cells */
    grid?: string;
    /** Individual day cells */
    dayCell?: string;
    /** Today's day cell (added alongside dayCell) */
    todayCell?: string;
    /** Selected day cell */
    selectedCell?: string;
    /** Disabled day cell */
    disabledCell?: string;
    /** Navigation buttons (prev/next) */
    navButton?: string;
    /** Month/year label in header */
    monthLabel?: string;
  };
}
```

### Behavior

- `classNames` entries are **merged** with the component's own CSS Module classes, not replacements. The consumer's classes are appended after the internal classes.
- `className` on the root is equivalent to `classNames.root` — if both are provided, both are applied.
- `style` is applied directly to the root element's `style` attribute. It does not override CSS custom properties defined in the CSS Modules — inline styles have higher specificity for the properties they set.

### `data-*` and `aria-*` forwarding

The root element should forward any `data-*` and `aria-*` props passed to `CalendarWidget`:

```tsx
<CalendarWidget data-testid="booking-calendar" aria-describedby="help-text" />
// Root element receives: data-testid="booking-calendar" aria-describedby="help-text"
```

Implementation: spread remaining props (after extracting known props) onto the root element. Use a helper to filter only `data-*` and `aria-*` attributes for safety.

## Verification

- `<CalendarWidget className="my-class" />` → root element has both the CSS Module class and `my-class`.
- `<CalendarWidget style={{ border: '2px solid red' }} />` → root element has the inline style.
- `<CalendarWidget classNames={{ header: 'bold-header', dayCell: 'big-day' }} />` → header element has `bold-header` class, each day cell has `big-day` class, alongside default classes.
- `<CalendarWidget data-testid="cal" />` → root element has `data-testid="cal"`.
- Both `className` and `classNames.root` provided → both classes present on root.
- Default styling is not broken by any `classNames` entry (consumer classes add to, not replace, defaults).
- Unit tests cover: `className` forwarding, `style` forwarding, each `classNames` entry applied to correct element, `data-*` forwarding, `aria-*` forwarding, combination of `className` and `classNames.root`.
