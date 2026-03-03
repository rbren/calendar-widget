import {
  getCalendarDays,
  isSameDay,
  isDateInRange,
  isDateDisabled,
  isDateRange,
  isDateBetween,
  getISOWeekNumber,
  formatMonthYear,
  formatDayLabel,
  addDays,
  getFirstDayOfWeek,
  getLastDayOfWeek,
  sameMonth,
  getWeekdayHeaders,
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

describe('isDateRange', () => {
  it('returns true for an object with start and end Dates', () => {
    expect(
      isDateRange({ start: new Date(2026, 0, 1), end: new Date(2026, 0, 10) }),
    ).toBe(true);
  });

  it('returns false for a plain Date', () => {
    expect(isDateRange(new Date())).toBe(false);
  });

  it('returns false for null', () => {
    expect(isDateRange(null)).toBe(false);
  });

  it('returns false for an object without Date instances', () => {
    expect(isDateRange({ start: '2026-01-01', end: '2026-01-10' })).toBe(false);
  });

  it('returns false for an array', () => {
    expect(isDateRange([new Date()])).toBe(false);
  });
});

describe('isDateBetween', () => {
  it('returns true for a date strictly between start and end', () => {
    expect(
      isDateBetween(
        new Date(2026, 0, 5),
        new Date(2026, 0, 1),
        new Date(2026, 0, 10),
      ),
    ).toBe(true);
  });

  it('returns false for the start date', () => {
    expect(
      isDateBetween(
        new Date(2026, 0, 1),
        new Date(2026, 0, 1),
        new Date(2026, 0, 10),
      ),
    ).toBe(false);
  });

  it('returns false for the end date', () => {
    expect(
      isDateBetween(
        new Date(2026, 0, 10),
        new Date(2026, 0, 1),
        new Date(2026, 0, 10),
      ),
    ).toBe(false);
  });

  it('returns false for a date outside the range', () => {
    expect(
      isDateBetween(
        new Date(2026, 0, 15),
        new Date(2026, 0, 1),
        new Date(2026, 0, 10),
      ),
    ).toBe(false);
  });

  it('works when start and end are swapped', () => {
    expect(
      isDateBetween(
        new Date(2026, 0, 5),
        new Date(2026, 0, 10),
        new Date(2026, 0, 1),
      ),
    ).toBe(true);
  });
});

describe('getISOWeekNumber', () => {
  it('returns week 1 for January 1, 2026 (Thursday)', () => {
    // Jan 1 2026 is a Thursday → ISO week 1
    expect(getISOWeekNumber(new Date(2026, 0, 1))).toBe(1);
  });

  it('returns week 53 for December 31, 2026 (Thursday)', () => {
    // Dec 31 2026 is a Thursday → ISO week 53
    expect(getISOWeekNumber(new Date(2026, 11, 31))).toBe(53);
  });

  it('returns week 1 for a date in late December that belongs to next year week 1', () => {
    // Dec 31, 2018 is a Monday → ISO week 1 of 2019
    expect(getISOWeekNumber(new Date(2018, 11, 31))).toBe(1);
  });

  it('returns correct week for a mid-year date', () => {
    // June 15, 2026 is a Monday → ISO week 25
    expect(getISOWeekNumber(new Date(2026, 5, 15))).toBe(25);
  });

  it('handles leap year correctly', () => {
    // Feb 29, 2024 (leap day, Thursday) → ISO week 9
    expect(getISOWeekNumber(new Date(2024, 1, 29))).toBe(9);
  });

  it('returns week 52 for Dec 28 in most years', () => {
    // Dec 28, 2025 is a Sunday → ISO week 52 of 2025
    expect(getISOWeekNumber(new Date(2025, 11, 28))).toBe(52);
  });

  it('returns week 1 for Jan 4 (always in ISO week 1)', () => {
    // Jan 4 is always in ISO week 1
    expect(getISOWeekNumber(new Date(2026, 0, 4))).toBe(1);
    expect(getISOWeekNumber(new Date(2025, 0, 4))).toBe(1);
    expect(getISOWeekNumber(new Date(2024, 0, 4))).toBe(1);
  });

  it('handles Dec 29 that falls in week 1 of the next year', () => {
    // Dec 29, 2014 is a Monday → ISO week 1 of 2015
    expect(getISOWeekNumber(new Date(2014, 11, 29))).toBe(1);
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
    expect(formatDayLabel(date, 'en-US', { ...noFlags, isToday: true })).toBe(
      'Sunday, March 15, 2026 (today)',
    );
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

  it('appends start of range status', () => {
    expect(
      formatDayLabel(date, 'en-US', { ...noFlags, isRangeStart: true }),
    ).toBe('Sunday, March 15, 2026 (selected, start of range)');
  });

  it('appends end of range status', () => {
    expect(
      formatDayLabel(date, 'en-US', { ...noFlags, isRangeEnd: true }),
    ).toBe('Sunday, March 15, 2026 (selected, end of range)');
  });

  it('appends in selected range status', () => {
    expect(formatDayLabel(date, 'en-US', { ...noFlags, isInRange: true })).toBe(
      'Sunday, March 15, 2026 (in selected range)',
    );
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

describe('addDays', () => {
  it('adds positive days', () => {
    const result = addDays(new Date(2026, 0, 15), 3);
    expect(result.getDate()).toBe(18);
    expect(result.getMonth()).toBe(0);
  });

  it('subtracts with negative days', () => {
    const result = addDays(new Date(2026, 0, 15), -5);
    expect(result.getDate()).toBe(10);
    expect(result.getMonth()).toBe(0);
  });

  it('crosses month boundary forward', () => {
    const result = addDays(new Date(2026, 0, 30), 5);
    expect(result.getDate()).toBe(4);
    expect(result.getMonth()).toBe(1); // February
  });

  it('crosses month boundary backward', () => {
    const result = addDays(new Date(2026, 1, 3), -5);
    expect(result.getDate()).toBe(29);
    expect(result.getMonth()).toBe(0); // January
  });

  it('crosses year boundary forward', () => {
    const result = addDays(new Date(2025, 11, 30), 5);
    expect(result.getDate()).toBe(4);
    expect(result.getMonth()).toBe(0);
    expect(result.getFullYear()).toBe(2026);
  });

  it('crosses year boundary backward', () => {
    const result = addDays(new Date(2026, 0, 2), -5);
    expect(result.getDate()).toBe(28);
    expect(result.getMonth()).toBe(11);
    expect(result.getFullYear()).toBe(2025);
  });

  it('does not mutate the original date', () => {
    const original = new Date(2026, 0, 15);
    addDays(original, 10);
    expect(original.getDate()).toBe(15);
  });
});

describe('getFirstDayOfWeek', () => {
  it('returns Sunday for a Wednesday when weekStartsOn=0', () => {
    // April 15, 2026 is a Wednesday
    const result = getFirstDayOfWeek(new Date(2026, 3, 15), 0);
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getDate()).toBe(12);
  });

  it('returns Monday for a Wednesday when weekStartsOn=1', () => {
    const result = getFirstDayOfWeek(new Date(2026, 3, 15), 1);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(13);
  });

  it('returns the date itself when it is the first day of the week', () => {
    // April 12, 2026 is a Sunday
    const result = getFirstDayOfWeek(new Date(2026, 3, 12), 0);
    expect(result.getDate()).toBe(12);
  });

  it('handles weekStartsOn=6 (Saturday)', () => {
    // April 15, 2026 is a Wednesday → previous Saturday is April 11
    const result = getFirstDayOfWeek(new Date(2026, 3, 15), 6);
    expect(result.getDay()).toBe(6); // Saturday
    expect(result.getDate()).toBe(11);
  });

  it('crosses month boundary', () => {
    // March 1, 2026 is a Sunday, weekStartsOn=1 → Monday Feb 23
    const result = getFirstDayOfWeek(new Date(2026, 2, 1), 1);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(23);
  });
});

describe('getLastDayOfWeek', () => {
  it('returns Saturday for a Wednesday when weekStartsOn=0', () => {
    // April 15, 2026 is a Wednesday
    const result = getLastDayOfWeek(new Date(2026, 3, 15), 0);
    expect(result.getDay()).toBe(6); // Saturday
    expect(result.getDate()).toBe(18);
  });

  it('returns Sunday for a Wednesday when weekStartsOn=1', () => {
    const result = getLastDayOfWeek(new Date(2026, 3, 15), 1);
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getDate()).toBe(19);
  });

  it('returns the date itself when it is the last day of the week', () => {
    // April 18, 2026 is a Saturday, weekStartsOn=0
    const result = getLastDayOfWeek(new Date(2026, 3, 18), 0);
    expect(result.getDate()).toBe(18);
  });

  it('crosses month boundary', () => {
    // Jan 30, 2026 is a Friday, weekStartsOn=0 → Saturday Jan 31... no, let's check
    // Actually Jan 31, 2026 is a Saturday. weekStartsOn=0 → last day is Sat Jan 31
    const result = getLastDayOfWeek(new Date(2026, 0, 26), 0);
    // Jan 26 is Monday, weekStartsOn=0 → first day is Sun Jan 25, last day is Sat Jan 31
    expect(result.getDate()).toBe(31);
    expect(result.getMonth()).toBe(0);
  });
});

describe('sameMonth', () => {
  it('returns true when date is in the given month and year', () => {
    expect(sameMonth(new Date(2026, 3, 15), 3, 2026)).toBe(true);
  });

  it('returns false when month differs', () => {
    expect(sameMonth(new Date(2026, 3, 15), 4, 2026)).toBe(false);
  });

  it('returns false when year differs', () => {
    expect(sameMonth(new Date(2026, 3, 15), 3, 2025)).toBe(false);
  });

  it('handles December/January boundary', () => {
    expect(sameMonth(new Date(2025, 11, 31), 11, 2025)).toBe(true);
    expect(sameMonth(new Date(2026, 0, 1), 11, 2025)).toBe(false);
  });
});

describe('getWeekdayHeaders', () => {
  it('returns 7 headers starting from Sunday when weekStartsOn=0', () => {
    const headers = getWeekdayHeaders(0);
    expect(headers).toHaveLength(7);
    expect(headers[0]).toBe('Sun');
    expect(headers[6]).toBe('Sat');
  });

  it('returns 7 headers starting from Monday when weekStartsOn=1', () => {
    const headers = getWeekdayHeaders(1);
    expect(headers).toHaveLength(7);
    expect(headers[0]).toBe('Mon');
    expect(headers[6]).toBe('Sun');
  });

  it('returns 7 headers starting from Saturday when weekStartsOn=6', () => {
    const headers = getWeekdayHeaders(6);
    expect(headers[0]).toBe('Sat');
    expect(headers[1]).toBe('Sun');
    expect(headers[6]).toBe('Fri');
  });

  it('returns localized headers with explicit locale', () => {
    const headers = getWeekdayHeaders(0, 'en-US');
    expect(headers).toHaveLength(7);
    expect(headers[0]).toBe('Sun');
  });

  it('returns localized headers in German', () => {
    const headers = getWeekdayHeaders(1, 'de-DE');
    expect(headers).toHaveLength(7);
    // Monday in German
    expect(headers[0]).toMatch(/^Mo/);
  });

  it('all weekStartsOn values produce 7 unique headers', () => {
    for (let start = 0; start < 7; start++) {
      const headers = getWeekdayHeaders(start);
      expect(headers).toHaveLength(7);
      expect(new Set(headers).size).toBe(7);
    }
  });
});
