import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarHeader } from './CalendarHeader';

describe('CalendarHeader', () => {
  const defaultProps = {
    viewDate: new Date(2026, 3, 1),
    monthYearLabel: 'April 2026',
    onPrevMonth: vi.fn(),
    onNextMonth: vi.fn(),
  };

  it('displays the month/year label', () => {
    render(<CalendarHeader {...defaultProps} />);
    expect(screen.getByText('April 2026')).toBeInTheDocument();
  });

  it('calls onPrevMonth when previous button is clicked', async () => {
    const onPrevMonth = vi.fn();
    render(<CalendarHeader {...defaultProps} onPrevMonth={onPrevMonth} />);
    await userEvent.click(screen.getByLabelText('Previous month'));
    expect(onPrevMonth).toHaveBeenCalledOnce();
  });

  it('calls onNextMonth when next button is clicked', async () => {
    const onNextMonth = vi.fn();
    render(<CalendarHeader {...defaultProps} onNextMonth={onNextMonth} />);
    await userEvent.click(screen.getByLabelText('Next month'));
    expect(onNextMonth).toHaveBeenCalledOnce();
  });

  it('has aria-live="polite" on the month/year label', () => {
    render(<CalendarHeader {...defaultProps} />);
    const label = screen.getByText('April 2026');
    expect(label).toHaveAttribute('aria-live', 'polite');
  });
});
