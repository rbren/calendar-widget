---
tag: architecture
state: review
---

# 0058 — CI Broken: Formatting Violations on Main Branch

## Problem

The CI pipeline on the `main` branch is **failing** on every push. The `format:check` step (`npm run format:check`) exits with code 1 because multiple source files do not conform to the project's Prettier configuration (`.prettierrc` with `printWidth: 80`).

As of commit `a87c45d`, the GitHub Actions run (ID `22639793211`) shows:

- **Node 22 job**: fails at `npm run format:check`
- **Node 20 job**: cancelled (due to `fail-fast: true` matrix default)

The affected files are:

| File | Issue |
|------|-------|
| `src/components/CalendarGrid.tsx` | Object literals in `getRangeFlags` exceed print width; Prettier wants to break them across multiple lines |
| `src/components/CalendarWidget.test.tsx` | JSX in `render()` call exceeds print width; Prettier wants multi-line formatting |
| `src/hooks/useCalendarState.ts` | Ternary and boolean expressions exceed print width |
| `src/utils/dates.test.ts` | `expect(...)` chains with long arguments exceed print width |

These files were modified in recent commits (issues 0055, 0056) and were not run through `npm run format` before committing.

## Impact

- **All CI runs on main are red.** No PR can be verified as green because the base branch itself is broken.
- **Developer trust in CI erodes.** If main is always red, contributors ignore CI failures, defeating the purpose of the pipeline.
- **Merging any PR is risky.** There is no passing baseline to compare against.

## Fix

Run `npm run format` to auto-fix all files, then commit the result:

```bash
npm run format
git add -A
git commit -m "fix: reformat source files to pass Prettier check (issue 0058)"
```

## Prevention

To avoid this recurring, consider one or more of:

1. **Pre-commit hook** — Add a `lint-staged` + `husky` (or `lefthook`) setup that runs `prettier --write` on staged files before every commit. This catches formatting issues at the developer's machine before they reach CI.

   ```bash
   npm install --save-dev husky lint-staged
   npx husky init
   ```

   Add to `package.json`:
   ```json
   {
     "lint-staged": {
       "src/**/*.{ts,tsx,css,json}": ["prettier --write"]
     }
   }
   ```

2. **CI auto-format step** — Instead of failing, have CI format and commit back (though this is less common and requires write permissions).

3. **Developer documentation** — Add a note to the README's Development section reminding contributors to run `npm run format` before committing.

## Verification

1. `npm run format:check` exits 0 (no formatting issues).
2. CI pipeline on main passes all steps (both Node 20 and Node 22 matrix entries).
3. `git diff` after `npm run format` shows no changes (clean working tree).
