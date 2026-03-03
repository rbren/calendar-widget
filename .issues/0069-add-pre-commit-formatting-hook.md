---
tag: architecture
state: open
---

# 0069 — Add Pre-Commit Hook for Formatting Enforcement

## Problem

Issue 0058 documented a CI failure on `main` caused by unformatted source files. The fix (commit `167c59f`) ran `npm run format` to fix the files, but no prevention mechanism was added. The same failure will recur whenever a contributor forgets to run `npm run format` before committing.

The current workflow relies entirely on CI to catch formatting issues **after** they are pushed. This means:

1. Bad formatting lands on `main` if pushed directly (no branch protection).
2. Contributors discover formatting failures only after waiting for CI, adding friction.
3. If `fail-fast: true` is set in the CI matrix, a formatting failure cancels all other checks (tests, typecheck, lint), hiding real issues.

## Fix

Install `husky` and `lint-staged` to run Prettier on staged files before every commit:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Configure the pre-commit hook (`.husky/pre-commit`):

```bash
npx lint-staged
```

Add `lint-staged` configuration to `package.json`:

```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx,css,json}": ["prettier --write"]
  }
}
```

This ensures that any staged file in `src/` is formatted before the commit is created. It runs only on staged files, so it's fast (~1s for typical changesets).

### Alternative: `lefthook`

If the team prefers a lighter dependency, `lefthook` is a single-binary alternative to `husky` + `lint-staged`:

```bash
npm install --save-dev lefthook
```

Add `lefthook.yml`:

```yaml
pre-commit:
  commands:
    format:
      glob: "src/**/*.{ts,tsx,css,json}"
      run: npx prettier --write {staged_files} && git add {staged_files}
```

## Verification

1. Modify a source file to violate Prettier formatting (e.g., add extra spaces).
2. `git add` and `git commit` — the pre-commit hook should auto-format the file.
3. The committed file matches `npm run format:check` output.
4. `npm run format:check` exits 0 after the commit.
5. CI pipeline remains green.
