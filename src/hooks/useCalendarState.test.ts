import { renderHook, act } from '@testing-library/react';
import { useCalendarState } from './useCalendarState';

describe('useCalendarState', () => {
  it('initializes viewDate from value', () => {
    const { result } = renderHook(() =>
      useCalendarState({ value: new Date(2026, 3, 10) }),
    );
    expect(result.current.viewDate.getFullYear()).toBe(2026);
    expect(result.current.viewDate.getMonth()).toBe(3);
  });

  it('defaults viewDate to current month when no value', () => {
    const now = new Date();
    const { result } = renderHook(() => useCalendarState({}));
    expect(result.current.viewDate.getMonth()).toBe(now.getMonth());
    expect(result.current.viewDate.getFullYear()).toBe(now.getFullYear());
  });

  it('navigates to previous month', () => {
    const { result } = renderHook(() =>
      useCalendarState({ value: new Date(2026, 3, 10) }),
    );
    act(() => result.current.goToPrevMonth());
    expect(result.current.viewDate.getMonth()).toBe(2);
  });

  it('navigates to next month', () => {
    const { result } = renderHook(() =>
      useCalendarState({ value: new Date(2026, 3, 10) }),
    );
    act(() => result.current.goToNextMonth());
    expect(result.current.viewDate.getMonth()).toBe(4);
  });

  it('wraps year when navigating past December', () => {
    const { result } = renderHook(() =>
      useCalendarState({ value: new Date(2026, 11, 1) }),
    );
    act(() => result.current.goToNextMonth());
    expect(result.current.viewDate.getMonth()).toBe(0);
    expect(result.current.viewDate.getFullYear()).toBe(2027);
  });

  it('wraps year when navigating before January', () => {
    const { result } = renderHook(() =>
      useCalendarState({ value: new Date(2026, 0, 1) }),
    );
    act(() => result.current.goToPrevMonth());
    expect(result.current.viewDate.getMonth()).toBe(11);
    expect(result.current.viewDate.getFullYear()).toBe(2025);
  });

  it('returns 6 weeks of days', () => {
    const { result } = renderHook(() =>
      useCalendarState({ value: new Date(2026, 3, 10) }),
    );
    expect(result.current.weeks).toHaveLength(6);
    result.current.weeks.forEach((w) => expect(w).toHaveLength(7));
  });

  it('returns formatted monthYearLabel', () => {
    const { result } = renderHook(() =>
      useCalendarState({ value: new Date(2026, 3, 10), locale: 'en-US' }),
    );
    expect(result.current.monthYearLabel).toBe('April 2026');
  });

  it('calls onChange when selecting a valid date', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useCalendarState({ onChange }));
    const date = new Date(2026, 3, 10);
    act(() => result.current.selectDate(date));
    expect(onChange).toHaveBeenCalledWith(date);
  });

  it('does not call onChange for a disabled date', () => {
    const onChange = vi.fn();
    const disabled = new Date(2026, 3, 10);
    const { result } = renderHook(() =>
      useCalendarState({ onChange, disabledDates: [disabled] }),
    );
    act(() => result.current.selectDate(new Date(2026, 3, 10)));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call onChange for a date outside minDate', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendarState({ onChange, minDate: new Date(2026, 3, 15) }),
    );
    act(() => result.current.selectDate(new Date(2026, 3, 10)));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call onChange for a date outside maxDate', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendarState({ onChange, maxDate: new Date(2026, 3, 5) }),
    );
    act(() => result.current.selectDate(new Date(2026, 3, 10)));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('isSelected returns true for selected single date', () => {
    const selected = new Date(2026, 3, 10);
    const { result } = renderHook(() => useCalendarState({ value: selected }));
    expect(result.current.isSelected(new Date(2026, 3, 10))).toBe(true);
    expect(result.current.isSelected(new Date(2026, 3, 11))).toBe(false);
  });

  it('isSelected returns true for dates in array value', () => {
    const { result } = renderHook(() =>
      useCalendarState({
        value: [new Date(2026, 3, 10), new Date(2026, 3, 20)],
      }),
    );
    expect(result.current.isSelected(new Date(2026, 3, 10))).toBe(true);
    expect(result.current.isSelected(new Date(2026, 3, 20))).toBe(true);
    expect(result.current.isSelected(new Date(2026, 3, 15))).toBe(false);
  });

  it('initializes focusedDate from value', () => {
    const { result } = renderHook(() =>
      useCalendarState({ value: new Date(2026, 3, 10) }),
    );
    expect(result.current.focusedDate.getDate()).toBe(10);
    expect(result.current.focusedDate.getMonth()).toBe(3);
  });

  it('focusDate updates focusedDate', () => {
    const { result } = renderHook(() =>
      useCalendarState({ value: new Date(2026, 3, 10) }),
    );
    act(() => result.current.focusDate(new Date(2026, 3, 20)));
    expect(result.current.focusedDate.getDate()).toBe(20);
  });

  it('focusDate navigates view when moving to a different month', () => {
    const { result } = renderHook(() =>
      useCalendarState({ value: new Date(2026, 3, 10) }),
    );
    act(() => result.current.focusDate(new Date(2026, 4, 10)));
    expect(result.current.viewDate.getMonth()).toBe(4);
    expect(result.current.viewDate.getFullYear()).toBe(2026);
  });
});
