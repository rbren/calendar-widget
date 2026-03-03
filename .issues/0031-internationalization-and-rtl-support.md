---
tag: pm
state: open
---

# 0031 — Internationalization & RTL Support

## Problem

The current architecture (issue 0005) defines a `locale` prop and uses `Intl.DateTimeFormat` for month/year formatting, but there is no comprehensive internationalization strategy. Critically, right-to-left (RTL) languages like Arabic, Hebrew, and Persian are completely unsupported. A calendar widget that doesn't handle RTL is unusable for ~400 million native RTL speakers. Additionally, locale-aware defaults (e.g., first day of week) are not derived from the locale — they require manual `weekStartsOn` configuration, which is error-prone.

## Requirements

### RTL layout support

When the locale is an RTL language (or when explicitly configured), the entire calendar layout must mirror:

1. **Grid direction**: Day columns reverse — Saturday appears on the left, Sunday on the right (for Arabic locales). Implement via `direction: rtl` on the root element.
2. **Navigation arrows**: Previous month arrow points right (→), next month arrow points left (←). Or more precisely, "previous" moves toward the inline-start direction.
3. **Keyboard navigation**: `ArrowLeft` moves to the *next* day (visually right-to-left), `ArrowRight` moves to the *previous* day. This matches standard RTL keyboard conventions.
4. **Animations** (issue 0022): Slide direction reverses — "next" slides from the left, "previous" slides from the right.

### Props

```ts
interface CalendarWidgetProps {
  /** Locale string for Intl formatting (default: browser default).
   *  Also determines text direction and first-day-of-week unless overridden. */
  locale?: string;
  /** Explicitly set text direction. Auto-detected from locale if not provided. */
  dir?: 'ltr' | 'rtl' | 'auto';
}
```

### Locale-aware first day of week

When `weekStartsOn` is not explicitly provided, derive it from the locale:

- Use `Intl.Locale` API where available: `new Intl.Locale(locale).getWeekInfo().firstDay`
- Provide a fallback mapping for environments that don't support `getWeekInfo()` (common locales: `en` → Sunday, `de`/`fr`/`es`/`ar`/`he` → Monday/Saturday as appropriate).
- When `weekStartsOn` is explicitly provided, it takes precedence over locale detection.

### Localized day and month names

All text content must come from `Intl.DateTimeFormat` using the configured locale:

- **Day-of-week headers**: Use `Intl.DateTimeFormat(locale, { weekday: 'narrow' })` for the grid header. Add a prop to control the format:

```ts
interface CalendarWidgetProps {
  /** Format for day-of-week header labels (default: 'narrow') */
  weekdayFormat?: 'narrow' | 'short' | 'long';
}
```

- **Month/year heading**: Already uses `Intl.DateTimeFormat` via `formatMonthYear` — ensure it respects the locale prop.
- **Spoken labels**: `aria-label` on day cells should use the full localized date string from `Intl.DateTimeFormat(locale, { dateStyle: 'full' })`.

### Utility functions

Add to `src/utils/dates.ts`:

```ts
/** Detect if a locale uses RTL script. */
function isRTLLocale(locale: string): boolean;

/** Get the conventional first day of week for a locale (0=Sun, 1=Mon, ..., 6=Sat). */
function getLocaleFirstDayOfWeek(locale: string): number;

/** Get localized weekday names for a locale in the given format. */
function getWeekdayNames(locale: string, format: 'narrow' | 'short' | 'long'): string[];
```

### CSS considerations

- Use CSS logical properties (`margin-inline-start` instead of `margin-left`, `padding-inline-end` instead of `padding-right`) throughout all component styles. This makes RTL work with just a `dir="rtl"` attribute and no separate stylesheet.
- Do not hardcode directional values in CSS. Replace any existing `left`/`right` with `inline-start`/`inline-end`.

## Verification

- `<CalendarWidget locale="ar-SA" />` → Calendar renders right-to-left: Saturday on the left column, day names in Arabic, month/year in Arabic, week starts on Saturday.
- `<CalendarWidget locale="he-IL" />` → RTL layout, Hebrew day/month names, week starts on Sunday.
- `<CalendarWidget locale="de-DE" />` → LTR layout, German day/month names, week starts on Monday (auto-detected).
- `<CalendarWidget locale="en-US" />` → LTR, English, week starts on Sunday.
- `<CalendarWidget locale="ar-SA" weekStartsOn={1} />` → RTL layout but week starts on Monday (explicit override).
- `<CalendarWidget locale="en-US" dir="rtl" />` → English text but RTL layout (explicit override).
- Keyboard: in RTL mode, `ArrowLeft` moves forward (to next day), `ArrowRight` moves backward.
- `weekdayFormat="short"` → day headers show "Mon", "Tue" etc. instead of "M", "T".
- Screen reader announces full localized date (e.g., "الجمعة، ٥ مارس ٢٠٢٦" for Arabic).
- All CSS uses logical properties — inspect styles for absence of physical `left`/`right`/`margin-left` etc.
- Unit tests cover: RTL detection for known locales, locale-aware first-day-of-week, localized day names, keyboard reversal in RTL, `dir` prop override, `weekdayFormat` options.
