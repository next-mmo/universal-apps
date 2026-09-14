# Project Orientation — js-md-links

## Purpose and entry points

- Name: `check-links` — hardened Markdown relative-link checker (ND Workflow hardened example).
- Supported users: developers and CI evaluating a small, dependency-free Node.js deliverable with real hardening evidence.
- Runtime: Node.js v24.16.0 (ESM, built-in modules only), Windows 11 observed; no `package.json`, no install step.
- Primary entry: [`check-links.mjs`](../../check-links.mjs) — CLI and library in one module. Exports `checkLinks`, `formatReport`, `summarize`, `extractLinks`, `headingSlugs`, `slugify`, `classifyTarget`, `isInsideRoot`, `splitTarget`, `main`.
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md).

## Reproduce

All commands run from `example/harden-full-nd/js-md-links`.

| Action | Exact command | Last observed result |
|---|---|---|
| Test suite | `node --test` | 19 tests, 19 passed, 0 failed, 0 skipped, exit 0 (2.18–2.51 s across three runs) |
| CLI, problems | `node check-links.mjs "$env:TEMP\mdlinks-smoke-fixture"` | 2 broken, 1 violation grouped by file; exit 1 |
| CLI, clean | `node check-links.mjs "$env:TEMP\mdlinks-smoke-clean"` | 0 broken, 0 violations, 0 errors, 0 notes; exit 0 |
| Self-check | `node check-links.mjs .` | clean under this directory; exit 0 |
| Usage help | `node check-links.mjs --help` | usage text; exit 0 |
| Usage error | `node check-links.mjs` | `expected exactly one root directory, got 0`; exit 2 |

Exact captured output for the runs above is in [HARDENING.md](../../HARDENING.md) and [README.md](../../README.md).

## Operations and configuration

- Invocation: `node check-links.mjs <root-directory>`; exit codes 0 clean, 1 problems, 2 usage error.
- Options: `options.skipDirs` (default `.git`, `node_modules`, `dist`, `build`), `options.maxFileBytes` (default 1048576), `options.fs` (dependency-injection seam used by tests).
- No configuration files, environment variables, secrets, or network calls.

## Durable knowledge

- Not every `X:` prefix is a URI scheme: `C:\Windows\win.ini` must be classified as an absolute Windows path before the generic scheme rule, or it is silently counted as an external link. `classifyTarget` encodes that ordering, and protocol-relative `//host/x` must be checked before any UNC rule.
- `path.isAbsolute` is host-dependent; containment is therefore decided with `path.relative(root, candidate)` so Windows case-insensitivity and sibling prefixes (`root-sibling/`) cannot fool it.
- A directory whose name ends in `.md` makes a good portable "unreadable file" case: `stat` identifies it deterministically instead of relying on POSIX-only permission bits.
