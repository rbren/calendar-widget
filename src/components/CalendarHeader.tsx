import React from 'react';
import type { CalendarHeaderProps } from '../types/calendar';

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  monthYearLabel,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <div className="cw-header">
      <button
        type="button"
        className="cw-header__nav-btn"
        aria-label="Previous month"
        onClick={onPrevMonth}
      >
        ‹
      </button>
      <span className="cw-header__label">{monthYearLabel}</span>
      <button
        type="button"
        className="cw-header__nav-btn"
        aria-label="Next month"
        onClick={onNextMonth}
      >
        ›
      </button>
    </div>
  );
};
