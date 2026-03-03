---
tag: architecture
state: review
---

# 0067 — Navigation Button Aria-Labels Incorrect for Drill-Up Views

## Problem

`CalendarHeader` has hardcoded `aria-label="Previous month"` and `aria-label="Next month"` on its navigation buttons (lines 23 and 46 of `CalendarHeader.tsx`). These labels are incorrect when the calendar is in month-picker or year-picker view:

| `activeView` | Button action | Announced label | Correct label |
|---|---|---|---|
| `'days'` | Previous/next month | "Previous month" / "Next month" | ✅ Correct |
| `'months'` | Previous/next **year** | "Previous month" / "Next month" | ❌ Should be "Previous year" / "Next year" |
| `'years'` | Previous/next **year range** | "Previous month" / "Next month" | ❌ Should be "Previous 12 years" / "Next 12 years" |

Screen-reader users hear "Previous month" when the button actually navigates to the previous year or year range. This violates WCAG 2.1 SC 1.3.1 (Info and Relationships) and SC 4.1.2 (Name, Role, Value).

### Root cause

`CalendarHeaderProps` defines an `activeView?: CalendarView` prop (see `types/calendar.ts` line 71), but:

1. `CalendarWidget` does **not** pass `activeView` to `CalendarHeader`.
2. `CalendarHeader` does **not** destructure or use `activeView`.
3. The aria-labels are hardcoded strings, not derived from the current view.

## Fix

### Option A — Pass `activeView` and derive labels in `CalendarHeader`

1. In `CalendarWidget.tsx`, pass `activeView` to `<CalendarHeader>`:

   ```tsx
   <CalendarHeader
     activeView={activeView}
     // ... existing props
   />
   ```

2. In `CalendarHeader.tsx`, destructure `activeView` and compute the aria-labels:

   ```tsx
   const prevLabel =
     activeView === 'years'
       ? 'Previous year range'
       : activeView === 'months'
         ? 'Previous year'
         : 'Previous month';

   const nextLabel =
     activeView === 'years'
       ? 'Next year range'
       : activeView === 'months'
         ? 'Next year'
         : 'Next month';
   ```

   Apply these to the respective `<button>` elements.

### Option B — Pass labels as props from CalendarWidget

Add `prevAriaLabel` / `nextAriaLabel` props to `CalendarHeaderProps` and compute them in `CalendarWidget` alongside `handlePrev`/`handleNext`. This avoids `CalendarHeader` needing to know about view semantics.

### Either way

- Update or add tests verifying that the navigation buttons have contextually correct `aria-label` values for each view.
- If `activeView` is not going to be used, remove it from `CalendarHeaderProps` to avoid dead interface members.

## Verification

1. Render `CalendarWidget` with `quickNavigation={true}`.
2. Click the month/year heading to enter month-picker view.
3. Inspect the previous/next buttons: they should have `aria-label="Previous year"` / `aria-label="Next year"`.
4. Drill up to year-picker view and verify `aria-label="Previous year range"` / `aria-label="Next year range"`.
5. Return to day view and verify `aria-label="Previous month"` / `aria-label="Next month"`.
6. All existing tests continue to pass.
7. New tests assert the correct aria-labels for each view.
