---
tag: architecture
state: closed
---

# 0027 — Missing LICENSE File

## Problem

`package.json` declares `"license": "MIT"` but there is no `LICENSE` file in the repository root. This is a legal and practical issue:

1. **Legal ambiguity** — Without the full license text, the grant of rights is unclear. The `license` field in `package.json` is metadata, not a legal instrument.
2. **npm packaging** — npm warns when publishing a package with a declared license but no LICENSE file.
3. **GitHub rendering** — GitHub shows "MIT License" in the repo sidebar only when a LICENSE file exists with recognizable content.
4. **Contributor clarity** — Contributors need to know the exact terms under which they are contributing.

## Requirements

Create a `LICENSE` file at the project root containing the standard MIT License text:

```
MIT License

Copyright (c) 2026 Calendar Widget Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Also add `"LICENSE"` to the `files` array in `package.json` so it is included in the published npm package:

```json
{
  "files": ["dist", "LICENSE"]
}
```

## Verification

1. `LICENSE` file exists at the project root
2. `npm pack --dry-run` includes `LICENSE` in the tarball contents
3. The license text matches the MIT license and includes a copyright line
