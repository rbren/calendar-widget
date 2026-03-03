---
tag: architecture
state: closed
---

# 0059 — Duplicate Issue Number 0048

## Problem

Two different issues share the number `0048`:

- `0048-accessible-day-cell-labels.md` (tag: pm, state: review)
- `0048-sideeffects-field-blocks-css-imports.md` (tag: architecture, state: closed)

This breaks the assumption that issue numbers are unique identifiers. It causes ambiguity when commit messages or other issues reference "issue 0048" — it is unclear which issue is meant.

The root cause is that both issues were likely created in the same batch without checking for collisions.

## Fix

Renumber `0048-sideeffects-field-blocks-css-imports.md` to the next available number at the time of its creation. Since it was created alongside issues in the 0045–0048 range and is already closed, the simplest fix is to rename it to an unused number. Check all commit messages and issue cross-references that mention "0048" and update them if they refer to the sideEffects issue.

Suggested rename: `0048-sideeffects-field-blocks-css-imports.md` → `0060-sideeffects-field-blocks-css-imports.md` (or whichever number is next available at the time of fix).

Alternatively, adopt a policy: before creating a new issue file, always check for existing files with the same number prefix. A simple shell check:

```bash
ls .issues/00XX-* 2>/dev/null
```

## Verification

1. `ls .issues/ | cut -d'-' -f1 | sort | uniq -d` returns no output (no duplicate prefixes).
2. Any commit messages or issue text referencing "issue 0048" are unambiguous or updated.
