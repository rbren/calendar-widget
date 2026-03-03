---
tag: pm
state: open
---

# 0061 — Locale-Aware Week Start Auto-Detection

## Problem

The `weekStartsOn` prop defaults to `0` (Sunday), which is only correct for a handful of locales (primarily the US). In most of Europe, Asia, and elsewhere, weeks start on Monday. Users who pass `locale="de-DE"` or `locale="fr-FR"` reasonably expect the calendar to start on Monday automatically — they shouldn't have to pair every `locale` prop with a manual `weekStartsOn={1}`.

Every major calendar library handles this: `react-day-picker` derives the week start from the locale via `date-fns`, MUI's `DateCalendar` uses the adapter's locale settings, and the `Intl.Locale` API (supported in all modern browsers and Node 18+) exposes `weekInfo.firstDay` for exactly this purpose.

## Requirements

### Auto-detect week start from locale

When `weekStartsOn` is **not** explicitly provided, derive the first day of the week from the `locale` prop:

```ts
function getWeekStartFromLocale(locale?: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  try {
    const loc = new Intl.Locale(locale ?? navigator.language ?? 'en-US');
    // weekInfo.firstDay: 1=Mon..7=Sun (ISO convention) in most runtimes
    const firstDay = (loc as any).weekInfo?.firstDay
      ?? (loc as any).getWeekInfo?.()?.firstDay;
    if (firstDay != null) {
      return (firstDay % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    }
  } catch {
    // Unsupported locale string — fall through
  }
  return 0; // fallback: Sunday
}
```

Note: `Intl.Locale.prototype.weekInfo` is a Stage 4 proposal and is available in Chrome 99+, Firefox 110+, Safari 17+, and Node 18.11+. Use optional chaining and a fallback for older runtimes.

### Explicit `weekStartsOn` always wins

If the consumer passes `weekStartsOn={1}`, that value must be used regardless of the locale. The auto-detection only applies when `weekStartsOn` is `undefined`.

### Where to apply

In `useCalendarState`, resolve the effective `weekStartsOn`:

```ts
const effectiveWeekStartsOn = props.weekStartsOn ?? getWeekStartFromLocale(props.locale);
```

Then use `effectiveWeekStartsOn` everywhere that currently reads `weekStartsOn`.

### Export the utility

Export `getWeekStartFromLocale` from the public API so consumers can use it in their own logic if needed.

## Verification

- Render `<CalendarWidget locale="de-DE" />` → calendar grid starts on Monday (Mon is the first column header).
- Render `<CalendarWidget locale="en-US" />` → calendar grid starts on Sunday.
- Render `<CalendarWidget locale="ar-SA" />` → calendar grid starts on Saturday (Saudi Arabia).
- Render `<CalendarWidget locale="de-DE" weekStartsOn={0} />` → explicit override wins, starts on Sunday.
- Render `<CalendarWidget />` with no locale → falls back to `navigator.language`; if that returns `"en-US"`, week starts on Sunday.
- Unit tests cover: auto-detection for at least 3 locales with different week starts (Sunday, Monday, Saturday), explicit override, fallback when locale is unsupported, and SSR-safe behavior (no `navigator` available).
