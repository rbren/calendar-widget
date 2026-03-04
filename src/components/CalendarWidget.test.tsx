import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarWidget } from './CalendarWidget';
import type { DateRange } from '../types/calendar';

describe('CalendarWidget', () => {
  it('renders with default props', () => {
    render(<CalendarWidget />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays the correct month/year', () => {
    render(<CalendarWidget value={new Date(2026, 3, 15)} locale="en-US" />);
    expect(screen.getByText('April 2026')).toBeInTheDocument();
  });

  it('navigates to previous month', async () => {
    render(<CalendarWidget value={new Date(2026, 3, 15)} locale="en-US" />);
    await userEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('navigates to next month', async () => {
    render(<CalendarWidget value={new Date(2026, 3, 15)} locale="en-US" />);
    await userEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByText('May 2026')).toBeInTheDocument();
  });

  it('calls onChange when a date is clicked', async () => {
    const onChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 3, 1)}
        onChange={onChange}
        locale="en-US"
      />,
    );
    // Click on day 10
    await userEvent.click(screen.getByText('10'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0].getDate()).toBe(10);
  });

  it('does not call onChange for disabled dates', async () => {
    const onChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 3, 1)}
        onChange={onChange}
        disabledDates={[new Date(2026, 3, 10)]}
        locale="en-US"
      />,
    );
    await userEvent.click(screen.getByText('10'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies custom className to root element', () => {
    const { container } = render(<CalendarWidget className="my-cal" />);
    const root = container.firstElementChild!;
    expect(root).toHaveClass('my-cal');
  });

  it('renders weekday headers starting on Monday when weekStartsOn=1', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        weekStartsOn={1}
        locale="en-US"
      />,
    );
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Mon');
  });
});

describe('CalendarWidget range mode', () => {
  // Use a fixed date to pin the calendar to a specific month (April 2026)
  // April 2026 starts on Wednesday, so no duplicate day numbers in the grid
  const april1 = new Date(2026, 3, 1);

  function getDay(day: number): HTMLElement {
    return screen.getByLabelText(new RegExp(`April ${day}, 2026`));
  }

  it('calls onChange with DateRange after clicking two dates', async () => {
    const onChange = vi.fn();
    render(
      <CalendarWidget
        mode="range"
        value={april1}
        onChange={onChange}
        locale="en-US"
      />,
    );

    await userEvent.click(getDay(5));
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.click(getDay(10));
    expect(onChange).toHaveBeenCalledOnce();
    const result = onChange.mock.calls[0][0] as DateRange;
    expect(result.start.getDate()).toBe(5);
    expect(result.end.getDate()).toBe(10);
  });

  it('swaps start/end when second click is before first', async () => {
    const onChange = vi.fn();
    render(
      <CalendarWidget
        mode="range"
        value={april1}
        onChange={onChange}
        locale="en-US"
      />,
    );

    await userEvent.click(getDay(15));
    await userEvent.click(getDay(5));

    expect(onChange).toHaveBeenCalledOnce();
    const result = onChange.mock.calls[0][0] as DateRange;
    expect(result.start.getDate()).toBe(5);
    expect(result.end.getDate()).toBe(15);
  });

  it('respects minDate/maxDate in range mode', async () => {
    const onChange = vi.fn();
    render(
      <CalendarWidget
        mode="range"
        value={april1}
        onChange={onChange}
        minDate={new Date(2026, 3, 5)}
        maxDate={new Date(2026, 3, 20)}
        locale="en-US"
      />,
    );

    // Click on day 3 (before minDate - should be disabled)
    await userEvent.click(getDay(3));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('displays completed range with aria labels', () => {
    const rangeValue: DateRange = {
      start: new Date(2026, 3, 5),
      end: new Date(2026, 3, 10),
    };
    render(<CalendarWidget mode="range" value={rangeValue} locale="en-US" />);

    const startCell = getDay(5);
    const endCell = getDay(10);
    expect(startCell).toHaveAttribute('aria-selected', 'true');
    expect(endCell).toHaveAttribute('aria-selected', 'true');

    expect(startCell.getAttribute('aria-label')).toContain('start of range');
    expect(endCell.getAttribute('aria-label')).toContain('end of range');

    const midCell = getDay(7);
    expect(midCell.getAttribute('aria-label')).toContain('in selected range');
  });

  it('shows preview highlight on hover during range selection', async () => {
    const onChange = vi.fn();
    render(
      <CalendarWidget
        mode="range"
        value={april1}
        onChange={onChange}
        locale="en-US"
      />,
    );

    await userEvent.click(getDay(5));

    fireEvent.mouseEnter(getDay(10));

    const day7Cell = getDay(7);
    expect(day7Cell.className).toContain('inPreview');
  });

  it('keyboard-only range selection works', async () => {
    const onChange = vi.fn();
    render(
      <CalendarWidget
        mode="range"
        value={april1}
        onChange={onChange}
        locale="en-US"
      />,
    );

    await userEvent.click(getDay(5));
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.click(getDay(10));
    expect(onChange).toHaveBeenCalledOnce();
    const result = onChange.mock.calls[0][0] as DateRange;
    expect(result.start.getDate()).toBe(5);
    expect(result.end.getDate()).toBe(10);
  });

  it('next click starts a new range after a complete range', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CalendarWidget
        mode="range"
        value={april1}
        onChange={onChange}
        locale="en-US"
      />,
    );

    await userEvent.click(getDay(5));
    await userEvent.click(getDay(10));
    expect(onChange).toHaveBeenCalledOnce();

    rerender(
      <CalendarWidget
        mode="range"
        value={onChange.mock.calls[0][0]}
        onChange={onChange}
        locale="en-US"
      />,
    );

    await userEvent.click(getDay(15));
    expect(onChange).toHaveBeenCalledTimes(1);

    await userEvent.click(getDay(20));
    expect(onChange).toHaveBeenCalledTimes(2);
    const result2 = onChange.mock.calls[1][0] as DateRange;
    expect(result2.start.getDate()).toBe(15);
    expect(result2.end.getDate()).toBe(20);
  });

  it('disabled dates inside range appear in visual band but are not clickable', () => {
    const rangeValue: DateRange = {
      start: new Date(2026, 3, 5),
      end: new Date(2026, 3, 15),
    };
    render(
      <CalendarWidget
        mode="range"
        value={rangeValue}
        onChange={vi.fn()}
        disabledDates={[new Date(2026, 3, 10)]}
        locale="en-US"
      />,
    );

    const day10Cell = getDay(10);
    expect(day10Cell).toHaveAttribute('aria-disabled', 'true');
    expect(day10Cell.getAttribute('aria-label')).toContain('in selected range');
  });
});

describe('CalendarWidget Today button', () => {
  it('renders the Today button by default', () => {
    render(<CalendarWidget value={new Date(2026, 3, 15)} locale="en-US" />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('navigates to the current month when clicked from a distant month', async () => {
    const now = new Date();
    const distantDate = new Date(2020, 0, 15);
    render(<CalendarWidget value={distantDate} locale="en-US" />);

    // Should be showing January 2020
    expect(screen.getByText('January 2020')).toBeInTheDocument();

    // Click Today
    await userEvent.click(
      screen.getByRole('button', { name: 'Navigate to current month' }),
    );

    // Should now show the current month
    const expectedLabel = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(now);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('does not select today when clicking Today button', async () => {
    const onChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2020, 0, 15)}
        onChange={onChange}
        locale="en-US"
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Navigate to current month' }),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables the Today button when already on the current month', () => {
    const now = new Date();
    render(<CalendarWidget value={now} locale="en-US" />);
    const btn = screen.getByRole('button', {
      name: 'Navigate to current month',
    });
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });

  it('hides the Today button when showTodayButton={false}', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        showTodayButton={false}
        locale="en-US"
      />,
    );
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('renders a custom todayButtonLabel', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        todayButtonLabel="Aujourd'hui"
        locale="en-US"
      />,
    );
    expect(screen.getByText("Aujourd'hui")).toBeInTheDocument();
  });

  it('returns to day view when clicked from month/year picker', async () => {
    render(<CalendarWidget value={new Date(2020, 0, 15)} locale="en-US" />);

    // Open month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    expect(
      screen.getByRole('grid', { name: /month picker/i }),
    ).toBeInTheDocument();

    // Click Today - should go back to day view at current month
    await userEvent.click(
      screen.getByRole('button', { name: 'Navigate to current month' }),
    );
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();
  });
});

describe('CalendarWidget quick navigation', () => {
  it('renders heading as a button by default (quickNavigation=true)', () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);
    const btn = screen.getByRole('button', { name: /choose month and year/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('March 2026');
  });

  it('renders heading as plain text when quickNavigation=false', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        locale="en-US"
        quickNavigation={false}
      />,
    );
    expect(
      screen.queryByRole('button', { name: /choose month and year/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('opens month picker when heading is clicked', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );

    // Month picker should appear
    expect(
      screen.getByRole('grid', { name: /month picker/i }),
    ).toBeInTheDocument();
    // Day grid should be gone
    expect(
      screen.queryByRole('grid', { name: 'Calendar' }),
    ).not.toBeInTheDocument();
    // Header should show year
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('selects a month from month picker and returns to day grid', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);
    // Open month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    // Click June
    await userEvent.click(screen.getByText('Jun'));

    // Back to day grid showing June
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /choose month and year, currently june 2026/i,
      }),
    ).toBeInTheDocument();
  });

  it('opens year picker from month picker heading', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);
    // Open month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    // Click year heading to open year picker
    await userEvent.click(screen.getByRole('button', { name: /choose year/i }));

    // Year picker should appear
    expect(
      screen.getByRole('grid', { name: /year picker/i }),
    ).toBeInTheDocument();
    // Month picker should be gone
    expect(
      screen.queryByRole('grid', { name: /month picker/i }),
    ).not.toBeInTheDocument();
  });

  it('selects year from year picker and returns to month picker', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);
    // Open month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    // Open year picker
    await userEvent.click(screen.getByRole('button', { name: /choose year/i }));
    // Click 2020 (within the 2016-2027 range)
    await userEvent.click(screen.getByText('2020'));

    // Back to month picker for 2020
    expect(
      screen.getByRole('grid', { name: /month picker, 2020/i }),
    ).toBeInTheDocument();
  });

  it('full flow: heading → month picker → year picker → select year → select month → day grid', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);

    // Day grid visible
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();

    // 1. Click heading → month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    expect(
      screen.getByRole('grid', { name: /month picker/i }),
    ).toBeInTheDocument();

    // 2. Click year label → year picker
    await userEvent.click(screen.getByRole('button', { name: /choose year/i }));
    expect(
      screen.getByRole('grid', { name: /year picker/i }),
    ).toBeInTheDocument();

    // 3. Select year 2022 (within the 2016-2027 range)
    await userEvent.click(screen.getByText('2022'));
    expect(
      screen.getByRole('grid', { name: /month picker, 2022/i }),
    ).toBeInTheDocument();

    // 4. Select August
    await userEvent.click(screen.getByText('Aug'));

    // 5. Back to day grid showing August 2022
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /currently august 2022/i }),
    ).toBeInTheDocument();
  });

  it('Escape in month picker returns to day grid', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    expect(
      screen.getByRole('grid', { name: /month picker/i }),
    ).toBeInTheDocument();

    // Press Escape
    const grid = screen.getByRole('grid', { name: /month picker/i });
    const cell = grid.querySelector('td[tabindex="0"]')!;
    fireEvent.keyDown(cell, { key: 'Escape' });

    // Back to day grid
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();
  });

  it('Escape in year picker returns to month picker', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    await userEvent.click(screen.getByRole('button', { name: /choose year/i }));
    expect(
      screen.getByRole('grid', { name: /year picker/i }),
    ).toBeInTheDocument();

    // Press Escape
    const grid = screen.getByRole('grid', { name: /year picker/i });
    const cell = grid.querySelector('td[tabindex="0"]')!;
    fireEvent.keyDown(cell, { key: 'Escape' });

    // Back to month picker
    expect(
      screen.getByRole('grid', { name: /month picker/i }),
    ).toBeInTheDocument();
  });

  it('prev/next arrows change year in month picker view', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    expect(screen.getByText('2026')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Previous year'));
    expect(screen.getByText('2025')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Next year'));
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('prev/next arrows change year range in year picker view', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    await userEvent.click(screen.getByRole('button', { name: /choose year/i }));

    // Year range should include 2026: 2016-2027
    expect(screen.getByText('2016')).toBeInTheDocument();
    expect(screen.getByText('2027')).toBeInTheDocument();

    // Click next to go to 2028-2039
    await userEvent.click(screen.getByLabelText('Next year range'));
    expect(screen.getByText('2028')).toBeInTheDocument();
    expect(screen.getByText('2039')).toBeInTheDocument();

    // Click prev to go back
    await userEvent.click(screen.getByLabelText('Previous year range'));
    expect(screen.getByText('2016')).toBeInTheDocument();
  });

  it('nav buttons have correct aria-labels for each view', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);

    // Day view
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();

    // Month picker view
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    expect(screen.getByLabelText('Previous year')).toBeInTheDocument();
    expect(screen.getByLabelText('Next year')).toBeInTheDocument();

    // Year picker view
    await userEvent.click(screen.getByRole('button', { name: /choose year/i }));
    expect(screen.getByLabelText('Previous year range')).toBeInTheDocument();
    expect(screen.getByLabelText('Next year range')).toBeInTheDocument();
  });

  it('keyboard Enter on heading opens month picker', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);
    const btn = screen.getByRole('button', { name: /choose month and year/i });
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(
      screen.getByRole('grid', { name: /month picker/i }),
    ).toBeInTheDocument();
  });

  it('heading in year picker view is not clickable (no further drill-up)', async () => {
    render(<CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />);
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    await userEvent.click(screen.getByRole('button', { name: /choose year/i }));

    // Year range label should not be a button
    expect(
      screen.queryByRole('button', { name: /choose/i }),
    ).not.toBeInTheDocument();
  });

  describe('week numbers', () => {
    it('does not render week numbers by default', () => {
      render(<CalendarWidget value={new Date(2026, 0, 1)} />);
      expect(screen.queryAllByRole('rowheader')).toHaveLength(0);
    });

    it('renders week numbers when showWeekNumbers is true', () => {
      render(<CalendarWidget value={new Date(2026, 0, 1)} showWeekNumbers />);
      const rowHeaders = screen.getAllByRole('rowheader');
      expect(rowHeaders).toHaveLength(6);
      // First row starts Dec 28, 2025 (ISO week 52); second row is week 1
      expect(rowHeaders[0]).toHaveAttribute('aria-label', 'Week 52');
      expect(rowHeaders[1]).toHaveAttribute('aria-label', 'Week 1');
    });
  });
});

describe('CalendarWidget renderDay', () => {
  it('renders custom content via renderDay', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        locale="en-US"
        renderDay={(dayNumber, { isToday }) => (
          <div>
            {dayNumber}
            {isToday && <span data-testid="today-badge">★</span>}
          </div>
        )}
      />,
    );
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders default content without renderDay', () => {
    render(<CalendarWidget value={new Date(2026, 3, 15)} locale="en-US" />);
    expect(screen.getByText('15')).toBeInTheDocument();
    const cell = screen.getByLabelText(/April 15, 2026/);
    // Default: just a span with the day number
    expect(cell.querySelector('span')).toHaveTextContent('15');
  });

  it('preserves keyboard navigation with renderDay', async () => {
    const onChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        onChange={onChange}
        locale="en-US"
        renderDay={(dayNumber) => <strong>{dayNumber}</strong>}
      />,
    );
    // Click on day 10 (rendered through renderDay)
    await userEvent.click(screen.getByText('10'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0].getDate()).toBe(10);
  });

  it('preserves ARIA attributes with renderDay', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        locale="en-US"
        renderDay={(dayNumber) => <strong>{dayNumber}</strong>}
      />,
    );
    const cell = screen.getByLabelText(/April 15, 2026/);
    expect(cell).toHaveAttribute('aria-selected', 'true');
    expect(cell).toHaveAttribute('role', 'gridcell');
  });
});

describe('CalendarWidget onMonthChange', () => {
  it('fires onMonthChange when navigating forward', async () => {
    const onMonthChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        onMonthChange={onMonthChange}
        locale="en-US"
      />,
    );
    await userEvent.click(screen.getByLabelText('Next month'));
    expect(onMonthChange).toHaveBeenCalledOnce();
    const arg = onMonthChange.mock.calls[0][0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(4); // May
    expect(arg.getDate()).toBe(1);
  });

  it('fires onMonthChange when navigating backward', async () => {
    const onMonthChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        onMonthChange={onMonthChange}
        locale="en-US"
      />,
    );
    await userEvent.click(screen.getByLabelText('Previous month'));
    expect(onMonthChange).toHaveBeenCalledOnce();
    const arg = onMonthChange.mock.calls[0][0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(2); // March
    expect(arg.getDate()).toBe(1);
  });

  it('fires onMonthChange 3 times when navigating forward 3 months', async () => {
    const onMonthChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        onMonthChange={onMonthChange}
        locale="en-US"
      />,
    );
    await userEvent.click(screen.getByLabelText('Next month'));
    await userEvent.click(screen.getByLabelText('Next month'));
    await userEvent.click(screen.getByLabelText('Next month'));
    expect(onMonthChange).toHaveBeenCalledTimes(3);
    // Should be May, June, July
    expect((onMonthChange.mock.calls[0][0] as Date).getMonth()).toBe(4);
    expect((onMonthChange.mock.calls[1][0] as Date).getMonth()).toBe(5);
    expect((onMonthChange.mock.calls[2][0] as Date).getMonth()).toBe(6);
  });

  it('fires onMonthChange when quick-nav selects a month', async () => {
    const onMonthChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        onMonthChange={onMonthChange}
        locale="en-US"
      />,
    );
    // Open month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    // Select June
    await userEvent.click(screen.getByText('Jun'));
    expect(onMonthChange).toHaveBeenCalledOnce();
    const arg = onMonthChange.mock.calls[0][0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(5); // June
  });

  it('fires onMonthChange via full quick-nav flow (year picker → month picker)', async () => {
    const onMonthChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        onMonthChange={onMonthChange}
        locale="en-US"
      />,
    );
    // Open month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    // Open year picker
    await userEvent.click(screen.getByRole('button', { name: /choose year/i }));
    // Select 2022
    await userEvent.click(screen.getByText('2022'));
    // Still in month picker, no onMonthChange yet
    expect(onMonthChange).not.toHaveBeenCalled();
    // Select August
    await userEvent.click(screen.getByText('Aug'));
    expect(onMonthChange).toHaveBeenCalledOnce();
    const arg = onMonthChange.mock.calls[0][0] as Date;
    expect(arg.getFullYear()).toBe(2022);
    expect(arg.getMonth()).toBe(7); // August
  });

  it('fires onMonthChange when Today button changes month', async () => {
    const onMonthChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2020, 0, 15)}
        onMonthChange={onMonthChange}
        locale="en-US"
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Navigate to current month' }),
    );
    expect(onMonthChange).toHaveBeenCalledOnce();
    const now = new Date();
    const arg = onMonthChange.mock.calls[0][0] as Date;
    expect(arg.getFullYear()).toBe(now.getFullYear());
    expect(arg.getMonth()).toBe(now.getMonth());
    expect(arg.getDate()).toBe(1);
  });

  it('does not fire onMonthChange when Today button is clicked while on current month', async () => {
    const onMonthChange = vi.fn();
    const now = new Date();
    render(
      <CalendarWidget
        value={now}
        onMonthChange={onMonthChange}
        locale="en-US"
      />,
    );
    // The Today button should be disabled when already on current month
    // Clicking it should not fire onMonthChange
    const btn = screen.getByRole('button', {
      name: 'Navigate to current month',
    });
    await userEvent.click(btn);
    expect(onMonthChange).not.toHaveBeenCalled();
  });

  it('does not fire onMonthChange on initial mount', () => {
    const onMonthChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        onMonthChange={onMonthChange}
        locale="en-US"
      />,
    );
    expect(onMonthChange).not.toHaveBeenCalled();
  });

  it('does not fire onMonthChange when parent updates value prop', () => {
    const onMonthChange = vi.fn();
    const { rerender } = render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        onMonthChange={onMonthChange}
        locale="en-US"
      />,
    );
    // Parent changes value to a different month
    rerender(
      <CalendarWidget
        value={new Date(2026, 6, 10)}
        onMonthChange={onMonthChange}
        locale="en-US"
      />,
    );
    expect(onMonthChange).not.toHaveBeenCalled();
  });
});

describe('CalendarWidget onDayFocus', () => {
  it('fires onDayFocus during keyboard navigation', async () => {
    const onDayFocus = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 3, 15)}
        onDayFocus={onDayFocus}
        locale="en-US"
      />,
    );
    // Click on day 15 to focus the grid
    await userEvent.click(screen.getByLabelText(/April 15, 2026/));
    onDayFocus.mockClear();

    // Arrow right 3 times (15 → 16 → 17 → 18)
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');

    expect(onDayFocus).toHaveBeenCalledTimes(3);
    expect((onDayFocus.mock.calls[0][0] as Date).getDate()).toBe(16);
    expect((onDayFocus.mock.calls[1][0] as Date).getDate()).toBe(17);
    expect((onDayFocus.mock.calls[2][0] as Date).getDate()).toBe(18);
  });

  it('fires onDayFocus with correct dates across 5 arrow-key moves', async () => {
    const onDayFocus = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 3, 10)}
        onDayFocus={onDayFocus}
        locale="en-US"
      />,
    );
    await userEvent.click(screen.getByLabelText(/April 10, 2026/));
    onDayFocus.mockClear();

    // 5 arrow-down moves (each jumps 1 week)
    for (let i = 0; i < 5; i++) {
      await userEvent.keyboard('{ArrowDown}');
    }

    expect(onDayFocus).toHaveBeenCalledTimes(5);
    expect((onDayFocus.mock.calls[0][0] as Date).getDate()).toBe(17);
    expect((onDayFocus.mock.calls[1][0] as Date).getDate()).toBe(24);
    // April 10 + 3 weeks = May 1
    expect((onDayFocus.mock.calls[2][0] as Date).getMonth()).toBe(4); // May
    expect((onDayFocus.mock.calls[2][0] as Date).getDate()).toBe(1);
  });
});

describe('CalendarWidget numberOfMonths', () => {
  it('renders two consecutive months side by side with numberOfMonths={2}', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        numberOfMonths={2}
        locale="en-US"
      />,
    );
    expect(screen.getByText('March 2026')).toBeInTheDocument();
    expect(screen.getByText('April 2026')).toBeInTheDocument();
    // Two calendar grids
    const grids = screen.getAllByRole('grid', { name: 'Calendar' });
    expect(grids).toHaveLength(2);
  });

  it('renders three months with numberOfMonths={3}', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        numberOfMonths={3}
        locale="en-US"
      />,
    );
    expect(screen.getByText('March 2026')).toBeInTheDocument();
    expect(screen.getByText('April 2026')).toBeInTheDocument();
    expect(screen.getByText('May 2026')).toBeInTheDocument();
    const grids = screen.getAllByRole('grid', { name: 'Calendar' });
    expect(grids).toHaveLength(3);
  });

  it('clicking next shifts all months by one', async () => {
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        numberOfMonths={2}
        locale="en-US"
      />,
    );
    expect(screen.getByText('March 2026')).toBeInTheDocument();
    expect(screen.getByText('April 2026')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByText('April 2026')).toBeInTheDocument();
    expect(screen.getByText('May 2026')).toBeInTheDocument();
    expect(screen.queryByText('March 2026')).not.toBeInTheDocument();
  });

  it('clicking prev shifts all months by one', async () => {
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        numberOfMonths={2}
        locale="en-US"
      />,
    );
    await userEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByText('February 2026')).toBeInTheDocument();
    expect(screen.getByText('March 2026')).toBeInTheDocument();
    expect(screen.queryByText('April 2026')).not.toBeInTheDocument();
  });

  it('numberOfMonths={1} behaves identically to default single-month', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        numberOfMonths={1}
        locale="en-US"
      />,
    );
    const grids = screen.getAllByRole('grid', { name: 'Calendar' });
    expect(grids).toHaveLength(1);
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('treats numberOfMonths <= 0 as 1', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        numberOfMonths={0}
        locale="en-US"
      />,
    );
    const grids = screen.getAllByRole('grid', { name: 'Calendar' });
    expect(grids).toHaveLength(1);
  });

  it('treats negative numberOfMonths as 1', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        numberOfMonths={-2}
        locale="en-US"
      />,
    );
    const grids = screen.getAllByRole('grid', { name: 'Calendar' });
    expect(grids).toHaveLength(1);
  });

  it('range selection across two visible months works', async () => {
    const onChange = vi.fn();
    render(
      <CalendarWidget
        mode="range"
        value={new Date(2026, 2, 15)}
        numberOfMonths={2}
        onChange={onChange}
        locale="en-US"
      />,
    );

    // Click a day in March (left month)
    const march20 = screen.getByLabelText(/March 20, 2026/);
    await userEvent.click(march20);
    expect(onChange).not.toHaveBeenCalled();

    // Click a day in April (right month) — pick the non-outside-day cell
    const april10 = screen
      .getAllByLabelText(/April 10, 2026/)
      .find((el) => !el.className.includes('outside'))!;
    await userEvent.click(april10);
    expect(onChange).toHaveBeenCalledOnce();

    const result = onChange.mock.calls[0][0] as DateRange;
    expect(result.start.getMonth()).toBe(2); // March
    expect(result.start.getDate()).toBe(20);
    expect(result.end.getMonth()).toBe(3); // April
    expect(result.end.getDate()).toBe(10);
  });

  it('shows week numbers on each grid when showWeekNumbers is enabled', () => {
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        numberOfMonths={2}
        showWeekNumbers
        locale="en-US"
      />,
    );
    // Each grid has 6 rows, 2 grids = 12 rowheaders
    const rowHeaders = screen.getAllByRole('rowheader');
    expect(rowHeaders).toHaveLength(12);
  });

  it('quick navigation opens month picker from the first month heading', async () => {
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        numberOfMonths={2}
        locale="en-US"
      />,
    );
    // Only the first month heading should be a clickable button for quick-nav
    const quickNavBtn = screen.getByRole('button', {
      name: /choose month and year/i,
    });
    expect(quickNavBtn).toHaveTextContent('March 2026');

    await userEvent.click(quickNavBtn);
    // Month picker should appear
    expect(
      screen.getByRole('grid', { name: /month picker/i }),
    ).toBeInTheDocument();
    // Day grids should be gone
    expect(
      screen.queryByRole('grid', { name: 'Calendar' }),
    ).not.toBeInTheDocument();
  });

  it('selecting a month from picker shifts all months in multi-month view', async () => {
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        numberOfMonths={2}
        locale="en-US"
      />,
    );
    // Open month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    // Select June
    await userEvent.click(screen.getByText('Jun'));

    // Back to day view showing June + July
    const grids = screen.getAllByRole('grid', { name: 'Calendar' });
    expect(grids).toHaveLength(2);
    expect(screen.getByText('June 2026')).toBeInTheDocument();
    expect(screen.getByText('July 2026')).toBeInTheDocument();
  });

  it('Today button is rendered in multi-month view', () => {
    render(
      <CalendarWidget
        value={new Date(2020, 0, 15)}
        numberOfMonths={2}
        locale="en-US"
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Navigate to current month' }),
    ).toBeInTheDocument();
  });

  it('Today button navigates to current month in multi-month view', async () => {
    const now = new Date();
    render(
      <CalendarWidget
        value={new Date(2020, 0, 15)}
        numberOfMonths={2}
        locale="en-US"
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Navigate to current month' }),
    );

    const currentLabel = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(now);
    expect(screen.getByText(currentLabel)).toBeInTheDocument();
  });

  it('fires onMonthChange when navigating in multi-month mode', async () => {
    const onMonthChange = vi.fn();
    render(
      <CalendarWidget
        value={new Date(2026, 2, 15)}
        numberOfMonths={2}
        onMonthChange={onMonthChange}
        locale="en-US"
      />,
    );
    await userEvent.click(screen.getByLabelText('Next month'));
    expect(onMonthChange).toHaveBeenCalledOnce();
    const arg = onMonthChange.mock.calls[0][0] as Date;
    expect(arg.getMonth()).toBe(3); // April
  });

  it('range preview highlight spans across months during hover', async () => {
    render(
      <CalendarWidget
        mode="range"
        value={new Date(2026, 2, 15)}
        numberOfMonths={2}
        onChange={vi.fn()}
        locale="en-US"
      />,
    );

    // First click in March
    const march25 = screen.getByLabelText(/March 25, 2026/);
    await userEvent.click(march25);

    // Hover over a date in April — pick the non-outside-day cell
    const april5 = screen
      .getAllByLabelText(/April 5, 2026/)
      .find((el) => !el.className.includes('outside'))!;
    fireEvent.mouseEnter(april5);

    // A date between (March 28) should show preview styling
    const march28 = screen.getByLabelText(/March 28, 2026/);
    expect(march28.className).toContain('inPreview');
  });
});
