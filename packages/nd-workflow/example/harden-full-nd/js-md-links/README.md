# check-links — hardened Markdown link checker

Real, runnable example of a hardened Node.js deliverable from the ND Workflow
repository. Node.js built-in modules only, zero dependencies, zero network access.

## What it does

`check-links.mjs` walks a root directory for `*.md` files and verifies that
relative links point to existing files. Problems are grouped by file and the
process exits non-zero so CI can gate on it.

## Requirements

- Node.js v24 or newer (observed on v24.16.0). No package manager, no `package.json`, no install step.

## Usage

```powershell
node check-links.mjs <root-directory>
node check-links.mjs --help
```

Exit codes:

| Code | Meaning |
|---|---|
| 0 | No broken links, no violations, no errors |
| 1 | Broken links, policy violations, or unreadable files |
| 2 | Usage or argument error (missing/multiple root, unknown option, root not a directory) |

Example report (real output, see [Observed results](#observed-results)):

```text
Root: C:\Users\dila\AppData\Local\Temp\mdlinks-smoke-fixture
Files: 2 scanned, 0 skipped | Links: 6 (external: 1, same-file anchors checked: 2)

BROKEN
  README.md
    L4 [broken] docs/gone.md -> target does not exist
  docs/guide.md
    L3 [violation] ../../etc/passwd -> path escapes root (resolved C:\Users\dila\AppData\Local\Temp\etc\passwd)
    L4 [broken] #nope -> heading "#nope" not found in this file

Summary: 2 broken, 1 violations, 0 errors, 0 notes
```

Issue kinds: `broken` (missing target, missing anchor, bad percent-encoding),
`violation` (absolute path or `..` escape — the target is never touched),
`error` (target exists but is not readable, or an unreadable source file).

## Hardening rules

| Rule | Behavior |
|---|---|
| Path traversal | A `..` target that resolves outside the root is reported as a violation and is **never** stat-ed or read |
| Absolute paths | POSIX (`/x`), Windows drive (`C:\x`) and UNC (`\\host\share`) targets are violations, never touched |
| Protocol-relative URLs | `//host/path` is counted as external, not as a UNC violation |
| Skipped directories | `.git`, `node_modules`, `dist`, `build` are not walked (override with `skipDirs`) |
| Symlinks | Never followed, so walks cannot loop or escape through links |
| Read cap | Files larger than 1 MiB are skipped with an explicit `SKIPPED` note (override with `maxFileBytes`) |
| Unreadable files | Reported in `ERRORS`, exit 1 — never a crash (a directory named `blocked.md` is an error, not a stack trace) |
| External links | `http:`, `https:`, `mailto:` and any other scheme are counted, never fetched |
| Anchors | Pure `#fragment` links are verified against the headings of the same file using GitHub-style slugs; `#` alone is accepted |
| Determinism | Files, issues, notes and errors are sorted, so repeated runs are byte-identical |

## Tests

```powershell
node --test
```

19 tests, no network, every fixture created with `mkdtemp` under the OS temp
directory and removed afterwards. Nothing outside the temp root is written.

## Observed results

All three runs below were executed from this directory. Warnings from
PowerShell's native-stderr handling are omitted; stdout/stderr were captured
verbatim.

### 1. Test suite

```powershell
node --test
```

```text
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2320.9718
```

Process exit code: `0`. Repeat runs measured `duration_ms` 2179.7736, 2320.9718, and 2505.2093; the pass/fail counts were identical in every run.

### 2. CLI smoke run — fixture with problems

Fixture (under `$env:TEMP\mdlinks-smoke-fixture`): `README.md` → `docs/guide.md`,
`docs/gone.md` (missing), `https://example.com`, `#usage` (heading exists);
`docs/guide.md` → `../../etc/passwd`, `#nope`; `node_modules/pkg/junk.md` (must be skipped).

```powershell
node check-links.mjs "$env:TEMP\mdlinks-smoke-fixture"
```

```text
Root: C:\Users\dila\AppData\Local\Temp\mdlinks-smoke-fixture
Files: 2 scanned, 0 skipped | Links: 6 (external: 1, same-file anchors checked: 2)

BROKEN
  README.md
    L4 [broken] docs/gone.md -> target does not exist
  docs/guide.md
    L3 [violation] ../../etc/passwd -> path escapes root (resolved C:\Users\dila\AppData\Local\Temp\etc\passwd)
    L4 [broken] #nope -> heading "#nope" not found in this file

Summary: 2 broken, 1 violations, 0 errors, 0 notes
```

stderr: `check-links: FAILED with 3 problem(s) under C:\Users\dila\AppData\Local\Temp\mdlinks-smoke-fixture`
Process exit code: `1`. Note `node_modules/pkg/junk.md` was not scanned (`Files: 2 scanned`).

### 3. CLI smoke run — clean fixture

```powershell
node check-links.mjs "$env:TEMP\mdlinks-smoke-clean"
```

```text
Root: C:\Users\dila\AppData\Local\Temp\mdlinks-smoke-clean
Files: 2 scanned, 0 skipped | Links: 4 (external: 1, same-file anchors checked: 1)

Summary: 0 broken, 0 violations, 0 errors, 0 notes
check-links: OK under C:\Users\dila\AppData\Local\Temp\mdlinks-smoke-clean
```

Process exit code: `0`.

## Programmatic API

```js
import { checkLinks, formatReport, summarize } from './check-links.mjs';

const report = await checkLinks('/path/to/root', { maxFileBytes: 1024 * 1024 });
console.log(formatReport(report));
console.log(summarize(report)); // { broken, violation, error, note, failed }
```

`options.fs` accepts an injected `{ readdir, readFile, stat }` implementation;
the tests use it to simulate `EACCES` without touching file permissions.

## Limits and known gaps

See [HARDENING.md](HARDENING.md) for the full evidence log and limits. Main
gaps: cross-file fragments (`other.md#section`) are not verified, HTML
`<a name="...">` anchors are not recognized, and directory targets are treated
as valid.
