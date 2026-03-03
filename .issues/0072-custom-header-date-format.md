---
tag: pm
state: open
---

# 0072 — Custom Header Date Formatter

## Problem

The calendar header displays the month/year as "March 2026" using `Intl.DateTimeFormat` with `{ month: 'long', year: 'numeric' }`. There is no way to customize this format. Real-world needs include:

- **Abbreviated format**: "Mar 2026" for compact layouts.
- **Year-first format**: "2026年3月" for East Asian locales where `Intl` output may not match app conventions.
- **Custom separators**: "March / 2026" or "March, 2026".
- **Fiscal/academic calendars**: "Q1 2026" or "Spring Semester" instead of month names.
- **Consistency with app design system**: Match the date format used elsewhere in the host application.

The `locale` prop controls the locale passed to `Intl.DateTimeFormat`, but it doesn't allow structural changes to the format. Consumers need a formatting escape hatch.

## Requirements

### New prop

```ts
interface CalendarWidgetProps {
  /** Custom formatter for the month/year header label.
   *  Receives the first day of the displayed month.
   *  Return a string to replace the default "Month Year" label.
   *  When not provided, uses Intl.DateTimeFormat with the locale prop. */
  formatMonthYear?: (date: Date) => string;
}
```

### Behavior

- When `formatMonthYear` is provided, it completely replaces the default `Intl.DateTimeFormat` formatting.
- The function receives a `Date` set to the 1st of the displayed month (e.g., `new Date(2026, 2, 1)` for March 2026).
- The returned string is used as both the visual header text and the base for the `aria-label` on the heading button (when `quickNavigation` is enabled).
- When `formatMonthYear` is not provided, existing behavior is unchanged.

### Accessibility

The heading button's `aria-label` should adapt to the custom format:
- Default: `"Choose month and year, currently March 2026"`
- With `formatMonthYear`: `"Choose month and year, currently <custom output>"`

Ensure that even with a terse custom format like "3/2026", the aria-label still provides enough context.

### Integration with quick navigation (issue 0013)

- In month picker view, the header shows just the year (e.g., "2026"). `formatMonthYear` does NOT affect the month picker or year picker headers — it only controls the day-grid header.
- If the consumer wants to control the month picker header, that's a separate concern (issue 0035 custom header rendering covers broader header customization).

### Example usage

```tsx
// Abbreviated month
<CalendarWidget
  formatMonthYear={(date) =>
    date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
/>

// Japanese format
<CalendarWidget
  formatMonthYear={(date) =>
    `${date.getFullYear()}年${date.getMonth() + 1}月`
  }
/>

// Fiscal quarter
<CalendarWidget
  formatMonthYear={(date) => {
    const q = Math.floor(date.getMonth() / 3) + 1;
    return `Q${q} ${date.getFullYear()}`;
  }}
/>
```

### Implementation guidance

In `useCalendarState`, the `monthYearLabel` memo should check for `formatMonthYear`:

```ts
const monthYearLabel = useMemo(
  () => formatMonthYearProp
    ? formatMonthYearProp(viewDate)
    : formatMonthYear(viewDate, locale),
  [viewDate, locale, formatMonthYearProp],
);
```

The `headingAriaLabel` should use the custom label when available.

## Verification

- `formatMonthYear={(d) => 'Custom'}` → header shows "Custom", aria-label includes "Custom".
- Without `formatMonthYear` → default "March 2026" behavior unchanged.
- `formatMonthYear` with abbreviated format → "Mar 2026" in header.
- Quick navigation: click heading → month picker appears. Month picker header still shows "2026" (not affected by `formatMonthYear`). Select a month → day grid header shows custom format for the new month.
- `formatMonthYear` + `locale` both provided → `formatMonthYear` takes precedence for the header label.
- Unit tests cover: custom string renders in header, default behavior without prop, aria-label reflects custom format, month picker unaffected, re-renders when formatter reference changes.
