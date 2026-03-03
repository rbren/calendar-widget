import React from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { useCalendarState } from '../hooks/useCalendarState';
import type { CalendarWidgetProps } from '../types/calendar';
import styles from './CalendarWidget.module.css';

export const CalendarWidget: React.FC<CalendarWidgetProps> = (props) => {
  const {
    locale,
    minDate,
    maxDate,
    disabledDates,
    weekStartsOn = 0,
    className,
    value,
  } = props;

  const {
    viewDate,
    focusedDate,
    weeks,
    monthYearLabel,
    goToPrevMonth,
    goToNextMonth,
    selectDate,
    focusDate,
  } = useCalendarState(props);

  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div className={rootClassName}>
      <CalendarHeader
        viewDate={viewDate}
        monthYearLabel={monthYearLabel}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
      />
      <CalendarGrid
        weeks={weeks}
        viewDate={viewDate}
        value={value}
        minDate={minDate}
        maxDate={maxDate}
        disabledDates={disabledDates}
        locale={locale}
        weekStartsOn={weekStartsOn}
        focusedDate={focusedDate}
        onSelectDate={selectDate}
        onFocusDate={focusDate}
      />
    </div>
  );
};
