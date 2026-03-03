import React, { useMemo } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { MonthPicker } from './MonthPicker';
import { YearPicker } from './YearPicker';
import { useCalendarState } from '../hooks/useCalendarState';
import type { CalendarWidgetProps } from '../types/calendar';
import styles from './CalendarWidget.module.css';

export const CalendarWidget: React.FC<CalendarWidgetProps> = (props) => {
  const {
    mode = 'single',
    locale,
    minDate,
    maxDate,
    disabledDates,
    weekStartsOn = 0,
    quickNavigation = true,
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
    hoverDate,
    rangeStart,
    hoveredDate,
    activeView,
    yearRangeStart,
    drillUp,
    drillDown,
    selectMonth,
    selectYear,
    goToPrevYear,
    goToNextYear,
    goToPrevYearRange,
    goToNextYearRange,
    headingAriaLabel,
  } = useCalendarState(props);

  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  // Determine header label and nav handlers based on current view
  const headerLabel = useMemo(() => {
    if (activeView === 'months') {
      return String(viewDate.getFullYear());
    }
    if (activeView === 'years') {
      return `${yearRangeStart}\u2013${yearRangeStart + 11}`;
    }
    return monthYearLabel;
  }, [activeView, viewDate, yearRangeStart, monthYearLabel]);

  const handlePrev = activeView === 'years'
    ? goToPrevYearRange
    : activeView === 'months'
      ? goToPrevYear
      : goToPrevMonth;

  const handleNext = activeView === 'years'
    ? goToNextYearRange
    : activeView === 'months'
      ? goToNextYear
      : goToNextMonth;

  // Only allow drill-up from days and months views
  const canDrillUp = quickNavigation && activeView !== 'years';

  return (
    <div className={rootClassName}>
      <CalendarHeader
        viewDate={viewDate}
        monthYearLabel={headerLabel}
        onPrevMonth={handlePrev}
        onNextMonth={handleNext}
        quickNavigation={canDrillUp}
        onDrillUp={canDrillUp ? drillUp : undefined}
        headingAriaLabel={headingAriaLabel}
      />
      {activeView === 'days' && (
        <CalendarGrid
          weeks={weeks}
          viewDate={viewDate}
          value={value}
          mode={mode}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
          locale={locale}
          weekStartsOn={weekStartsOn}
          focusedDate={focusedDate}
          rangeStart={rangeStart}
          hoveredDate={hoveredDate}
          onSelectDate={selectDate}
          onFocusDate={focusDate}
          onHoverDate={hoverDate}
        />
      )}
      {activeView === 'months' && (
        <MonthPicker
          year={viewDate.getFullYear()}
          currentMonth={viewDate.getMonth()}
          currentYear={viewDate.getFullYear()}
          locale={locale}
          onSelectMonth={selectMonth}
          onCancel={drillDown}
        />
      )}
      {activeView === 'years' && (
        <YearPicker
          rangeStart={yearRangeStart}
          currentYear={viewDate.getFullYear()}
          onSelectYear={selectYear}
          onCancel={drillDown}
        />
      )}
    </div>
  );
};
