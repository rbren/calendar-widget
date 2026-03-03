---
tag: architecture
state: open
---

# 0011 — Dependency Security & Audit

## Problem

Even a small component library pulls in dozens of transitive dependencies. Without automated auditing, known vulnerabilities in dependencies can ship to every consumer. This must be addressed before the first release.

## Requirements

### npm audit in CI

Add `npm audit --audit-level=high` as a step in the CI pipeline (issue 0008) so that builds fail if any dependency has a known high or critical vulnerability:

```yaml
- run: npm audit --audit-level=high
```

Place this step immediately after `npm ci` so it fails fast.

### Lock file hygiene

- **Commit `package-lock.json`** — This is required for reproducible builds and for `npm ci` to work. Ensure it is not in `.gitignore`.
- **Keep the lock file up to date** — When dependencies change, regenerate with `npm install` and commit the updated lock file.

### Minimal dependency surface

A distributable component should have as few runtime dependencies as possible:

- **Zero runtime dependencies** — The widget must not have any entries under `dependencies` in `package.json`. React is a `peerDependency`. All other packages (`vite`, `vitest`, `eslint`, `prettier`, `typescript`, testing libraries) are `devDependencies`.
- **Audit dev dependencies too** — Even dev-only packages run during CI and development. A compromised dev dependency is a supply-chain risk.

### Renovate / Dependabot (recommended)

Configure automated dependency update PRs. For GitHub, create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 10
    labels:
      - dependencies
```

This ensures vulnerabilities are patched promptly via automated PRs.

## Verification

- `npm audit --audit-level=high` exits 0 on a clean install
- `package.json` has no entries under `dependencies` (only `peerDependencies` and `devDependencies`)
- `package-lock.json` is committed and not in `.gitignore`
- CI pipeline includes the audit step and fails if a high-severity vulnerability is present
- (If Dependabot is configured) — `.github/dependabot.yml` exists and Dependabot opens PRs when updates are available
