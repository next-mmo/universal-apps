# Task: hardened Markdown link checker example (js-md-links)

## Goal and scope

- Mode: implementation.
- Request: create ONE fully hardened, real, runnable ND Workflow example project at `example/harden-full-nd/js-md-links`.
- Outcome: `check-links.mjs` (Node built-ins only) plus a `node --test` suite, README, AGENTS/CLAUDE policy files, `.agents/docs/` orientation, docs catalog, this checkpoint, and `HARDENING.md`.
- Non-goals: dependencies, `package.json`, CI configuration, network access, publishing, changes outside this directory.
- Risk: medium — path policy is security-relevant (untrusted trees must never be read outside the root), so it carries high-tier verification even though the project is small.

## Ownership and integration

- Exact task path: `example/harden-full-nd/js-md-links/docs/tasks/done/done-0001-js-md-links.md`.
- Owner: worker session `mvs_34ca829878044cd384f555dd28eaffb9`.
- Owned paths: everything under `example/harden-full-nd/js-md-links/`. No other writer; nothing outside the directory was modified.
- Dependencies: none. Node.js v24.16.0 is the only runtime requirement.

## Plan and acceptance

- [x] `check-links.mjs` walks a root for `*.md`, verifies relative links, groups broken links by file, exits 1 on problems and 2 on usage/argument errors.
  - Observed: 19/19 tests pass including exit-code cases; smoke run exited 1 with grouped `BROKEN` output, clean smoke run exited 0.
- [x] `..` traversal outside the root and absolute targets are violations and are never read.
  - Observed: spy-`fs` tests assert every `stat` call stays inside the root, for both the traversal and the absolute case.
- [x] `.git`, `node_modules`, `dist`, `build` are skipped.
  - Observed: fixture with broken links in all four directories yields `Files: 2 scanned` and 0 issues.
- [x] Per-file read cap (1 MiB) with an explicit skip note.
  - Observed: `maxFileBytes: 1024` yields a `SKIPPED` entry `size N bytes exceeds cap 1024 bytes; not scanned`, and no issues from that file.
- [x] Unreadable files are reported errors, not crashes.
  - Observed: directory named `blocked.md` → `ERRORS` entry, exit 1; injected `EACCES` → `unreadable: EACCES`.
- [x] External links ignored but counted.
  - Observed: `https`, `http`, `mailto`, `ftp`, protocol-relative `//host` → `external: 5`, 0 issues, exit 0.
- [x] Pure `#anchor` links verified against same-file headings.
  - Observed: `#usage-notes`, `#whats-new`, `#` pass; `#does-not-exist` reported as `broken` on its exact line.
- [x] Deterministic sorted output.
  - Observed: two CLI runs byte-identical; files `a.md`, `b.md`, `c/inner.md` and line order asserted.
- [x] At least 10 `node --test` cases, deterministic, temp-dir only, no network.
  - Observed: 19 tests, fixtures via `mkdtemp`, cleaned in `after()`; no HTTP client exists in the codebase.
- [x] All documentation deliverables exist with observed, non-placeholder results.
  - Observed: README.md, AGENTS.md (≤250 words), CLAUDE.md, `.agents/docs/{PROJECT,ARCHITECTURE,WORKFLOW}.md`, `docs/README.md`, `HARDENING.md`.

## Resume state

- Updated 2026-09-11: implementation, tests, and documentation complete; `node --test` 19/19 and two CLI smoke runs recorded in [HARDENING.md](../../../HARDENING.md). Next: nothing required; extension candidates are listed as limits (cross-file fragments, HTML anchors).
- Decisions: single-module design to keep the trust boundary auditable; `.` inside the root is allowed (containment is the enforced property); cross-file fragments intentionally unverified.
- One real defect was found by the tests and fixed: `C:\...` targets matched the generic URI-scheme rule, so Windows drive paths were counted as external instead of being rejected. `classifyTarget` now checks drive/UNC/protocol-relative forms before the scheme rule.

## Verification and closure

- Test suite: `node --test` → `tests 19 / pass 19 / fail 0 / cancelled 0 / skipped 0 / todo 0 / duration_ms 2179.7736`, exit 0.
- CLI smoke (problems): `node check-links.mjs "$env:TEMP\mdlinks-smoke-fixture"` → grouped report with 2 broken + 1 violation, stderr `check-links: FAILED with 3 problem(s) ...`, exit 1.
- CLI smoke (clean): `node check-links.mjs "$env:TEMP\mdlinks-smoke-clean"` → `Summary: 0 broken, 0 violations, 0 errors, 0 notes`, exit 0.
- Self-check: `node check-links.mjs .` on this directory → clean (recorded in [HARDENING.md](../../../HARDENING.md)).
- Environment: Windows 11, PowerShell, Node.js v24.16.0; files authored UTF-8.
- Implemented and verified locally; not committed, tagged, published, or deployed. No network access was used at any point.
- Status: completed.
