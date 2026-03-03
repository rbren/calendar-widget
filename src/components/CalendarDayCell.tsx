import React from 'react';
import type { CalendarDayCellProps } from '../types/calendar';

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  isDisabled,
  onSelect,
}) => {
  const handleClick = () => {
    if (!isDisabled) {
      onSelect(date);
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
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      onClick={handleClick}
    >
      <span>{date.getDate()}</span>
    </td>
  );
};
