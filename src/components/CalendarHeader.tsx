import React from 'react';
import type { CalendarHeaderProps } from '../types/calendar';
import styles from './CalendarHeader.module.css';

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  monthYearLabel,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <div className={styles.header}>
      <button
        type="button"
        className={styles.navBtn}
        aria-label="Previous month"
        onClick={onPrevMonth}
      >
        ‹
      </button>
      <span className={styles.label} aria-live="polite">
        {monthYearLabel}
      </span>
      <button
        type="button"
        className={styles.navBtn}
        aria-label="Next month"
        onClick={onNextMonth}
      >
        ›
      </button>
    </div>
  );
};
