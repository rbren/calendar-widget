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
    showWeekNumbers = false,
    quickNavigation = true,
    showTodayButton = true,
    todayButtonLabel = 'Today',
    renderDay,
    numberOfMonths: rawNumberOfMonths = 1,
    className,
    value,
  } = props;

  const numberOfMonths = Math.max(1, Math.floor(rawNumberOfMonths));

  const {
    viewDate,
    focusedDate,
    weeks,
    monthYearLabel,
    months,
    goToPrevMonth,
    goToNextMonth,
    selectDate,
    focusDate,
    hoverDate,
    isSelected,
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
    goToToday,
    isCurrentMonth,
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

  const handlePrev =
    activeView === 'years'
      ? goToPrevYearRange
      : activeView === 'months'
        ? goToPrevYear
        : goToPrevMonth;

  const handleNext =
    activeView === 'years'
      ? goToNextYearRange
      : activeView === 'months'
        ? goToNextYear
        : goToNextMonth;

  // Only allow drill-up from days and months views
  const canDrillUp = quickNavigation && activeView !== 'years';

  const isSingleMonth = numberOfMonths === 1;

  return (
    <div className={rootClassName}>
      {isSingleMonth ? (
        <>
          <CalendarHeader
            viewDate={viewDate}
            monthYearLabel={headerLabel}
            onPrevMonth={handlePrev}
            onNextMonth={handleNext}
            activeView={activeView}
            quickNavigation={canDrillUp}
            onDrillUp={canDrillUp ? drillUp : undefined}
            headingAriaLabel={headingAriaLabel}
            showTodayButton={showTodayButton}
            todayButtonLabel={todayButtonLabel}
            isCurrentMonth={isCurrentMonth}
            onGoToToday={goToToday}
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
              showWeekNumbers={showWeekNumbers}
              focusedDate={focusedDate}
              rangeStart={rangeStart}
              hoveredDate={hoveredDate}
              isSelected={isSelected}
              onSelectDate={selectDate}
              onFocusDate={focusDate}
              onHoverDate={hoverDate}
              renderDay={renderDay}
            />
          )}
        </>
      ) : (
        <>
          {activeView === 'days' && (
            <>
              {showTodayButton && (
                <div className={styles.todayRow}>
                  <button
                    type="button"
                    className={styles.todayBtn}
                    aria-label="Navigate to current month"
                    aria-disabled={isCurrentMonth || undefined}
                    onClick={isCurrentMonth ? undefined : goToToday}
                  >
                    {todayButtonLabel}
                  </button>
                </div>
              )}
              <div className={styles.monthsContainer}>
                {months.map((monthData, i) => {
                  const isFirst = i === 0;
                  const isLast = i === numberOfMonths - 1;
                  return (
                    <div key={i} className={styles.monthPanel}>
                      <div className={styles.monthPanelHeader}>
                        {isFirst ? (
                          <button
                            type="button"
                            className={styles.monthNavBtn}
                            aria-label="Previous month"
                            onClick={goToPrevMonth}
                          >
                            ‹
                          </button>
                        ) : (
                          <span className={styles.monthNavSpacer} />
                        )}
                        {isFirst && canDrillUp ? (
                          <button
                            type="button"
                            className={styles.monthLabelBtn}
                            aria-label={headingAriaLabel}
                            aria-live="polite"
                            onClick={drillUp}
                          >
                            {monthData.monthYearLabel}
                          </button>
                        ) : (
                          <span
                            className={styles.monthLabel}
                            aria-live={isFirst ? 'polite' : undefined}
                          >
                            {monthData.monthYearLabel}
                          </span>
                        )}
                        {isLast ? (
                          <button
                            type="button"
                            className={styles.monthNavBtn}
                            aria-label="Next month"
                            onClick={goToNextMonth}
                          >
                            ›
                          </button>
                        ) : (
                          <span className={styles.monthNavSpacer} />
                        )}
                      </div>
                      <CalendarGrid
                        weeks={monthData.weeks}
                        viewDate={monthData.viewDate}
                        value={value}
                        mode={mode}
                        minDate={minDate}
                        maxDate={maxDate}
                        disabledDates={disabledDates}
                        locale={locale}
                        weekStartsOn={weekStartsOn}
                        showWeekNumbers={showWeekNumbers}
                        focusedDate={focusedDate}
                        rangeStart={rangeStart}
                        hoveredDate={hoveredDate}
                        isSelected={isSelected}
                        onSelectDate={selectDate}
                        onFocusDate={focusDate}
                        onHoverDate={hoverDate}
                        renderDay={renderDay}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
      {!isSingleMonth && activeView === 'months' && (
        <CalendarHeader
          viewDate={viewDate}
          monthYearLabel={String(viewDate.getFullYear())}
          onPrevMonth={goToPrevYear}
          onNextMonth={goToNextYear}
          activeView={activeView}
          quickNavigation={canDrillUp}
          onDrillUp={canDrillUp ? drillUp : undefined}
          headingAriaLabel={headingAriaLabel}
          showTodayButton={false}
        />
      )}
      {!isSingleMonth && activeView === 'years' && (
        <CalendarHeader
          viewDate={viewDate}
          monthYearLabel={`${yearRangeStart}\u2013${yearRangeStart + 11}`}
          onPrevMonth={goToPrevYearRange}
          onNextMonth={goToNextYearRange}
          activeView={activeView}
          quickNavigation={false}
          showTodayButton={false}
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
