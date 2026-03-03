---
tag: architecture
state: open
---

# 0029 — `.gitignore` Missing `.tracker/` Directory

## Problem

The `.tracker/` directory exists in the working tree as an untracked directory. It contains its own `node_modules/`, `package.json`, `package-lock.json`, `server.js`, and `vite.config.js` — clearly an internal development/tooling directory that should not be committed to the repository.

Currently `git status` shows:

```
Untracked files:
  .tracker/
```

If a contributor runs `git add -A`, this directory (including its `node_modules/` with ~116 packages) would be staged and committed, bloating the repository.

## Requirements

Add `.tracker/` to `.gitignore`:

```
node_modules/
dist/
coverage/
.env
*.tsbuildinfo
.tracker/
```

## Verification

1. `git status` no longer shows `.tracker/` as an untracked file
2. `cat .gitignore` includes `.tracker/`
3. `git add -A && git status` does not stage anything from `.tracker/`
