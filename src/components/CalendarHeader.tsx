import React from 'react';
import type { CalendarHeaderProps } from '../types/calendar';
import styles from './CalendarHeader.module.css';

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  monthYearLabel,
  onPrevMonth,
  onNextMonth,
  quickNavigation,
  onDrillUp,
  headingAriaLabel,
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
      {quickNavigation && onDrillUp ? (
        <button
          type="button"
          className={styles.labelBtn}
          aria-label={headingAriaLabel}
          aria-live="polite"
          onClick={onDrillUp}
        >
          {monthYearLabel}
        </button>
      ) : (
        <span className={styles.label} aria-live="polite">
          {monthYearLabel}
        </span>
      )}
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
