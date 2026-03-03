import React from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { useCalendarState } from '../hooks/useCalendarState';
import type { CalendarWidgetProps } from '../types/calendar';

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
    weeks,
    monthYearLabel,
    goToPrevMonth,
    goToNextMonth,
    selectDate,
  } = useCalendarState(props);

  const rootClassName = ['cw-root', className].filter(Boolean).join(' ');

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
        onSelectDate={selectDate}
      />
    </div>
  );
};
