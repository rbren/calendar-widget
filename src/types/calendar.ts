export interface DateRange {
  start: Date;
  end: Date;
}

export type CalendarView = 'days' | 'months' | 'years';

export interface CalendarWidgetProps {
  /** Selection mode: pick one date, or a start–end range (default: 'single') */
  mode?: 'single' | 'range';
  /** Currently selected date(s) */
  value?: Date | DateRange | Date[] | null;
  /** Called when the user selects a date or range */
  onChange?: (value: Date | DateRange | null) => void;
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
  /** Set to false to disable the drill-up month/year picker (default: true) */
  quickNavigation?: boolean;
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
  /** Current drill-up view */
  activeView?: CalendarView;
  /** Whether the heading is clickable for quick navigation */
  quickNavigation?: boolean;
  /** Called when the heading is clicked to drill up */
  onDrillUp?: () => void;
  /** Accessible label for the heading button */
  headingAriaLabel?: string;
}

export interface MonthPickerProps {
  /** The year being displayed */
  year: number;
  /** Currently viewed month (0-11) for highlight */
  currentMonth: number;
  /** Currently viewed year for highlight */
  currentYear: number;
  /** Locale for month name formatting */
  locale?: string;
  /** Called when a month is selected */
  onSelectMonth: (month: number) => void;
  /** Called when Escape is pressed */
  onCancel: () => void;
  /** Called when user clicks on the year label to drill up */
  onDrillUp?: () => void;
}

export interface YearPickerProps {
  /** The start year of the 12-year range */
  rangeStart: number;
  /** Currently viewed year for highlight */
  currentYear: number;
  /** Called when a year is selected */
  onSelectYear: (year: number) => void;
  /** Called when Escape is pressed */
  onCancel: () => void;
}

export interface CalendarGridProps {
  /** 2D array of dates for the calendar grid (6 rows × 7 cols) */
  weeks: Date[][];
  /** The date representing the currently displayed month */
  viewDate: Date;
  /** Currently selected date(s) */
  value?: Date | DateRange | Date[] | null;
  /** Selection mode */
  mode?: 'single' | 'range';
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
  /** The pending start date during range selection (before second click) */
  rangeStart?: Date | null;
  /** The hovered date during range selection preview */
  hoveredDate?: Date | null;
  /** Called when a day is clicked */
  onSelectDate: (date: Date) => void;
  /** Called when keyboard navigation changes the focused date */
  onFocusDate: (date: Date) => void;
  /** Called when a day is hovered (for range preview) */
  onHoverDate?: (date: Date | null) => void;
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
  /** Whether this date is the start of a selected range */
  isRangeStart?: boolean;
  /** Whether this date is the end of a selected range */
  isRangeEnd?: boolean;
  /** Whether this date falls within a selected range (not start/end) */
  isInRange?: boolean;
  /** Whether this date falls within the preview range (hover) */
  isInPreview?: boolean;
  /** Whether this date is the start of the preview range */
  isPreviewStart?: boolean;
  /** Whether this date is the end of the preview range */
  isPreviewEnd?: boolean;
  /** Called when this day is clicked */
  onSelect: (date: Date) => void;
  /** Called when this day is hovered */
  onHover?: (date: Date | null) => void;
  /** Locale for formatting the accessible date label */
  locale?: string;
  /** Optional marker/event label to include in the accessible name */
  markerLabel?: string;
}
