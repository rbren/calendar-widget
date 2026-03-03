import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YearPicker } from './YearPicker';

describe('YearPicker', () => {
  const defaultProps = {
    rangeStart: 2024,
    currentYear: 2026,
    onSelectYear: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a 4×3 grid of 12 years', () => {
    render(<YearPicker {...defaultProps} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(12);
    expect(cells[0]).toHaveTextContent('2024');
    expect(cells[11]).toHaveTextContent('2035');
  });

  it('has aria-label with year range on the grid', () => {
    render(<YearPicker {...defaultProps} />);
    expect(screen.getByRole('grid')).toHaveAttribute(
      'aria-label',
      'Year picker, 2024\u20132035',
    );
  });

  it('highlights the current year with aria-selected', () => {
    render(<YearPicker {...defaultProps} />);
    const cells = screen.getAllByRole('gridcell');
    // 2026 is at index 2 (2024, 2025, 2026)
    expect(cells[2]).toHaveAttribute('aria-selected', 'true');
    expect(cells[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelectYear when a year is clicked', async () => {
    const onSelectYear = vi.fn();
    render(<YearPicker {...defaultProps} onSelectYear={onSelectYear} />);
    await userEvent.click(screen.getByText('2030'));
    expect(onSelectYear).toHaveBeenCalledWith(2030);
  });

  it('navigates with arrow keys', () => {
    render(<YearPicker {...defaultProps} />);
    const cells = screen.getAllByRole('gridcell');
    // Initial focus should be on 2026 (index 2)
    expect(cells[2]).toHaveAttribute('tabindex', '0');

    // ArrowRight → 2027
    fireEvent.keyDown(cells[2], { key: 'ArrowRight' });
    expect(cells[3]).toHaveAttribute('tabindex', '0');

    // ArrowDown → 2031 (2027 + 4)
    fireEvent.keyDown(cells[3], { key: 'ArrowDown' });
    expect(cells[7]).toHaveAttribute('tabindex', '0');

    // ArrowLeft → 2030
    fireEvent.keyDown(cells[7], { key: 'ArrowLeft' });
    expect(cells[6]).toHaveAttribute('tabindex', '0');

    // ArrowUp → 2026 (2030 - 4)
    fireEvent.keyDown(cells[6], { key: 'ArrowUp' });
    expect(cells[2]).toHaveAttribute('tabindex', '0');
  });

  it('selects focused year on Enter', () => {
    const onSelectYear = vi.fn();
    render(<YearPicker {...defaultProps} onSelectYear={onSelectYear} />);
    const cells = screen.getAllByRole('gridcell');

    // Move to 2027
    fireEvent.keyDown(cells[2], { key: 'ArrowRight' });
    // Press Enter
    fireEvent.keyDown(cells[3], { key: 'Enter' });
    expect(onSelectYear).toHaveBeenCalledWith(2027);
  });

  it('selects focused year on Space', () => {
    const onSelectYear = vi.fn();
    render(<YearPicker {...defaultProps} onSelectYear={onSelectYear} />);
    const cells = screen.getAllByRole('gridcell');

    fireEvent.keyDown(cells[2], { key: ' ' });
    expect(onSelectYear).toHaveBeenCalledWith(2026);
  });

  it('calls onCancel on Escape', () => {
    const onCancel = vi.fn();
    render(<YearPicker {...defaultProps} onCancel={onCancel} />);
    const cells = screen.getAllByRole('gridcell');

    fireEvent.keyDown(cells[2], { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does not go below 0 when pressing ArrowLeft at first year', () => {
    render(<YearPicker {...defaultProps} currentYear={2024} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells[0]).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(cells[0], { key: 'ArrowLeft' });
    expect(cells[0]).toHaveAttribute('tabindex', '0');
  });

  it('does not exceed 11 when pressing ArrowRight at last year', () => {
    render(<YearPicker {...defaultProps} currentYear={2035} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells[11]).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(cells[11], { key: 'ArrowRight' });
    expect(cells[11]).toHaveAttribute('tabindex', '0');
  });

  it('focuses first cell when currentYear is outside range', () => {
    render(<YearPicker {...defaultProps} currentYear={2000} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells[0]).toHaveAttribute('tabindex', '0');
  });
});
