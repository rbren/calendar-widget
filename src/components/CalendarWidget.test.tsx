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
    render(
      <CalendarWidget
        mode="range"
        value={rangeValue}
        locale="en-US"
      />,
    );

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

describe('CalendarWidget quick navigation', () => {
  it('renders heading as a button by default (quickNavigation=true)', () => {
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );
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
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );

    // Month picker should appear
    expect(screen.getByRole('grid', { name: /month picker/i })).toBeInTheDocument();
    // Day grid should be gone
    expect(screen.queryByRole('grid', { name: 'Calendar' })).not.toBeInTheDocument();
    // Header should show year
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('selects a month from month picker and returns to day grid', async () => {
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );
    // Open month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    // Click June
    await userEvent.click(screen.getByText('Jun'));

    // Back to day grid showing June
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /choose month and year, currently june 2026/i }),
    ).toBeInTheDocument();
  });

  it('opens year picker from month picker heading', async () => {
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );
    // Open month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    // Click year heading to open year picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose year/i }),
    );

    // Year picker should appear
    expect(screen.getByRole('grid', { name: /year picker/i })).toBeInTheDocument();
    // Month picker should be gone
    expect(screen.queryByRole('grid', { name: /month picker/i })).not.toBeInTheDocument();
  });

  it('selects year from year picker and returns to month picker', async () => {
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );
    // Open month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    // Open year picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose year/i }),
    );
    // Click 2020 (within the 2016-2027 range)
    await userEvent.click(screen.getByText('2020'));

    // Back to month picker for 2020
    expect(screen.getByRole('grid', { name: /month picker, 2020/i })).toBeInTheDocument();
  });

  it('full flow: heading → month picker → year picker → select year → select month → day grid', async () => {
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );

    // Day grid visible
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();

    // 1. Click heading → month picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    expect(screen.getByRole('grid', { name: /month picker/i })).toBeInTheDocument();

    // 2. Click year label → year picker
    await userEvent.click(
      screen.getByRole('button', { name: /choose year/i }),
    );
    expect(screen.getByRole('grid', { name: /year picker/i })).toBeInTheDocument();

    // 3. Select year 2022 (within the 2016-2027 range)
    await userEvent.click(screen.getByText('2022'));
    expect(screen.getByRole('grid', { name: /month picker, 2022/i })).toBeInTheDocument();

    // 4. Select August
    await userEvent.click(screen.getByText('Aug'));

    // 5. Back to day grid showing August 2022
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /currently august 2022/i }),
    ).toBeInTheDocument();
  });

  it('Escape in month picker returns to day grid', async () => {
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    expect(screen.getByRole('grid', { name: /month picker/i })).toBeInTheDocument();

    // Press Escape
    const grid = screen.getByRole('grid', { name: /month picker/i });
    const cell = grid.querySelector('td[tabindex="0"]')!;
    fireEvent.keyDown(cell, { key: 'Escape' });

    // Back to day grid
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument();
  });

  it('Escape in year picker returns to month picker', async () => {
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: /choose year/i }),
    );
    expect(screen.getByRole('grid', { name: /year picker/i })).toBeInTheDocument();

    // Press Escape
    const grid = screen.getByRole('grid', { name: /year picker/i });
    const cell = grid.querySelector('td[tabindex="0"]')!;
    fireEvent.keyDown(cell, { key: 'Escape' });

    // Back to month picker
    expect(screen.getByRole('grid', { name: /month picker/i })).toBeInTheDocument();
  });

  it('prev/next arrows change year in month picker view', async () => {
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    expect(screen.getByText('2026')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByText('2025')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('prev/next arrows change year range in year picker view', async () => {
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: /choose year/i }),
    );

    // Year range should include 2026: 2016-2027
    expect(screen.getByText('2016')).toBeInTheDocument();
    expect(screen.getByText('2027')).toBeInTheDocument();

    // Click next to go to 2028-2039
    await userEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByText('2028')).toBeInTheDocument();
    expect(screen.getByText('2039')).toBeInTheDocument();

    // Click prev to go back
    await userEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByText('2016')).toBeInTheDocument();
  });

  it('keyboard Enter on heading opens month picker', async () => {
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );
    const btn = screen.getByRole('button', { name: /choose month and year/i });
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('grid', { name: /month picker/i })).toBeInTheDocument();
  });

  it('heading in year picker view is not clickable (no further drill-up)', async () => {
    render(
      <CalendarWidget value={new Date(2026, 2, 15)} locale="en-US" />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: /choose month and year/i }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: /choose year/i }),
    );

    // Year range label should not be a button
    expect(
      screen.queryByRole('button', { name: /choose/i }),
    ).not.toBeInTheDocument();
  });
});
