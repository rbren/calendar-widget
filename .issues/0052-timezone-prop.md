---
tag: pm
state: open
---

# 0052 — Timezone-Aware Mode

## Problem

The widget relies entirely on the browser's local timezone for all date operations. `new Date()` for determining "today", date comparisons, and month boundaries all use the user's local system clock. This causes incorrect behavior in applications that need to display a calendar relative to a specific timezone:

- **Booking systems:** A hotel in Tokyo needs to show availability based on JST. A user in New York viewing the calendar at 11 PM EST sees the wrong "today" (it's already tomorrow in Tokyo).
- **Scheduling across timezones:** A meeting scheduler that works in the organizer's timezone should highlight the correct "today" regardless of the viewer's local time.
- **Server-rendered consistency:** When rendering on a UTC server vs. a user's local browser, "today" can differ, causing hydration mismatches (relates to issue 0043).

The `Intl.DateTimeFormat` API already supports timezone resolution, but the widget doesn't use it for determining "today" or for any date logic.

## Requirements

### New prop

```ts
interface CalendarWidgetProps {
  /** IANA timezone identifier for determining "today" and date boundaries.
   *  Examples: 'America/New_York', 'Asia/Tokyo', 'UTC'.
   *  Default: undefined (uses browser's local timezone). */
  timeZone?: string;
}
```

### Behavior changes when `timeZone` is set

1. **"Today" determination:** Instead of `new Date()`, compute today's date in the specified timezone. Use `Intl.DateTimeFormat` to resolve the current date in that timezone:

```ts
function getTodayInTimeZone(timeZone: string): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const year = Number(parts.find(p => p.type === 'year')!.value);
  const month = Number(parts.find(p => p.type === 'month')!.value) - 1;
  const day = Number(parts.find(p => p.type === 'day')!.value);
  return new Date(year, month, day);
}
```

2. **Today highlight:** The "today" ring appears on the date that is "today" in the specified timezone.

3. **Default initial view:** When no `value` or `defaultMonth` is provided, the calendar opens to the month containing "today" in the specified timezone.

4. **All other date logic unchanged:** The `value`, `minDate`, `maxDate`, and `disabledDates` props continue to be plain `Date` objects representing calendar dates. The timezone prop only affects the determination of "today" and the initial view month.

### Utility export

Export the timezone resolution function so consumers can use it in their own logic:

```ts
export function getToday(timeZone?: string): Date;
```

### Implementation guidance

- Add a `today` value to `useCalendarState` that is computed once (via `useMemo`) using the `timeZone` prop if provided, or `new Date()` if not.
- Pass this `today` down to `CalendarGrid` instead of creating `new Date()` inline in the grid component.
- Update `CalendarGridProps` to accept `today: Date` instead of computing it internally.

### No dependency on timezone libraries

Do NOT add `date-fns-tz`, `luxon`, `moment-timezone`, or any other library. The `Intl.DateTimeFormat` API is available in all supported environments (Node 14+, all modern browsers) and is sufficient for resolving the current date in a timezone.

## Verification

- No `timeZone` prop: behavior identical to current (today based on local clock).
- `timeZone="Asia/Tokyo"` viewed from a US timezone late at night: the "today" highlight shows on the next day (matching Tokyo's date).
- `timeZone="UTC"`: today highlight matches the current UTC date.
- Invalid timezone string (e.g., `timeZone="Fake/Zone"`): should throw or log a clear error (Intl throws `RangeError`—let it propagate).
- The `getToday('America/New_York')` utility returns the correct date in that timezone.
- Switching `timeZone` prop dynamically updates the today highlight without remounting.
- Unit tests cover: today resolution in different timezones (mock system time for deterministic testing), initial view month based on timezone today, today highlight correctness, getToday utility, no regression when prop is omitted.
