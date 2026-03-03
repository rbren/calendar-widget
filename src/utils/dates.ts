/**
 * Returns a 2D array of Date objects representing a calendar month view.
 * Always returns 6 rows × 7 cols, including leading/trailing days from adjacent months.
 */
export function getCalendarDays(
  year: number,
  month: number,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0,
): Date[][] {
  const firstDayOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstDayOfMonth.getDay();

  // How many days from the previous month we need to show
  const offset = (dayOfWeek - weekStartsOn + 7) % 7;
  const startDate = new Date(year, month, 1 - offset);

  const weeks: Date[][] = [];
  for (let row = 0; row < 6; row++) {
    const week: Date[] = [];
    for (let col = 0; col < 7; col++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + row * 7 + col);
      week.push(day);
    }
    weeks.push(week);
  }

  return weeks;
}

/** Returns true if two dates represent the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Returns true if the date falls within the optional min/max range (inclusive). */
export function isDateInRange(date: Date, min?: Date, max?: Date): boolean {
  if (min) {
    const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    if (date < minDay) return false;
  }
  if (max) {
    const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
    maxDay.setHours(23, 59, 59, 999);
    if (date > maxDay) return false;
  }
  return true;
}

/** Returns true if the date matches any of the disabled dates. */
export function isDateDisabled(date: Date, disabledDates: Date[]): boolean {
  return disabledDates.some((d) => isSameDay(date, d));
}

/** Formats a date as "Month Year" using Intl.DateTimeFormat. */
export function formatMonthYear(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Type guard for DateRange objects. */
export function isDateRange(
  value: unknown,
): value is { start: Date; end: Date } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'start' in value &&
    'end' in value &&
    (value as { start: unknown }).start instanceof Date &&
    (value as { end: unknown }).end instanceof Date
  );
}

/** Returns true if the date falls strictly between start and end (exclusive). */
export function isDateBetween(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const lo = s <= e ? s : e;
  const hi = s <= e ? e : s;
  return d > lo && d < hi;
}

/** Returns the ISO 8601 week number for a given date (1–53). */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1, Sun=7)
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Returns localized short weekday names starting from the given weekStartsOn day. */
export function getWeekdayHeaders(
  weekStartsOn: number,
  locale?: string,
): string[] {
  if (locale) {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    // Jan 4 2026 is a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2026, 0, 4 + ((weekStartsOn + i) % 7));
      return formatter.format(d);
    });
  }
  return Array.from(
    { length: 7 },
    (_, i) => DAY_NAMES_SHORT[(weekStartsOn + i) % 7],
  );
}

/** Adds N days to a Date, returning a new Date. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Returns the first day of the week containing the given date. */
export function getFirstDayOfWeek(date: Date, weekStartsOn: number): Date {
  const day = date.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  return addDays(date, -diff);
}

/** Returns the last day of the week containing the given date. */
export function getLastDayOfWeek(date: Date, weekStartsOn: number): Date {
  return addDays(getFirstDayOfWeek(date, weekStartsOn), 6);
}

/** Returns true if the date is in the given month and year. */
export function sameMonth(date: Date, month: number, year: number): boolean {
  return date.getMonth() === month && date.getFullYear() === year;
}

/** Builds a full accessible label for a day cell (e.g. "Saturday, March 15, 2026 (today, selected)"). */
export function formatDayLabel(
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
): string {
  const formatted = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

  const statuses: string[] = [];
  if (flags.isToday) statuses.push('today');
  if (flags.isRangeStart) statuses.push('selected, start of range');
  else if (flags.isRangeEnd) statuses.push('selected, end of range');
  else if (flags.isInRange) statuses.push('in selected range');
  else if (flags.isSelected) statuses.push('selected');
  if (flags.isDisabled) statuses.push('unavailable');

  let label = formatted;
  if (markerLabel) label += `, ${markerLabel}`;
  if (statuses.length > 0) label += ` (${statuses.join(', ')})`;
  return label;
}
