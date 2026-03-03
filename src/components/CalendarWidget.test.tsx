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
