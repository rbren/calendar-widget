import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarWidget } from './CalendarWidget';

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

  it('applies custom className', () => {
    const { container } = render(<CalendarWidget className="my-cal" />);
    expect(container.querySelector('.cw-root.my-cal')).toBeInTheDocument();
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
