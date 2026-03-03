import { useState, useCallback, useMemo } from 'react';
import {
  getCalendarDays,
  isSameDay,
  isDateInRange,
  isDateDisabled,
  formatMonthYear,
} from '../utils/dates';
import type { CalendarWidgetProps } from '../types/calendar';

export function useCalendarState(props: CalendarWidgetProps) {
  const {
    value,
    onChange,
    locale,
    minDate,
    maxDate,
    disabledDates = [],
    weekStartsOn = 0,
  } = props;

  const initialDate = value instanceof Date ? value : new Date();
  const [viewDate, setViewDate] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );

  const goToPrevMonth = useCallback(() => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const weeks = useMemo(
    () => getCalendarDays(viewDate.getFullYear(), viewDate.getMonth(), weekStartsOn),
    [viewDate, weekStartsOn],
  );

  const monthYearLabel = useMemo(
    () => formatMonthYear(viewDate, locale),
    [viewDate, locale],
  );

  const selectDate = useCallback(
    (date: Date) => {
      if (!isDateInRange(date, minDate, maxDate)) return;
      if (isDateDisabled(date, disabledDates)) return;
      onChange?.(date);
    },
    [onChange, minDate, maxDate, disabledDates],
  );

  const isSelected = useCallback(
    (date: Date): boolean => {
      if (!value) return false;
      if (value instanceof Date) return isSameDay(date, value);
      if (Array.isArray(value)) return value.some((v) => isSameDay(date, v));
      return false;
    },
    [value],
  );

  return {
    viewDate,
    weeks,
    monthYearLabel,
    goToPrevMonth,
    goToNextMonth,
    selectDate,
    isSelected,
  };
}
