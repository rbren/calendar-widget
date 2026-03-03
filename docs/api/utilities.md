# Utility Functions

Low-level date utilities exported from the package. These are the same functions used internally by the calendar components.

```tsx
import {
  getCalendarDays,
  isSameDay,
  isDateInRange,
  isDateDisabled,
  isDateRange,
  isDateBetween,
  formatMonthYear,
  formatDayLabel,
} from '@calendar-widget/core';
```

---

## getCalendarDays

```ts
function getCalendarDays(
  year: number,
  month: number,
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6,
): Date[][]
```

Returns a 6×7 two-dimensional array of `Date` objects representing a full calendar month view. Includes leading days from the previous month and trailing days from the next month to fill the grid.

**Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `year` | `number` | — | The full year (e.g. `2026`). |
| `month` | `number` | — | Zero-based month (`0` = January, `11` = December). |
| `weekStartsOn` | `0–6` | `0` | Day the week starts on. |

**Example:**

```ts
const weeks = getCalendarDays(2026, 2); // March 2026
// weeks.length === 6
// weeks[0].length === 7
```

---

## isSameDay

```ts
function isSameDay(a: Date, b: Date): boolean
```

Returns `true` if two `Date` objects represent the same calendar day (year, month, and date match). Time components are ignored.

**Example:**

```ts
isSameDay(new Date(2026, 2, 15), new Date(2026, 2, 15)); // true
isSameDay(new Date(2026, 2, 15), new Date(2026, 2, 16)); // false
```

---

## isDateInRange

```ts
function isDateInRange(date: Date, min?: Date, max?: Date): boolean
```

Returns `true` if the date falls within the `min`/`max` range (inclusive). If `min` or `max` is `undefined`, that side of the range is unbounded.

**Example:**

```ts
const jan1 = new Date(2026, 0, 1);
const dec31 = new Date(2026, 11, 31);

isDateInRange(new Date(2026, 5, 15), jan1, dec31); // true
isDateInRange(new Date(2025, 11, 31), jan1, dec31); // false
```

---

## isDateDisabled

```ts
function isDateDisabled(date: Date, disabledDates: Date[]): boolean
```

Returns `true` if the date matches any date in the `disabledDates` array (compared by calendar day).

**Example:**

```ts
const holidays = [new Date(2026, 11, 25), new Date(2026, 0, 1)];

isDateDisabled(new Date(2026, 11, 25), holidays); // true
isDateDisabled(new Date(2026, 11, 24), holidays); // false
```

---

## isDateRange

```ts
function isDateRange(value: unknown): value is { start: Date; end: Date }
```

Type guard that returns `true` if the value is a `DateRange` object (an object with `start` and `end` properties that are both `Date` instances).

**Example:**

```ts
isDateRange({ start: new Date(), end: new Date() }); // true
isDateRange(new Date());                              // false
isDateRange(null);                                    // false
```

---

## isDateBetween

```ts
function isDateBetween(date: Date, start: Date, end: Date): boolean
```

Returns `true` if the date falls strictly between `start` and `end` (exclusive on both ends). The order of `start` and `end` does not matter — they are automatically sorted.

**Example:**

```ts
const start = new Date(2026, 2, 10);
const end = new Date(2026, 2, 20);

isDateBetween(new Date(2026, 2, 15), start, end); // true
isDateBetween(new Date(2026, 2, 10), start, end); // false (exclusive)
isDateBetween(new Date(2026, 2, 20), start, end); // false (exclusive)
```

---

## formatMonthYear

```ts
function formatMonthYear(date: Date, locale?: string): string
```

Formats a date as `"Month Year"` using `Intl.DateTimeFormat`.

**Example:**

```ts
formatMonthYear(new Date(2026, 2, 1));          // "March 2026"
formatMonthYear(new Date(2026, 2, 1), 'fr-FR'); // "mars 2026"
formatMonthYear(new Date(2026, 2, 1), 'ja-JP'); // "2026年3月"
```

---

## formatDayLabel

```ts
function formatDayLabel(
  date: Date,
  locale: string | undefined,
  flags: {
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    isRangeStart?: boolean;
    isRangeEnd?: boolean;
    isInRange?: boolean;
  },
  markerLabel?: string,
): string
```

Builds a full accessible label for a day cell. Formats the date as a long weekday + month + day + year string, then appends status annotations in parentheses.

**Example:**

```ts
formatDayLabel(
  new Date(2026, 2, 15),
  'en-US',
  { isToday: true, isSelected: true, isDisabled: false },
);
// "Sunday, March 15, 2026 (today, selected)"

formatDayLabel(
  new Date(2026, 2, 10),
  'en-US',
  { isToday: false, isSelected: false, isDisabled: false, isRangeStart: true },
);
// "Tuesday, March 10, 2026 (selected, start of range)"

formatDayLabel(
  new Date(2026, 2, 12),
  'en-US',
  { isToday: false, isSelected: false, isDisabled: true },
);
// "Thursday, March 12, 2026 (unavailable)"
```
