import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { YearPickerProps } from '../types/calendar';
import styles from './YearPicker.module.css';

const YEARS_PER_ROW = 4;
const TOTAL_YEARS = 12;

export const YearPicker: React.FC<YearPickerProps> = ({
  rangeStart,
  currentYear,
  onSelectYear,
  onCancel,
}) => {
  const gridRef = useRef<HTMLTableElement>(null);
  const years = Array.from({ length: TOTAL_YEARS }, (_, i) => rangeStart + i);
  const initialFocusIdx = years.indexOf(currentYear);
  const [focusedIdx, setFocusedIdx] = useState(
    initialFocusIdx >= 0 ? initialFocusIdx : 0,
  );
  const today = new Date();
  const todayYear = today.getFullYear();

  useEffect(() => {
    if (!gridRef.current) return;
    const cell = gridRef.current.querySelector<HTMLElement>('td[tabindex="0"]');
    cell?.focus();
  }, [focusedIdx]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next = focusedIdx;
      switch (e.key) {
        case 'ArrowRight':
          next = Math.min(focusedIdx + 1, TOTAL_YEARS - 1);
          break;
        case 'ArrowLeft':
          next = Math.max(focusedIdx - 1, 0);
          break;
        case 'ArrowDown':
          next = Math.min(focusedIdx + YEARS_PER_ROW, TOTAL_YEARS - 1);
          break;
        case 'ArrowUp':
          next = Math.max(focusedIdx - YEARS_PER_ROW, 0);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelectYear(years[focusedIdx]);
          return;
        case 'Escape':
          e.preventDefault();
          onCancel();
          return;
        default:
          return;
      }
      e.preventDefault();
      setFocusedIdx(next);
    },
    [focusedIdx, years, onSelectYear, onCancel],
  );

  const rangeLabel = `${years[0]}\u2013${years[years.length - 1]}`;

  const rows: number[][] = [];
  for (let i = 0; i < TOTAL_YEARS; i += YEARS_PER_ROW) {
    rows.push(years.slice(i, i + YEARS_PER_ROW));
  }

  return (
    <table
      className={styles.grid}
      role="grid"
      aria-label={`Year picker, ${rangeLabel}`}
      ref={gridRef}
      onKeyDown={handleKeyDown}
    >
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr key={rowIdx} role="row">
            {row.map((year) => {
              const isCurrentView = year === currentYear;
              const isToday = year === todayYear;
              const isFocused = years.indexOf(year) === focusedIdx;

              const classNames = [
                styles.cell,
                isCurrentView && styles.selected,
                isToday && styles.today,
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <td
                  key={year}
                  role="gridcell"
                  className={classNames}
                  tabIndex={isFocused ? 0 : -1}
                  aria-selected={isCurrentView}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => onSelectYear(year)}
                >
                  {year}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
