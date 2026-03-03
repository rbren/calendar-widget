import { render, screen } from '@testing-library/react';
import { CalendarGrid } from './CalendarGrid';
import { getCalendarDays } from '../utils/dates';

describe('CalendarGrid', () => {
  const weeks = getCalendarDays(2026, 3); // April 2026
  const defaultProps = {
    weeks,
    viewDate: new Date(2026, 3, 1),
    weekStartsOn: 0 as const,
    onSelectDate: vi.fn(),
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
});
