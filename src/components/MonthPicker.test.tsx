import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthPicker } from './MonthPicker';

describe('MonthPicker', () => {
  const defaultProps = {
    year: 2026,
    currentMonth: 2, // March
    currentYear: 2026,
    locale: 'en-US',
    onSelectMonth: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a 4×3 grid of month names', () => {
    render(<MonthPicker {...defaultProps} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(12);
    expect(cells[0]).toHaveTextContent('Jan');
    expect(cells[11]).toHaveTextContent('Dec');
  });

  it('has aria-label with year on the grid', () => {
    render(<MonthPicker {...defaultProps} />);
    expect(screen.getByRole('grid')).toHaveAttribute(
      'aria-label',
      'Month picker, 2026',
    );
  });

  it('highlights the current month with aria-selected', () => {
    render(<MonthPicker {...defaultProps} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells[2]).toHaveAttribute('aria-selected', 'true'); // March
    expect(cells[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelectMonth when a month is clicked', async () => {
    const onSelectMonth = vi.fn();
    render(<MonthPicker {...defaultProps} onSelectMonth={onSelectMonth} />);
    await userEvent.click(screen.getByText('Jun'));
    expect(onSelectMonth).toHaveBeenCalledWith(5); // June = index 5
  });

  it('navigates with arrow keys', () => {
    render(<MonthPicker {...defaultProps} />);
    const cells = screen.getAllByRole('gridcell');
    // Initial focus should be on March (index 2)
    expect(cells[2]).toHaveAttribute('tabindex', '0');

    // ArrowRight → April
    fireEvent.keyDown(cells[2], { key: 'ArrowRight' });
    expect(cells[3]).toHaveAttribute('tabindex', '0');

    // ArrowDown → August (April + 4)
    fireEvent.keyDown(cells[3], { key: 'ArrowDown' });
    expect(cells[7]).toHaveAttribute('tabindex', '0');

    // ArrowLeft → July
    fireEvent.keyDown(cells[7], { key: 'ArrowLeft' });
    expect(cells[6]).toHaveAttribute('tabindex', '0');

    // ArrowUp → March (July - 4)
    fireEvent.keyDown(cells[6], { key: 'ArrowUp' });
    expect(cells[2]).toHaveAttribute('tabindex', '0');
  });

  it('selects focused month on Enter', () => {
    const onSelectMonth = vi.fn();
    render(<MonthPicker {...defaultProps} onSelectMonth={onSelectMonth} />);
    const cells = screen.getAllByRole('gridcell');

    // Move to April
    fireEvent.keyDown(cells[2], { key: 'ArrowRight' });
    // Press Enter
    fireEvent.keyDown(cells[3], { key: 'Enter' });
    expect(onSelectMonth).toHaveBeenCalledWith(3); // April
  });

  it('selects focused month on Space', () => {
    const onSelectMonth = vi.fn();
    render(<MonthPicker {...defaultProps} onSelectMonth={onSelectMonth} />);
    const cells = screen.getAllByRole('gridcell');

    fireEvent.keyDown(cells[2], { key: ' ' });
    expect(onSelectMonth).toHaveBeenCalledWith(2); // March
  });

  it('calls onCancel on Escape', () => {
    const onCancel = vi.fn();
    render(<MonthPicker {...defaultProps} onCancel={onCancel} />);
    const cells = screen.getAllByRole('gridcell');

    fireEvent.keyDown(cells[2], { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does not go below 0 when pressing ArrowLeft at January', () => {
    render(
      <MonthPicker {...defaultProps} currentMonth={0} />,
    );
    const cells = screen.getAllByRole('gridcell');
    expect(cells[0]).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(cells[0], { key: 'ArrowLeft' });
    expect(cells[0]).toHaveAttribute('tabindex', '0');
  });

  it('does not exceed 11 when pressing ArrowRight at December', () => {
    render(
      <MonthPicker {...defaultProps} currentMonth={11} />,
    );
    const cells = screen.getAllByRole('gridcell');
    expect(cells[11]).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(cells[11], { key: 'ArrowRight' });
    expect(cells[11]).toHaveAttribute('tabindex', '0');
  });
});
