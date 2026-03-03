import {
  getCalendarDays,
  isSameDay,
  isDateInRange,
  isDateDisabled,
  formatMonthYear,
  formatDayLabel,
} from './dates';

describe('getCalendarDays', () => {
  it('returns 6 rows of 7 days each', () => {
    const weeks = getCalendarDays(2026, 0); // January 2026
    expect(weeks).toHaveLength(6);
    weeks.forEach((week) => expect(week).toHaveLength(7));
  });

  it('starts on the correct weekday (Sunday default)', () => {
    const weeks = getCalendarDays(2026, 2); // March 2026 starts on Sunday
    // First cell should be March 1 (a Sunday)
    expect(weeks[0][0].getDate()).toBe(1);
    expect(weeks[0][0].getMonth()).toBe(2);
  });

  it('includes leading days from previous month', () => {
    const weeks = getCalendarDays(2026, 1); // February 2026 starts on Sunday
    // Feb 1 2026 is a Sunday, so first cell is Feb 1
    expect(weeks[0][0].getDay()).toBe(0); // Sunday
    expect(weeks[0][0].getDate()).toBe(1);
  });

  it('respects weekStartsOn = 1 (Monday)', () => {
    const weeks = getCalendarDays(2026, 2, 1); // March 2026
    // First day of the grid should be a Monday
    expect(weeks[0][0].getDay()).toBe(1);
  });

  it('all dates in each row are consecutive days', () => {
    const weeks = getCalendarDays(2026, 5); // June 2026
    for (const week of weeks) {
      for (let i = 1; i < week.length; i++) {
        const diff = week[i].getTime() - week[i - 1].getTime();
        expect(diff).toBe(24 * 60 * 60 * 1000);
      }
    }
  });
});

describe('isSameDay', () => {
  it('returns true for the same date', () => {
    expect(isSameDay(new Date(2026, 0, 15), new Date(2026, 0, 15))).toBe(true);
  });

  it('returns true regardless of time', () => {
    const a = new Date(2026, 0, 15, 8, 30);
    const b = new Date(2026, 0, 15, 20, 0);
    expect(isSameDay(a, b)).toBe(true);
  });

  it('returns false for different dates', () => {
    expect(isSameDay(new Date(2026, 0, 15), new Date(2026, 0, 16))).toBe(false);
  });

  it('returns false for different months', () => {
    expect(isSameDay(new Date(2026, 0, 15), new Date(2026, 1, 15))).toBe(false);
  });
});

describe('isDateInRange', () => {
  const date = new Date(2026, 5, 15);

  it('returns true with no bounds', () => {
    expect(isDateInRange(date)).toBe(true);
  });

  it('returns true when within min and max', () => {
    expect(
      isDateInRange(date, new Date(2026, 5, 1), new Date(2026, 5, 30)),
    ).toBe(true);
  });

  it('returns true when date equals min', () => {
    expect(isDateInRange(date, new Date(2026, 5, 15))).toBe(true);
  });

  it('returns true when date equals max', () => {
    expect(isDateInRange(date, undefined, new Date(2026, 5, 15))).toBe(true);
  });

  it('returns false when before min', () => {
    expect(isDateInRange(date, new Date(2026, 5, 16))).toBe(false);
  });

  it('returns false when after max', () => {
    expect(isDateInRange(date, undefined, new Date(2026, 5, 14))).toBe(false);
  });
});

describe('isDateDisabled', () => {
  it('returns true when date is in disabled list', () => {
    const disabled = [new Date(2026, 0, 1), new Date(2026, 0, 15)];
    expect(isDateDisabled(new Date(2026, 0, 15), disabled)).toBe(true);
  });

  it('returns false when date is not in disabled list', () => {
    const disabled = [new Date(2026, 0, 1)];
    expect(isDateDisabled(new Date(2026, 0, 15), disabled)).toBe(false);
  });

  it('returns false with empty disabled list', () => {
    expect(isDateDisabled(new Date(2026, 0, 15), [])).toBe(false);
  });
});

describe('formatMonthYear', () => {
  it('formats date as month and year', () => {
    const result = formatMonthYear(new Date(2026, 0, 1), 'en-US');
    expect(result).toBe('January 2026');
  });

  it('respects locale', () => {
    const result = formatMonthYear(new Date(2026, 0, 1), 'de-DE');
    expect(result).toBe('Januar 2026');
  });
});

describe('formatDayLabel', () => {
  const date = new Date(2026, 2, 15); // Sunday, March 15, 2026
  const noFlags = { isToday: false, isSelected: false, isDisabled: false };

  it('returns the full formatted date with no status', () => {
    expect(formatDayLabel(date, 'en-US', noFlags)).toBe(
      'Sunday, March 15, 2026',
    );
  });

  it('appends (today) when isToday', () => {
    expect(
      formatDayLabel(date, 'en-US', { ...noFlags, isToday: true }),
    ).toBe('Sunday, March 15, 2026 (today)');
  });

  it('appends (selected) when isSelected', () => {
    expect(
      formatDayLabel(date, 'en-US', { ...noFlags, isSelected: true }),
    ).toBe('Sunday, March 15, 2026 (selected)');
  });

  it('appends (unavailable) when isDisabled', () => {
    expect(
      formatDayLabel(date, 'en-US', { ...noFlags, isDisabled: true }),
    ).toBe('Sunday, March 15, 2026 (unavailable)');
  });

  it('combines multiple statuses', () => {
    expect(
      formatDayLabel(date, 'en-US', {
        isToday: true,
        isSelected: true,
        isDisabled: false,
      }),
    ).toBe('Sunday, March 15, 2026 (today, selected)');
  });

  it('combines all three statuses', () => {
    expect(
      formatDayLabel(date, 'en-US', {
        isToday: true,
        isSelected: true,
        isDisabled: true,
      }),
    ).toBe('Sunday, March 15, 2026 (today, selected, unavailable)');
  });

  it('includes marker label before statuses', () => {
    expect(
      formatDayLabel(
        date,
        'en-US',
        { ...noFlags, isToday: true },
        'Team standup',
      ),
    ).toBe('Sunday, March 15, 2026, Team standup (today)');
  });

  it('includes marker label with no statuses', () => {
    expect(formatDayLabel(date, 'en-US', noFlags, 'Team standup')).toBe(
      'Sunday, March 15, 2026, Team standup',
    );
  });

  it('formats in German locale', () => {
    const label = formatDayLabel(date, 'de-DE', noFlags);
    expect(label).toContain('Sonntag');
    expect(label).toContain('März');
    expect(label).toContain('2026');
  });

  it('works with undefined locale', () => {
    const label = formatDayLabel(date, undefined, noFlags);
    expect(label).toBeTruthy();
    expect(label).toContain('2026');
  });
});
