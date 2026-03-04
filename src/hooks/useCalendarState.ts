import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  getCalendarDays,
  isSameDay,
  isDateInRange,
  isDateDisabled,
  isDateRange,
  formatMonthYear,
  addMonths,
} from '../utils/dates';
import type { CalendarWidgetProps, CalendarView } from '../types/calendar';

export interface MonthData {
  viewDate: Date;
  weeks: Date[][];
  monthYearLabel: string;
}

export function useCalendarState(props: CalendarWidgetProps) {
  const {
    mode = 'single',
    value,
    onChange,
    onMonthChange,
    onDayFocus,
    locale,
    minDate,
    maxDate,
    disabledDates = [],
    weekStartsOn = 0,
    quickNavigation = true,
    numberOfMonths: rawNumberOfMonths = 1,
  } = props;

  const numberOfMonths = Math.max(1, Math.floor(rawNumberOfMonths));

  const getInitialDate = (): Date => {
    if (value instanceof Date) return value;
    if (isDateRange(value)) return value.start;
    return new Date();
  };

  const initialDate = getInitialDate();
  const [viewDate, setViewDate] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );

  const [focusedDate, setFocusedDate] = useState(initialDate);

  // Drill-up view state: days → months → years
  const [activeView, setActiveView] = useState<CalendarView>('days');

  // Year range start for year picker (shows 12 years starting from this)
  const [yearRangeStart, setYearRangeStart] = useState(
    () => viewDate.getFullYear() - (viewDate.getFullYear() % 12),
  );

  // Range selection: pending start date (after first click, before second)
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  // Hovered date for range preview
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Sync viewDate and focusedDate when the value prop changes externally.
  const [prevValue, setPrevValue] = useState(value);
  const valueDate = value instanceof Date ? value : null;
  const prevValueDate = prevValue instanceof Date ? prevValue : null;
  const valueRange = isDateRange(value) ? value : null;
  const prevValueRange = isDateRange(prevValue) ? prevValue : null;

  const singleChanged =
    valueDate !== null &&
    prevValueDate !== null &&
    !isSameDay(valueDate, prevValueDate);
  const rangeChanged =
    valueRange !== null &&
    prevValueRange !== null &&
    (!isSameDay(valueRange.start, prevValueRange.start) ||
      !isSameDay(valueRange.end, prevValueRange.end));
  const typeChanged =
    (valueDate !== null) !== (prevValueDate !== null) ||
    (valueRange !== null) !== (prevValueRange !== null);
  const nullChanged = (value == null) !== (prevValue == null);

  const valueChanged =
    value !== prevValue &&
    (singleChanged || rangeChanged || typeChanged || nullChanged);

  if (valueChanged) {
    setPrevValue(value);
    const syncDate =
      value instanceof Date ? value : isDateRange(value) ? value.start : null;
    if (syncDate) {
      const newMonth = syncDate.getMonth();
      const newYear = syncDate.getFullYear();
      if (
        viewDate.getMonth() !== newMonth ||
        viewDate.getFullYear() !== newYear
      ) {
        setViewDate(new Date(newYear, newMonth, 1));
      }
      if (!isSameDay(focusedDate, syncDate)) {
        setFocusedDate(syncDate);
      }
    }
  }

  // Stable ref to latest onMonthChange to avoid stale closures in callbacks.
  const onMonthChangeRef = useRef(onMonthChange);
  useEffect(() => {
    onMonthChangeRef.current = onMonthChange;
  });

  const fireMonthChange = useCallback((newViewDate: Date) => {
    onMonthChangeRef.current?.(newViewDate);
  }, []);

  const today = new Date();
  const isCurrentMonth =
    viewDate.getFullYear() === today.getFullYear() &&
    viewDate.getMonth() === today.getMonth();

  const goToToday = useCallback(() => {
    const now = new Date();
    const newView = new Date(now.getFullYear(), now.getMonth(), 1);
    setViewDate((prev) => {
      if (
        prev.getMonth() !== newView.getMonth() ||
        prev.getFullYear() !== newView.getFullYear()
      ) {
        fireMonthChange(newView);
      }
      return newView;
    });
    setFocusedDate(now);
    setActiveView('days');
  }, [fireMonthChange]);

  const goToPrevMonth = useCallback(() => {
    setViewDate((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      fireMonthChange(next);
      return next;
    });
  }, [fireMonthChange]);

  const goToNextMonth = useCallback(() => {
    setViewDate((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      fireMonthChange(next);
      return next;
    });
  }, [fireMonthChange]);

  // Stable ref to latest onDayFocus to avoid stale closures.
  const onDayFocusRef = useRef(onDayFocus);
  useEffect(() => {
    onDayFocusRef.current = onDayFocus;
  });

  const focusDate = useCallback(
    (date: Date) => {
      setFocusedDate(date);
      onDayFocusRef.current?.(date);
      const newMonth = date.getMonth();
      const newYear = date.getFullYear();
      setViewDate((prev) => {
        if (prev.getMonth() !== newMonth || prev.getFullYear() !== newYear) {
          const newView = new Date(newYear, newMonth, 1);
          fireMonthChange(newView);
          return newView;
        }
        return prev;
      });
    },
    [fireMonthChange],
  );

  const weeks = useMemo(
    () =>
      getCalendarDays(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        weekStartsOn,
      ),
    [viewDate, weekStartsOn],
  );

  const monthYearLabel = useMemo(
    () => formatMonthYear(viewDate, locale),
    [viewDate, locale],
  );

  const months: MonthData[] = useMemo(
    () =>
      Array.from({ length: numberOfMonths }, (_, i) => {
        const monthViewDate = i === 0 ? viewDate : addMonths(viewDate, i);
        return {
          viewDate: monthViewDate,
          weeks:
            i === 0
              ? weeks
              : getCalendarDays(
                  monthViewDate.getFullYear(),
                  monthViewDate.getMonth(),
                  weekStartsOn,
                ),
          monthYearLabel:
            i === 0 ? monthYearLabel : formatMonthYear(monthViewDate, locale),
        };
      }),
    [viewDate, weeks, monthYearLabel, numberOfMonths, weekStartsOn, locale],
  );

  const selectDate = useCallback(
    (date: Date) => {
      if (!isDateInRange(date, minDate, maxDate)) return;
      if (isDateDisabled(date, disabledDates)) return;

      if (mode === 'range') {
        if (rangeStart === null) {
          // First click: set range start
          setRangeStart(date);
          setHoveredDate(null);
        } else {
          // Second click: complete range
          const start = rangeStart <= date ? rangeStart : date;
          const end = rangeStart <= date ? date : rangeStart;
          setRangeStart(null);
          setHoveredDate(null);
          onChange?.({ start, end });
        }
      } else {
        onChange?.(date);
      }
    },
    [mode, onChange, minDate, maxDate, disabledDates, rangeStart],
  );

  const hoverDate = useCallback(
    (date: Date | null) => {
      if (mode === 'range' && rangeStart !== null) {
        setHoveredDate(date);
      }
    },
    [mode, rangeStart],
  );

  const isSelected = useCallback(
    (date: Date): boolean => {
      if (mode === 'range' && rangeStart && !isDateRange(value)) {
        return isSameDay(date, rangeStart);
      }
      if (!value) return false;
      if (value instanceof Date) return isSameDay(date, value);
      if (isDateRange(value)) {
        return isSameDay(date, value.start) || isSameDay(date, value.end);
      }
      if (Array.isArray(value)) return value.some((v) => isSameDay(date, v));
      return false;
    },
    [mode, value, rangeStart],
  );

  // --- Quick navigation (drill-up) ---

  const drillUp = useCallback(() => {
    if (!quickNavigation) return;
    if (activeView === 'days') {
      setActiveView('months');
    } else if (activeView === 'months') {
      setYearRangeStart(viewDate.getFullYear() - (viewDate.getFullYear() % 12));
      setActiveView('years');
    }
  }, [quickNavigation, activeView, viewDate]);

  const drillDown = useCallback(() => {
    if (activeView === 'years') {
      setActiveView('months');
    } else if (activeView === 'months') {
      setActiveView('days');
    }
  }, [activeView]);

  const selectMonth = useCallback(
    (month: number) => {
      const newView = new Date(viewDate.getFullYear(), month, 1);
      setViewDate(newView);
      setFocusedDate(newView);
      setActiveView('days');
      fireMonthChange(newView);
    },
    [viewDate, fireMonthChange],
  );

  const selectYear = useCallback(
    (year: number) => {
      setViewDate(new Date(year, viewDate.getMonth(), 1));
      setActiveView('months');
    },
    [viewDate],
  );

  const goToPrevYear = useCallback(() => {
    setViewDate((prev) => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
  }, []);

  const goToNextYear = useCallback(() => {
    setViewDate((prev) => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
  }, []);

  const goToPrevYearRange = useCallback(() => {
    setYearRangeStart((prev) => prev - 12);
  }, []);

  const goToNextYearRange = useCallback(() => {
    setYearRangeStart((prev) => prev + 12);
  }, []);

  const headingAriaLabel = useMemo(() => {
    if (!quickNavigation) return undefined;
    if (activeView === 'days') {
      return `Choose month and year, currently ${monthYearLabel}`;
    }
    if (activeView === 'months') {
      return `Choose year, currently ${viewDate.getFullYear()}`;
    }
    return undefined;
  }, [quickNavigation, activeView, monthYearLabel, viewDate]);

  return {
    viewDate,
    focusedDate,
    weeks,
    monthYearLabel,
    months,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    isCurrentMonth,
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
    headingAriaLabel,
  };
}
