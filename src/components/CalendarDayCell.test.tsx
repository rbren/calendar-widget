import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarDayCell } from './CalendarDayCell';

const defaultProps = {
  date: new Date(2026, 3, 15),
  isCurrentMonth: true,
  isToday: false,
  isSelected: false,
  isDisabled: false,
  isFocusTarget: false,
  onSelect: vi.fn(),
};

function renderCell(overrides: Partial<typeof defaultProps> = {}) {
  return render(
    <table>
      <tbody>
        <tr>
          <CalendarDayCell {...defaultProps} {...overrides} />
        </tr>
      </tbody>
    </table>,
  );
}

describe('CalendarDayCell', () => {
  it('renders the day number', () => {
    renderCell();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    renderCell({ onSelect });
    await userEvent.click(screen.getByText('15'));
    expect(onSelect).toHaveBeenCalledWith(defaultProps.date);
  });

  it('does not call onSelect when disabled', async () => {
    const onSelect = vi.fn();
    renderCell({ onSelect, isDisabled: true });
    await userEvent.click(screen.getByText('15'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('has aria-selected when selected', () => {
    renderCell({ isSelected: true });
    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-selected', 'true');
  });

  it('has aria-disabled when disabled', () => {
    renderCell({ isDisabled: true });
    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies today class', () => {
    renderCell({ isToday: true });
    expect(screen.getByRole('gridcell')).toHaveClass('cw-day-cell--today');
  });

  it('applies outside class for non-current month', () => {
    renderCell({ isCurrentMonth: false });
    expect(screen.getByRole('gridcell')).toHaveClass('cw-day-cell--outside');
  });

  it('sets aria-current="date" on today', () => {
    renderCell({ isToday: true });
    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-current', 'date');
  });

  it('does not set aria-current when not today', () => {
    renderCell({ isToday: false });
    expect(screen.getByRole('gridcell')).not.toHaveAttribute('aria-current');
  });

  it('has tabIndex=0 when isFocusTarget is true', () => {
    renderCell({ isFocusTarget: true });
    expect(screen.getByRole('gridcell')).toHaveAttribute('tabindex', '0');
  });

  it('has tabIndex=-1 when isFocusTarget is false', () => {
    renderCell({ isFocusTarget: false });
    expect(screen.getByRole('gridcell')).toHaveAttribute('tabindex', '-1');
  });

  it('selects date on Enter key', async () => {
    const onSelect = vi.fn();
    renderCell({ onSelect, isFocusTarget: true });
    const cell = screen.getByRole('gridcell');
    cell.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(defaultProps.date);
  });

  it('selects date on Space key', async () => {
    const onSelect = vi.fn();
    renderCell({ onSelect, isFocusTarget: true });
    const cell = screen.getByRole('gridcell');
    cell.focus();
    await userEvent.keyboard(' ');
    expect(onSelect).toHaveBeenCalledWith(defaultProps.date);
  });

  it('does not select disabled date on Enter key', async () => {
    const onSelect = vi.fn();
    renderCell({ onSelect, isDisabled: true, isFocusTarget: true });
    const cell = screen.getByRole('gridcell');
    cell.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).not.toHaveBeenCalled();
  });
});
