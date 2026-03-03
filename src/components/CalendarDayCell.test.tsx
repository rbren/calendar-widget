import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarDayCell } from './CalendarDayCell';
import type { CalendarDayCellProps } from '../types/calendar';
import styles from './CalendarDayCell.module.css';

const defaultProps: CalendarDayCellProps = {
  date: new Date(2026, 3, 15),
  isCurrentMonth: true,
  isToday: false,
  isSelected: false,
  isDisabled: false,
  isFocusTarget: false,
  onSelect: vi.fn(),
  locale: 'en-US',
};

function renderCell(overrides: Partial<CalendarDayCellProps> = {}) {
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
    expect(screen.getByRole('gridcell')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('has aria-disabled when disabled', () => {
    renderCell({ isDisabled: true });
    expect(screen.getByRole('gridcell')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('applies today class', () => {
    renderCell({ isToday: true });
    expect(screen.getByRole('gridcell')).toHaveClass(styles.today);
  });

  it('applies outside class for non-current month', () => {
    renderCell({ isCurrentMonth: false });
    expect(screen.getByRole('gridcell')).toHaveClass(styles.outside);
  });

  it('sets aria-current="date" on today', () => {
    renderCell({ isToday: true });
    expect(screen.getByRole('gridcell')).toHaveAttribute(
      'aria-current',
      'date',
    );
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

  describe('aria-label', () => {
    it('has an aria-label with the full date', () => {
      renderCell();
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveAttribute('aria-label', 'Wednesday, April 15, 2026');
    });

    it('includes (today) in aria-label when isToday', () => {
      renderCell({ isToday: true });
      const cell = screen.getByRole('gridcell');
      expect(cell.getAttribute('aria-label')).toContain('(today)');
    });

    it('includes (selected) in aria-label when isSelected', () => {
      renderCell({ isSelected: true });
      const cell = screen.getByRole('gridcell');
      expect(cell.getAttribute('aria-label')).toContain('(selected)');
    });

    it('includes (unavailable) in aria-label when isDisabled', () => {
      renderCell({ isDisabled: true });
      const cell = screen.getByRole('gridcell');
      expect(cell.getAttribute('aria-label')).toContain('(unavailable)');
    });

    it('combines multiple statuses in aria-label', () => {
      renderCell({ isToday: true, isSelected: true });
      const cell = screen.getByRole('gridcell');
      expect(cell.getAttribute('aria-label')).toContain('(today, selected)');
    });

    it('includes marker label in aria-label', () => {
      renderCell({ markerLabel: 'Team standup' });
      const cell = screen.getByRole('gridcell');
      expect(cell.getAttribute('aria-label')).toContain('Team standup');
    });

    it('formats aria-label using the provided locale', () => {
      renderCell({ locale: 'de-DE' });
      const cell = screen.getByRole('gridcell');
      const label = cell.getAttribute('aria-label')!;
      expect(label).toContain('Mittwoch');
      expect(label).toContain('April');
      expect(label).toContain('2026');
    });
  });

  describe('renderDay', () => {
    it('renders default content when renderDay is not provided', () => {
      renderCell();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('renders custom content from renderDay', () => {
      renderCell({
        renderDay: (dayNumber) => (
          <div>
            {dayNumber}
            <span data-testid="custom-badge">🔴</span>
          </div>
        ),
      });
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    });

    it('wraps day number in custom element', () => {
      renderCell({
        renderDay: (dayNumber) => <strong>{dayNumber}</strong>,
      });
      const strong = screen.getByText('15').closest('strong');
      expect(strong).toBeInTheDocument();
    });

    it('can completely replace default content', () => {
      renderCell({
        renderDay: () => <span data-testid="replacement">Custom</span>,
      });
      expect(screen.getByTestId('replacement')).toBeInTheDocument();
      expect(screen.queryByText('15')).not.toBeInTheDocument();
    });

    it('passes correct context info to renderDay', () => {
      const renderDay = vi.fn((dayNumber: React.ReactNode) => dayNumber);
      renderCell({
        isCurrentMonth: true,
        isToday: true,
        isSelected: true,
        isDisabled: false,
        isInRange: true,
        renderDay,
      });
      expect(renderDay).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          date: defaultProps.date,
          isCurrentMonth: true,
          isToday: true,
          isSelected: true,
          isDisabled: false,
          isInRange: true,
        }),
      );
    });

    it('passes isDisabled=true in context when date is disabled', () => {
      const renderDay = vi.fn((dayNumber: React.ReactNode) => dayNumber);
      renderCell({ isDisabled: true, renderDay });
      expect(renderDay).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ isDisabled: true }),
      );
    });

    it('preserves ARIA attributes when renderDay is used', () => {
      renderCell({
        isSelected: true,
        isToday: true,
        isDisabled: false,
        isFocusTarget: true,
        renderDay: (dayNumber) => <strong>{dayNumber}</strong>,
      });
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveAttribute('aria-selected', 'true');
      expect(cell).toHaveAttribute('aria-current', 'date');
      expect(cell).toHaveAttribute('tabindex', '0');
      expect(cell).toHaveAttribute('aria-label');
    });

    it('preserves keyboard navigation with renderDay', async () => {
      const onSelect = vi.fn();
      renderCell({
        onSelect,
        isFocusTarget: true,
        renderDay: (dayNumber) => <strong>{dayNumber}</strong>,
      });
      const cell = screen.getByRole('gridcell');
      cell.focus();
      await userEvent.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledWith(defaultProps.date);
    });

    it('preserves click handler with renderDay', async () => {
      const onSelect = vi.fn();
      renderCell({
        onSelect,
        renderDay: (dayNumber) => (
          <div>
            {dayNumber}
            <span>extra</span>
          </div>
        ),
      });
      await userEvent.click(screen.getByText('15'));
      expect(onSelect).toHaveBeenCalledWith(defaultProps.date);
    });
  });
});
