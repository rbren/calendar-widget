import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { MonthPickerProps } from '../types/calendar';
import styles from './MonthPicker.module.css';

const MONTHS_PER_ROW = 4;
const TOTAL_MONTHS = 12;

function getMonthNames(locale?: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });
  return Array.from({ length: 12 }, (_, i) =>
    formatter.format(new Date(2026, i, 1)),
  );
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
  year,
  currentMonth,
  currentYear,
  locale,
  onSelectMonth,
  onCancel,
}) => {
  const gridRef = useRef<HTMLTableElement>(null);
  const [focusedMonth, setFocusedMonth] = useState(currentMonth);
  const monthNames = getMonthNames(locale);
  const today = new Date();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  useEffect(() => {
    if (!gridRef.current) return;
    const cell = gridRef.current.querySelector<HTMLElement>('td[tabindex="0"]');
    cell?.focus();
  }, [focusedMonth]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next = focusedMonth;
      switch (e.key) {
        case 'ArrowRight':
          next = Math.min(focusedMonth + 1, TOTAL_MONTHS - 1);
          break;
        case 'ArrowLeft':
          next = Math.max(focusedMonth - 1, 0);
          break;
        case 'ArrowDown':
          next = Math.min(focusedMonth + MONTHS_PER_ROW, TOTAL_MONTHS - 1);
          break;
        case 'ArrowUp':
          next = Math.max(focusedMonth - MONTHS_PER_ROW, 0);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelectMonth(focusedMonth);
          return;
        case 'Escape':
          e.preventDefault();
          onCancel();
          return;
        default:
          return;
      }
      e.preventDefault();
      setFocusedMonth(next);
    },
    [focusedMonth, onSelectMonth, onCancel],
  );

  const rows: number[][] = [];
  for (let i = 0; i < TOTAL_MONTHS; i += MONTHS_PER_ROW) {
    rows.push(Array.from({ length: MONTHS_PER_ROW }, (_, j) => i + j));
  }

  return (
    <table
      className={styles.grid}
      role="grid"
      aria-label={`Month picker, ${year}`}
      ref={gridRef}
      onKeyDown={handleKeyDown}
    >
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr key={rowIdx} role="row">
            {row.map((monthIdx) => {
              const isCurrentView =
                monthIdx === currentMonth && year === currentYear;
              const isToday = monthIdx === todayMonth && year === todayYear;
              const isFocused = monthIdx === focusedMonth;

              const classNames = [
                styles.cell,
                isCurrentView && styles.selected,
                isToday && styles.today,
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <td
                  key={monthIdx}
                  role="gridcell"
                  className={classNames}
                  tabIndex={isFocused ? 0 : -1}
                  aria-selected={isCurrentView}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => onSelectMonth(monthIdx)}
                >
                  {monthNames[monthIdx]}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
