import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarGrid } from './CalendarGrid';
import { getCalendarDays } from '../utils/dates';

describe('CalendarGrid', () => {
  const weeks = getCalendarDays(2026, 3); // April 2026
  const defaultProps = {
    weeks,
    viewDate: new Date(2026, 3, 1),
    weekStartsOn: 0 as const,
    focusedDate: new Date(2026, 3, 15),
    onSelectDate: vi.fn(),
    onFocusDate: vi.fn(),
  };

  it('renders a grid with role="grid"', () => {
    render(<CalendarGrid {...defaultProps} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders 7 weekday column headers', () => {
    render(<CalendarGrid {...defaultProps} />);
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
  });

  it('renders 42 day cells (6 rows × 7 cols)', () => {
    render(<CalendarGrid {...defaultProps} />);
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
  });

  it('shows day 1 of the month', () => {
    render(<CalendarGrid {...defaultProps} />);
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(1);
  });

  it('marks selected date', () => {
    render(
      <CalendarGrid {...defaultProps} value={new Date(2026, 3, 15)} />,
    );
    const cells = screen.getAllByRole('gridcell');
    const selectedCells = cells.filter(
      (c) => c.getAttribute('aria-selected') === 'true',
    );
    expect(selectedCells).toHaveLength(1);
  });

  it('disables dates outside min/max range', () => {
    render(
      <CalendarGrid
        {...defaultProps}
        minDate={new Date(2026, 3, 10)}
        maxDate={new Date(2026, 3, 20)}
      />,
    );
    const cells = screen.getAllByRole('gridcell');
    const disabledCells = cells.filter(
      (c) => c.getAttribute('aria-disabled') === 'true',
    );
    expect(disabledCells.length).toBeGreaterThan(0);
  });

  it('sets only the focused date cell to tabIndex=0', () => {
    render(<CalendarGrid {...defaultProps} />);
    const cells = screen.getAllByRole('gridcell');
    const tabbable = cells.filter((c) => c.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveTextContent('15');
  });

  it('moves focus right on ArrowRight', async () => {
    const onFocusDate = vi.fn();
    render(<CalendarGrid {...defaultProps} onFocusDate={onFocusDate} />);
    const cell = screen.getAllByRole('gridcell').find(
      (c) => c.getAttribute('tabindex') === '0',
    )!;
    cell.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onFocusDate).toHaveBeenCalledOnce();
    expect(onFocusDate.mock.calls[0][0].getDate()).toBe(16);
  });

  it('moves focus left on ArrowLeft', async () => {
    const onFocusDate = vi.fn();
    render(<CalendarGrid {...defaultProps} onFocusDate={onFocusDate} />);
    const cell = screen.getAllByRole('gridcell').find(
      (c) => c.getAttribute('tabindex') === '0',
    )!;
    cell.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onFocusDate).toHaveBeenCalledOnce();
    expect(onFocusDate.mock.calls[0][0].getDate()).toBe(14);
  });

  it('moves focus down on ArrowDown', async () => {
    const onFocusDate = vi.fn();
    render(<CalendarGrid {...defaultProps} onFocusDate={onFocusDate} />);
    const cell = screen.getAllByRole('gridcell').find(
      (c) => c.getAttribute('tabindex') === '0',
    )!;
    cell.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(onFocusDate).toHaveBeenCalledOnce();
    expect(onFocusDate.mock.calls[0][0].getDate()).toBe(22);
  });

  it('moves focus up on ArrowUp', async () => {
    const onFocusDate = vi.fn();
    render(<CalendarGrid {...defaultProps} onFocusDate={onFocusDate} />);
    const cell = screen.getAllByRole('gridcell').find(
      (c) => c.getAttribute('tabindex') === '0',
    )!;
    cell.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(onFocusDate).toHaveBeenCalledOnce();
    expect(onFocusDate.mock.calls[0][0].getDate()).toBe(8);
  });

  it('moves focus to first day of week on Home', async () => {
    const onFocusDate = vi.fn();
    // April 15 2026 is a Wednesday, weekStartsOn=0 → first day of week is Sun Apr 12
    render(<CalendarGrid {...defaultProps} onFocusDate={onFocusDate} />);
    const cell = screen.getAllByRole('gridcell').find(
      (c) => c.getAttribute('tabindex') === '0',
    )!;
    cell.focus();
    await userEvent.keyboard('{Home}');
    expect(onFocusDate).toHaveBeenCalledOnce();
    expect(onFocusDate.mock.calls[0][0].getDate()).toBe(12);
  });

  it('moves focus to last day of week on End', async () => {
    const onFocusDate = vi.fn();
    // April 15 2026 is a Wednesday, weekStartsOn=0 → last day of week is Sat Apr 18
    render(<CalendarGrid {...defaultProps} onFocusDate={onFocusDate} />);
    const cell = screen.getAllByRole('gridcell').find(
      (c) => c.getAttribute('tabindex') === '0',
    )!;
    cell.focus();
    await userEvent.keyboard('{End}');
    expect(onFocusDate).toHaveBeenCalledOnce();
    expect(onFocusDate.mock.calls[0][0].getDate()).toBe(18);
  });

  it('moves focus to next month on PageDown', async () => {
    const onFocusDate = vi.fn();
    render(<CalendarGrid {...defaultProps} onFocusDate={onFocusDate} />);
    const cell = screen.getAllByRole('gridcell').find(
      (c) => c.getAttribute('tabindex') === '0',
    )!;
    cell.focus();
    await userEvent.keyboard('{PageDown}');
    expect(onFocusDate).toHaveBeenCalledOnce();
    const focused = onFocusDate.mock.calls[0][0];
    expect(focused.getMonth()).toBe(4); // May
    expect(focused.getDate()).toBe(15);
  });

  it('moves focus to previous month on PageUp', async () => {
    const onFocusDate = vi.fn();
    render(<CalendarGrid {...defaultProps} onFocusDate={onFocusDate} />);
    const cell = screen.getAllByRole('gridcell').find(
      (c) => c.getAttribute('tabindex') === '0',
    )!;
    cell.focus();
    await userEvent.keyboard('{PageUp}');
    expect(onFocusDate).toHaveBeenCalledOnce();
    const focused = onFocusDate.mock.calls[0][0];
    expect(focused.getMonth()).toBe(2); // March
    expect(focused.getDate()).toBe(15);
  });

  it('applies role="row" to header and body rows', () => {
    render(<CalendarGrid {...defaultProps} />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 6 body rows
    expect(rows).toHaveLength(7);
  });
});
