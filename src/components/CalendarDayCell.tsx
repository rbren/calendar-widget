import React from 'react';
import type { CalendarDayCellProps } from '../types/calendar';

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  isDisabled,
  isFocusTarget,
  onSelect,
}) => {
  const handleClick = () => {
    if (!isDisabled) {
      onSelect(date);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isDisabled) {
        onSelect(date);
      }
    }
  };

  const classNames = [
    'cw-day-cell',
    !isCurrentMonth && 'cw-day-cell--outside',
    isToday && 'cw-day-cell--today',
    isSelected && 'cw-day-cell--selected',
    isDisabled && 'cw-day-cell--disabled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <td
      role="gridcell"
      className={classNames}
      tabIndex={isFocusTarget ? 0 : -1}
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      aria-current={isToday ? 'date' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span>{date.getDate()}</span>
    </td>
  );
};
