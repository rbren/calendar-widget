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
export function isDateInRange(
  date: Date,
  min?: Date,
  max?: Date,
): boolean {
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
export function isDateDisabled(
  date: Date,
  disabledDates: Date[],
): boolean {
  return disabledDates.some((d) => isSameDay(date, d));
}

/** Formats a date as "Month Year" using Intl.DateTimeFormat. */
export function formatMonthYear(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(date);
}
