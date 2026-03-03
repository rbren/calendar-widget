---
tag: pm
state: open
---

# 0038 — Date Picker Input with Popover

## Problem

The `CalendarWidget` is a standalone calendar grid, but the overwhelmingly common use case is a form field: an `<input>` that opens a calendar dropdown/popover on click or focus. Without a first-class `DatePicker` component, every consumer must independently build:

- A trigger input that displays the formatted selected date.
- A popover/dropdown container with correct positioning.
- Open/close state management (click-outside-to-close, Escape to close).
- Coordination between typed input and calendar selection.
- ARIA `combobox` or `dialog` patterns for accessibility.

This is the #1 integration pattern for any calendar library. Every major competitor (`react-datepicker`, `react-day-picker`, MUI DatePicker, Ant Design DatePicker) ships a combined input+calendar component.

## Requirements

### New `DatePicker` component

```tsx
import { DatePicker } from '@calendar-widget/core';

<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Select a date"
  format="MM/dd/yyyy"
/>
```

### Props

```ts
interface DatePickerProps extends CalendarWidgetProps {
  /** Placeholder text for the input when no date is selected. */
  placeholder?: string;
  /** Date format string for display in the input (default: locale-aware short date).
   *  Uses Intl.DateTimeFormat options or a simple format string. */
  format?: Intl.DateTimeFormatOptions | string;
  /** Whether the input is read-only (calendar only, no typing). Default: false. */
  readOnly?: boolean;
  /** Whether the picker is disabled entirely. */
  disabled?: boolean;
  /** Whether the popover is currently open (controlled). */
  open?: boolean;
  /** Called when the popover open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Popover placement relative to the input. Default: 'bottom-start'. */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** Name attribute for the input (form submission). */
  name?: string;
  /** Whether to close the popover after a date is selected. Default: true. */
  closeOnSelect?: boolean;
  /** Additional class name for the input element. */
  inputClassName?: string;
  /** Additional class name for the popover container. */
  popoverClassName?: string;
}
```

### Behavior

1. **Click or focus on the input** → popover opens with the `CalendarWidget`.
2. **Select a date in the calendar** → input updates to show the formatted date, `onChange` fires, popover closes (if `closeOnSelect` is true).
3. **Type in the input** (when not `readOnly`) → attempt to parse the typed date. If valid, the calendar navigates to and selects that date. If invalid, show a visual error state.
4. **Click outside** the popover → popover closes without changing the selection.
5. **Press Escape** → popover closes, focus returns to the input.
6. **Press Enter on the input** → popover opens (if closed) or confirms and closes (if open with a focused date).
7. **Tab from the input** → popover closes, focus moves to the next focusable element.

### Popover positioning

- The popover should position itself relative to the input, respecting viewport boundaries (flip to top if there's no room below).
- Use CSS-only positioning if possible (CSS anchor positioning or `position: absolute` with JS-based flip logic).
- The popover should not cause page scroll or overflow.

### Date formatting in the input

- Default: use `Intl.DateTimeFormat` with the `locale` prop for locale-aware formatting.
- When `format` is an `Intl.DateTimeFormatOptions` object, use it directly.
- When `format` is a string like `"MM/dd/yyyy"`, implement a basic format function (not a full date-fns dependency).

### Range mode

When `mode="range"`, the input should display `"Mar 1, 2026 – Mar 15, 2026"` and `closeOnSelect` should default to `false` (since range selection requires two clicks). The popover closes after the second click completes the range.

### Accessibility

Follow the [WAI-ARIA Combobox Date Picker pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/):

- Input: `role="combobox"`, `aria-expanded="true/false"`, `aria-haspopup="dialog"`, `aria-controls="popover-id"`.
- Popover: `role="dialog"`, `aria-label="Choose date"`, `aria-modal="false"` (non-modal to allow interaction with the page).
- When the popover opens, focus moves into the calendar grid.
- When the popover closes, focus returns to the input.
- Screen reader announces: "Choose date, dialog" when opened.

### Clear button

When a date is selected and the input is not disabled/readOnly, show a small "×" clear button inside the input that resets the value to `null` and fires `onChange(null)`.

## Verification

- Render `<DatePicker />` → shows an input. Click it → calendar popover appears below.
- Select a date → input shows formatted date, popover closes.
- Type a valid date string → calendar navigates to that date.
- Type an invalid string → input shows error styling.
- Click outside → popover closes.
- Press Escape → popover closes, focus returns to input.
- `disabled={true}` → input is disabled, no popover on click.
- `readOnly={true}` → input is not editable, but calendar opens on click.
- `placement="top-start"` → popover appears above the input.
- `closeOnSelect={false}` → popover stays open after selection.
- `mode="range"` → input shows range text, popover stays open until range is complete.
- Clear button: click "×" → value resets, `onChange(null)` fires.
- Keyboard: Tab to input → Enter opens popover → arrow keys navigate → Enter selects → popover closes, focus on input.
- Screen reader: announces combobox role, expanded state, dialog label.
- Unit tests cover: open/close behavior, date selection flow, typing and parsing, clear button, keyboard flow, Escape handling, click-outside, controlled `open` prop, range mode display, accessibility attributes, placement prop, disabled/readOnly states.
