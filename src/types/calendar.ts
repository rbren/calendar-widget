export interface CalendarWidgetProps {
  /** Currently selected date(s) */
  value?: Date | Date[] | null;
  /** Called when the user selects a date */
  onChange?: (date: Date) => void;
  /** Locale string for Intl formatting (default: browser default) */
  locale?: string;
  /** Earliest selectable date */
  minDate?: Date;
  /** Latest selectable date */
  maxDate?: Date;
  /** Dates that should be disabled */
  disabledDates?: Date[];
  /** Day the week starts on: 0 = Sunday, 1 = Monday (default: 0) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Additional CSS class for the root element */
  className?: string;
}

export interface CalendarHeaderProps {
  /** The date representing the currently displayed month */
  viewDate: Date;
  /** Formatted month/year string */
  monthYearLabel: string;
  /** Navigate to previous month */
  onPrevMonth: () => void;
  /** Navigate to next month */
  onNextMonth: () => void;
}

export interface CalendarGridProps {
  /** 2D array of dates for the calendar grid (6 rows × 7 cols) */
  weeks: Date[][];
  /** The date representing the currently displayed month */
  viewDate: Date;
  /** Currently selected date(s) */
  value?: Date | Date[] | null;
  /** Earliest selectable date */
  minDate?: Date;
  /** Latest selectable date */
  maxDate?: Date;
  /** Dates that should be disabled */
  disabledDates?: Date[];
  /** Locale for day name formatting */
  locale?: string;
  /** Day the week starts on */
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** The date that currently holds the roving tabIndex */
  focusedDate: Date;
  /** Called when a day is clicked */
  onSelectDate: (date: Date) => void;
  /** Called when keyboard navigation changes the focused date */
  onFocusDate: (date: Date) => void;
}

export interface CalendarDayCellProps {
  /** The date this cell represents */
  date: Date;
  /** Whether this date is in the currently displayed month */
  isCurrentMonth: boolean;
  /** Whether this date is today */
  isToday: boolean;
  /** Whether this date is selected */
  isSelected: boolean;
  /** Whether this date is disabled */
  isDisabled: boolean;
  /** Whether this cell has the roving tabIndex focus */
  isFocusTarget: boolean;
  /** Called when this day is clicked */
  onSelect: (date: Date) => void;
}
