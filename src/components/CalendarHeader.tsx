import React from 'react';
import type { CalendarHeaderProps } from '../types/calendar';
import styles from './CalendarHeader.module.css';

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  monthYearLabel,
  onPrevMonth,
  onNextMonth,
  activeView = 'days',
  quickNavigation,
  onDrillUp,
  headingAriaLabel,
  showTodayButton = true,
  todayButtonLabel = 'Today',
  isCurrentMonth = false,
  onGoToToday,
}) => {
  const prevLabel =
    activeView === 'years'
      ? 'Previous year range'
      : activeView === 'months'
        ? 'Previous year'
        : 'Previous month';

  const nextLabel =
    activeView === 'years'
      ? 'Next year range'
      : activeView === 'months'
        ? 'Next year'
        : 'Next month';

  return (
    <div className={styles.header}>
      <div className={styles.navRow}>
        <button
          type="button"
          className={styles.navBtn}
          aria-label={prevLabel}
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
          aria-label={nextLabel}
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
