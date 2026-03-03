import React from 'react';
import { CalendarDayCell } from './CalendarDayCell';
import { isSameDay, isDateInRange, isDateDisabled } from '../utils/dates';
import type { CalendarGridProps } from '../types/calendar';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekdayHeaders(weekStartsOn: number, locale?: string): string[] {
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

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  weeks,
  viewDate,
  value,
  minDate,
  maxDate,
  disabledDates = [],
  locale,
  weekStartsOn,
  onSelectDate,
}) => {
  const today = new Date();
  const headers = getWeekdayHeaders(weekStartsOn, locale);

  const isSelected = (date: Date): boolean => {
    if (!value) return false;
    if (value instanceof Date) return isSameDay(date, value);
    if (Array.isArray(value)) return value.some((v) => isSameDay(date, v));
    return false;
  };

  return (
    <table className="cw-grid" role="grid" aria-label="Calendar">
      <thead>
        <tr>
          {headers.map((day) => (
            <th key={day} className="cw-grid__weekday" scope="col">
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, rowIdx) => (
          <tr key={rowIdx}>
            {week.map((date, colIdx) => (
              <CalendarDayCell
                key={colIdx}
                date={date}
                isCurrentMonth={date.getMonth() === viewDate.getMonth()}
                isToday={isSameDay(date, today)}
                isSelected={isSelected(date)}
                isDisabled={
                  !isDateInRange(date, minDate, maxDate) ||
                  isDateDisabled(date, disabledDates)
                }
                onSelect={onSelectDate}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
