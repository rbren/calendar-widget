---
tag: pm
state: open
---

# 0049 — Weekday Header Format Option

## Problem

The weekday column headers are hardcoded to the `'short'` format (e.g., "Mon", "Tue", "Wed"). Many calendar designs use narrow single-letter headers ("M", "T", "W") to save space—especially in compact layouts, sidebars, or mobile views. Other designs prefer long-form headers ("Monday", "Tuesday") for clarity in spacious layouts. Consumers currently have no way to control this without replacing the entire grid component.

Competing libraries (react-day-picker, MUI DateCalendar) provide a `weekdayFormat` or `formatters.weekday` option. Without it, our widget forces a single visual density that doesn't adapt to different design contexts.

## Requirements

### New prop

```ts
interface CalendarWidgetProps {
  /** Format for weekday column headers.
   *  - 'narrow': single letter (M, T, W)
   *  - 'short': abbreviated (Mon, Tue, Wed) — default
   *  - 'long': full name (Monday, Tuesday, Wednesday)
   *  Alternatively, pass a function for full control:
   *  (date: Date, locale?: string) => string
   */
  weekdayFormat?: 'narrow' | 'short' | 'long' | ((date: Date, locale?: string) => string);
}
```

### Implementation guidance

In `CalendarGrid`, the existing `getWeekdayHeaders` function already uses `Intl.DateTimeFormat` with `{ weekday: 'short' }`. Update it to accept the `weekdayFormat` prop:

- If `weekdayFormat` is a string (`'narrow'`, `'short'`, or `'long'`), pass it as the `weekday` option to `Intl.DateTimeFormat`.
- If `weekdayFormat` is a function, call it with each weekday's `Date` object and the `locale` to produce the header string.
- Default remains `'short'` for backward compatibility.

The `weekdayFormat` prop must flow from `CalendarWidget` → `CalendarGrid` via the `CalendarGridProps` interface.

### Accessibility

- The `<th>` elements should always include an `abbr` attribute with the full weekday name when using `'narrow'` or `'short'` formats, so screen readers can announce the complete name:

```html
<th scope="col" abbr="Monday">M</th>
```

- When `weekdayFormat` is `'long'`, the `abbr` attribute can be omitted since the full name is already visible.

### Prop threading

```ts
interface CalendarGridProps {
  // ... existing props
  /** Weekday header format */
  weekdayFormat?: 'narrow' | 'short' | 'long' | ((date: Date, locale?: string) => string);
}
```

## Verification

- Default behavior unchanged: headers show "Sun", "Mon", "Tue", etc.
- `weekdayFormat="narrow"` → headers show "S", "M", "T", "W", "T", "F", "S".
- `weekdayFormat="long"` → headers show "Sunday", "Monday", etc.
- `weekdayFormat="narrow"` with `locale="de-DE"` → German narrow weekday labels.
- Custom function: `weekdayFormat={(d) => d.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()}` → "SUN", "MON", etc.
- Inspect DOM: `<th>` elements have `abbr` attribute with full weekday name when format is `'narrow'` or `'short'`.
- Screen reader announces full weekday names regardless of display format.
- Unit tests cover: all three string options, custom function, locale interaction, abbr attribute presence, backward compatibility with no prop.
