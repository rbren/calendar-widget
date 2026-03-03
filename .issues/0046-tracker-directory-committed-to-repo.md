---
tag: architecture
state: closed
---

# 0046 — `.tracker/` Directory Files Are Committed to the Repository

## Problem

Issue 0029 identifies that `.tracker/` should be added to `.gitignore`. However, it incorrectly states that `.tracker/` is an **untracked** directory. In fact, 10 files from `.tracker/` are **already tracked** in Git:

```
.tracker/index.html
.tracker/package-lock.json
.tracker/package.json
.tracker/server.js
.tracker/src/AgentPanel.jsx
.tracker/src/App.jsx
.tracker/src/IssueModal.jsx
.tracker/src/KanbanBoard.jsx
.tracker/src/main.jsx
.tracker/vite.config.js
```

This is an internal development/tooling directory (a Kanban board app) that should not be part of the published repository. Simply adding `.tracker/` to `.gitignore` (as 0029 suggests) will **not** remove these files from version control — `.gitignore` only prevents tracking of **new** files, not files already tracked.

## Fix

Two steps are required:

### 1. Remove tracked files from the index (without deleting from disk)

```bash
git rm -r --cached .tracker/
```

### 2. Add `.tracker/` to `.gitignore`

Append to `.gitignore`:

```
.tracker/
```

This ensures the files are both untracked and ignored going forward. Commit both changes together.

**Note:** This supersedes issue 0029. If 0029 is implemented first without `git rm --cached`, the files will remain tracked despite being in `.gitignore`.

## Verification

1. `git ls-files .tracker/` returns no output (no tracked files)
2. `grep ".tracker/" .gitignore` shows the entry
3. `git status` does not show `.tracker/` as untracked or modified
4. The `.tracker/` directory still exists on disk (not deleted, just untracked)

## Architect Review — Closed

All verification criteria met as of commit `7c0376ef`:

1. `git ls-files .tracker/` returns empty — no tracked files. ✓
2. `.gitignore` contains `.tracker/`. ✓
3. `git status` does not show `.tracker/` as untracked or modified. ✓
