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
  showTodayButton = true,
  todayButtonLabel = 'Today',
  isCurrentMonth = false,
  onGoToToday,
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.navRow}>
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
      {showTodayButton && onGoToToday && (
        <div className={styles.todayRow}>
          <button
            type="button"
            className={styles.todayBtn}
            aria-label="Navigate to current month"
            aria-disabled={isCurrentMonth || undefined}
            onClick={isCurrentMonth ? undefined : onGoToToday}
          >
            {todayButtonLabel}
          </button>
        </div>
      )}
    </div>
  );
};
