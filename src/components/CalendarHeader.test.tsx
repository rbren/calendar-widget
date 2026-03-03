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

describe('CalendarHeader nav button aria-labels per view', () => {
  const baseProps = {
    viewDate: new Date(2026, 3, 1),
    monthYearLabel: 'April 2026',
    onPrevMonth: vi.fn(),
    onNextMonth: vi.fn(),
  };

  it('uses "Previous month" / "Next month" for days view (default)', () => {
    render(<CalendarHeader {...baseProps} />);
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
  });

  it('uses "Previous month" / "Next month" for explicit days view', () => {
    render(<CalendarHeader {...baseProps} activeView="days" />);
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
  });

  it('uses "Previous year" / "Next year" for months view', () => {
    render(<CalendarHeader {...baseProps} activeView="months" />);
    expect(screen.getByLabelText('Previous year')).toBeInTheDocument();
    expect(screen.getByLabelText('Next year')).toBeInTheDocument();
  });

  it('uses "Previous year range" / "Next year range" for years view', () => {
    render(<CalendarHeader {...baseProps} activeView="years" />);
    expect(screen.getByLabelText('Previous year range')).toBeInTheDocument();
    expect(screen.getByLabelText('Next year range')).toBeInTheDocument();
  });
});

describe('CalendarHeader Today button', () => {
  const baseProps = {
    viewDate: new Date(2026, 3, 1),
    monthYearLabel: 'April 2026',
    onPrevMonth: vi.fn(),
    onNextMonth: vi.fn(),
    onGoToToday: vi.fn(),
  };

  it('renders the Today button by default when onGoToToday is provided', () => {
    render(<CalendarHeader {...baseProps} />);
    expect(
      screen.getByRole('button', { name: 'Navigate to current month' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('does not render the Today button when showTodayButton is false', () => {
    render(<CalendarHeader {...baseProps} showTodayButton={false} />);
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('renders a custom label via todayButtonLabel', () => {
    render(<CalendarHeader {...baseProps} todayButtonLabel="Aujourd'hui" />);
    expect(screen.getByText("Aujourd'hui")).toBeInTheDocument();
  });

  it('calls onGoToToday when clicked', async () => {
    const onGoToToday = vi.fn();
    render(<CalendarHeader {...baseProps} onGoToToday={onGoToToday} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Navigate to current month' }),
    );
    expect(onGoToToday).toHaveBeenCalledOnce();
  });

  it('has aria-disabled="true" when isCurrentMonth is true', () => {
    render(<CalendarHeader {...baseProps} isCurrentMonth={true} />);
    const btn = screen.getByRole('button', {
      name: 'Navigate to current month',
    });
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not call onGoToToday when disabled (isCurrentMonth=true)', async () => {
    const onGoToToday = vi.fn();
    render(
      <CalendarHeader
        {...baseProps}
        onGoToToday={onGoToToday}
        isCurrentMonth={true}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Navigate to current month' }),
    );
    expect(onGoToToday).not.toHaveBeenCalled();
  });

  it('is keyboard accessible via Tab and Enter', async () => {
    const onGoToToday = vi.fn();
    render(<CalendarHeader {...baseProps} onGoToToday={onGoToToday} />);
    const btn = screen.getByRole('button', {
      name: 'Navigate to current month',
    });
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onGoToToday).toHaveBeenCalledOnce();
  });
});
