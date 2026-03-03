import React from 'react';
import type { CalendarDayCellProps } from '../types/calendar';
import { formatDayLabel } from '../utils/dates';
import styles from './CalendarDayCell.module.css';

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  isDisabled,
  isFocusTarget,
  isRangeStart,
  isRangeEnd,
  isInRange,
  isInPreview,
  isPreviewStart,
  isPreviewEnd,
  onSelect,
  onHover,
  locale,
  markerLabel,
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

  const handleMouseEnter = () => {
    onHover?.(date);
  };

  const classNames = [
    styles.cell,
    !isCurrentMonth && styles.outside,
    isToday && styles.today,
    isSelected && styles.selected,
    isDisabled && styles.disabled,
    isRangeStart && styles.rangeStart,
    isRangeEnd && styles.rangeEnd,
    isInRange && styles.inRange,
    isInPreview && styles.inPreview,
    isPreviewStart && styles.previewStart,
    isPreviewEnd && styles.previewEnd,
  ]
    .filter(Boolean)
    .join(' ');

  const ariaLabel = formatDayLabel(
    date,
    locale,
    { isToday, isSelected, isDisabled, isRangeStart, isRangeEnd, isInRange },
    markerLabel,
  );

  return (
    <td
      role="gridcell"
      className={classNames}
      tabIndex={isFocusTarget ? 0 : -1}
      aria-selected={isSelected || isRangeStart || isRangeEnd || false}
      aria-disabled={isDisabled}
      aria-current={isToday ? 'date' : undefined}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
    >
      <span>{date.getDate()}</span>
    </td>
  );
};
