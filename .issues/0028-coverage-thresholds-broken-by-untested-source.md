---
tag: architecture
state: open
---

# 0028 — Coverage Thresholds Broken by Untested Source Files

## Problem

`npm run test:coverage` currently fails:

```
ERROR: Coverage for lines (0%) does not meet global threshold (80%)
ERROR: Coverage for functions (75%) does not meet global threshold (80%)
ERROR: Coverage for statements (0%) does not meet global threshold (80%)
ERROR: Coverage for branches (75%) does not meet global threshold (80%)
```

Source files have been added to `src/components/`, `src/hooks/`, `src/utils/`, and `src/types/` without accompanying test files. The vitest coverage configuration enforces 80% thresholds across statements, branches, functions, and lines. Since none of the new production code is exercised by tests, coverage is effectively 0%.

This means:
- The `test:coverage` npm script is a broken quality gate
- Once CI is implemented (issue 0008), it will fail on every run
- The existing placeholder test in `src/utils/placeholder.test.ts` provides no real coverage

## Requirements

This is a process enforcement issue. The fix has two parts:

### 1. Tests must accompany source code

Every source file committed under `src/` (except `src/test/` and `src/types/`) must have a corresponding test file. This is already specified in issue 0005 (Core Component Architecture), but the current work-in-progress state violates it.

The following test files are needed at minimum:

| Source file | Required test file |
|---|---|
| `src/utils/dates.ts` | `src/utils/dates.test.ts` |
| `src/hooks/useCalendarState.ts` | `src/hooks/useCalendarState.test.ts` |
| `src/components/CalendarDayCell.tsx` | `src/components/CalendarDayCell.test.tsx` |
| `src/components/CalendarHeader.tsx` | `src/components/CalendarHeader.test.tsx` |

### 2. Remove the placeholder test

Once real tests exist, delete `src/utils/placeholder.test.ts`. It serves no purpose after real tests are in place and it creates a false sense of coverage.

### 3. Ensure tests pass the coverage thresholds

After writing the tests, `npm run test:coverage` must exit 0 with all thresholds met (≥80% for statements, branches, functions, and lines).

## Verification

1. `npm run test:coverage` exits 0
2. All four coverage metrics (statements, branches, functions, lines) are ≥80%
3. `src/utils/placeholder.test.ts` no longer exists
4. Every source file under `src/components/`, `src/hooks/`, and `src/utils/` has a corresponding `.test.ts` or `.test.tsx` file
