import React, { useRef, useEffect, useCallback } from 'react';
import { CalendarDayCell } from './CalendarDayCell';
import {
  isSameDay,
  isDateInRange,
  isDateDisabled,
  isDateRange,
  isDateBetween,
  getISOWeekNumber,
} from '../utils/dates';
import type { CalendarGridProps } from '../types/calendar';
import styles from './CalendarGrid.module.css';

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

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getFirstDayOfWeek(date: Date, weekStartsOn: number): Date {
  const day = date.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  return addDays(date, -diff);
}

function getLastDayOfWeek(date: Date, weekStartsOn: number): Date {
  return addDays(getFirstDayOfWeek(date, weekStartsOn), 6);
}

function sameMonth(date: Date, month: number, year: number): boolean {
  return date.getMonth() === month && date.getFullYear() === year;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  weeks,
  viewDate,
  value,
  mode = 'single',
  minDate,
  maxDate,
  disabledDates = [],
  locale,
  weekStartsOn,
  showWeekNumbers = false,
  focusedDate,
  rangeStart,
  hoveredDate,
  onSelectDate,
  onFocusDate,
  onHoverDate,
  renderDay,
}) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const today = new Date();
  const headers = getWeekdayHeaders(weekStartsOn, locale);

  const isSelected = (date: Date): boolean => {
    if (mode === 'range' && rangeStart && !isDateRange(value)) {
      return isSameDay(date, rangeStart);
    }
    if (!value) return false;
    if (value instanceof Date) return isSameDay(date, value);
    if (isDateRange(value)) {
      return isSameDay(date, value.start) || isSameDay(date, value.end);
    }
    if (Array.isArray(value)) return value.some((v) => isSameDay(date, v));
    return false;
  };

  const getRangeFlags = (date: Date) => {
    let isRangeStart = false;
    let isRangeEnd = false;
    let isInRange = false;
    let isInPreview = false;
    let isPreviewStart = false;
    let isPreviewEnd = false;

    if (mode !== 'range') {
      return {
        isRangeStart,
        isRangeEnd,
        isInRange,
        isInPreview,
        isPreviewStart,
        isPreviewEnd,
      };
    }

    // Completed range from value
    if (isDateRange(value)) {
      isRangeStart = isSameDay(date, value.start);
      isRangeEnd = isSameDay(date, value.end);
      if (!isRangeStart && !isRangeEnd) {
        isInRange = isDateBetween(date, value.start, value.end);
      }
    }

    // Preview range (first click done, hovering)
    if (rangeStart && hoveredDate && !isSameDay(rangeStart, hoveredDate)) {
      const lo = rangeStart <= hoveredDate ? rangeStart : hoveredDate;
      const hi = rangeStart <= hoveredDate ? hoveredDate : rangeStart;
      isPreviewStart = isSameDay(date, lo);
      isPreviewEnd = isSameDay(date, hi);
      if (!isPreviewStart && !isPreviewEnd) {
        isInPreview = isDateBetween(date, lo, hi);
      }
    }

    return {
      isRangeStart,
      isRangeEnd,
      isInRange,
      isInPreview,
      isPreviewStart,
      isPreviewEnd,
    };
  };

  // Move DOM focus to the focused date cell after render
  useEffect(() => {
    if (!tableRef.current) return;
    const cell =
      tableRef.current.querySelector<HTMLElement>('td[tabindex="0"]');
    if (cell && tableRef.current.contains(document.activeElement)) {
      cell.focus();
    }
  }, [focusedDate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next: Date | null = null;
      switch (e.key) {
        case 'ArrowRight':
          next = addDays(focusedDate, 1);
          break;
        case 'ArrowLeft':
          next = addDays(focusedDate, -1);
          break;
        case 'ArrowDown':
          next = addDays(focusedDate, 7);
          break;
        case 'ArrowUp':
          next = addDays(focusedDate, -7);
          break;
        case 'Home':
          next = getFirstDayOfWeek(focusedDate, weekStartsOn);
          break;
        case 'End':
          next = getLastDayOfWeek(focusedDate, weekStartsOn);
          break;
        case 'PageDown':
          next = new Date(
            focusedDate.getFullYear(),
            focusedDate.getMonth() + 1,
            focusedDate.getDate(),
          );
          break;
        case 'PageUp':
          next = new Date(
            focusedDate.getFullYear(),
            focusedDate.getMonth() - 1,
            focusedDate.getDate(),
          );
          break;
        default:
          return;
      }
      e.preventDefault();
      onFocusDate(next);
    },
    [focusedDate, weekStartsOn, onFocusDate],
  );

  const handleMouseLeave = useCallback(() => {
    onHoverDate?.(null);
  }, [onHoverDate]);

  return (
    <table
      className={styles.grid}
      role="grid"
      aria-label="Calendar"
      ref={tableRef}
      onKeyDown={handleKeyDown}
      onMouseLeave={handleMouseLeave}
    >
      <thead>
        <tr role="row">
          {showWeekNumbers && (
            <th
              className={`${styles.weekday} ${styles.weekNumberHeader}`}
              role="columnheader"
              scope="col"
            >
              #
            </th>
          )}
          {headers.map((day) => (
            <th
              key={day}
              className={styles.weekday}
              role="columnheader"
              scope="col"
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, rowIdx) => {
          const weekNumber = getISOWeekNumber(week[0]);
          return (
            <tr key={rowIdx} role="row">
              {showWeekNumbers && (
                <td
                  className={styles.weekNumber}
                  role="rowheader"
                  aria-label={`Week ${weekNumber}`}
                  tabIndex={-1}
                >
                  {weekNumber}
                </td>
              )}
              {week.map((date, colIdx) => {
                const rangeFlags = getRangeFlags(date);
                return (
                  <CalendarDayCell
                    key={colIdx}
                    date={date}
                    isCurrentMonth={sameMonth(
                      date,
                      viewDate.getMonth(),
                      viewDate.getFullYear(),
                    )}
                    isToday={isSameDay(date, today)}
                    isSelected={isSelected(date)}
                    isDisabled={
                      !isDateInRange(date, minDate, maxDate) ||
                      isDateDisabled(date, disabledDates)
                    }
                    isFocusTarget={isSameDay(date, focusedDate)}
                    isRangeStart={rangeFlags.isRangeStart}
                    isRangeEnd={rangeFlags.isRangeEnd}
                    isInRange={rangeFlags.isInRange}
                    isInPreview={rangeFlags.isInPreview}
                    isPreviewStart={rangeFlags.isPreviewStart}
                    isPreviewEnd={rangeFlags.isPreviewEnd}
                    onSelect={onSelectDate}
                    onHover={onHoverDate}
                    locale={locale}
                    renderDay={renderDay}
                  />
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
