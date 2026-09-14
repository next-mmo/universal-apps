# Implementation Plan: Portable Context and Freshness-Aware Doc Retrieval

- PRD: docs/prd/prd-0003-portable-context-and-doc-index.md, v0.2, PC-001 through PC-010.
- Scope approval: approved 2026-09-11 via questionnaire ask_805260986ad34321c514253f.
- Execution authorization: given 2026-09-11 — explicit start instruction "ship approved portable-context" from root session mvs_3ff09dcbef3243c5bdd515853158a204. Implementation record: docs/tasks/wip-0007-portable-context-implementation.md.
- History: saved/parked 2026-09-11 at user request with all six phases retained and none executed; resumed the same day on the start instruction above. Separate unapproved performance proposal/plan: docs/prd/prd-0004-large-project-retrieval-efficiency.md and docs/plans/plan-0004-large-project-retrieval-efficiency.md. No backend change to this approved scope occurs without reconciliation.
- Topology: same folder, same machine.
- Hosts: Cursor, Claude Code, Codex, MiniMax Code. Six transfer directions.
- Excluded: Graphify installation, cloud sync, background daemon, model-backed document parsing, auto-archiving.

## Phase 1: Host and catalog discovery
- [x] Record exact versions and native instruction paths: Cursor 3.17.8 (desktop launcher only; `cursor-agent` not installed), Claude Code 2.1.144 (`claude.exe`; headless `-p` supported, authentication FAILED at drill time: 401 revoked OAuth), Codex CLI 0.149.0 (`codex exec`, authenticated), MiniMax Code (this runtime; fresh child sessions).
- [x] Verify each host's native entry point can reference canonical policy without copying it: root AGENTS.md (Codex, MiniMax Code), CLAUDE.md `@AGENTS.md` import adapter (Claude Code), shared docs/README.md catalog for all. No host or global settings changed.
- [x] Confirm baseline test state before implementation edits: `python scripts/validate.py` PASS, `python -m unittest discover -s tests -q` 134 tests OK, HEAD ec5db2a3208e1e02101ca50ca1534992dcf69f7e.
- [x] Acceptance: host entry points documented, clean baseline recorded, no project code modified before implementation.

## Phase 2: Schema, parser, and freshness engine
- [x] Derived cache schema: versioned `schema: 1`, ignored `.nd-cache/context-index.json`, disposable, contains routing metadata only — scripts/context_index.py.
- [x] Source parser: docs/README.md catalog rows (topic, target, read-when), active task checkpoints (wip-/blocked-), current docs, completed tasks (indexed but historical), skills/templates as policy/behavior classes.
- [x] Document classes: current_policy, current_behavior, active_task, draft, historical; frontmatter `status: implemented|released|…` demotes proposals to historical.
- [x] Fingerprint check: size + mtime first, sha256 for verification; detects edit, rename, deletion, HEAD change; non-Git projects fall back to content fingerprints only.
- [x] Failure paths tested: missing cache, corrupted cache, stale fingerprint, interrupted atomic write (previous cache preserved, no temp leftovers), oversized source, symlinked/ignored trees, secret-shaped names.
- [x] Acceptance met: 19 unit tests in tests/test_context_index.py (parser, classification, invalidation, atomicity, bounds, history, stale-never-current).

## Phase 3: CLI context commands
- [x] `nd context check <project>`: read-only; reports checkpoint fields (owner, scope approval, execution authorization, next action, blockers, status), ambiguity, missing catalog anchors, cache state/freshness, revision MATCH/MISMATCH, host_loading UNVERIFIED. Exit 0 READY, else 2.
- [x] `nd context locate <topic>`: max five ranked routes (clamped), bounded excerpts (<=200 chars), class, exact expansion pointer `<path>:<line>`.
- [x] Live-source fallback: missing/corrupted/stale cache falls back to scoped live search automatically; reports cache state, freshness, stale-excluded count and read cost; never returns empty solely because the cache is absent.
- [x] History opt-in: historical tasks excluded by default; `--include-history` required; absent-topic output states that no match is not proof of absence.
- [x] Also added: `nd index build` / `nd index check` (atomic write, freshness exit codes).
- [x] Acceptance met: tests/test_nd_context.py (CLI exit codes, bounded output, fallback, history, no fabrication) plus tests/test_nd_cli.py::test_context_locate_and_check_cli.

## Phase 4: Integration with doctor and lookup skill
- [x] nd-doc-lookup skill routes to `nd context locate` first and `nd context check` for task state; limits section states the index is routing metadata, never approval.
- [x] workflow_doctor reports `context_health` as a separate section: checkpoint completeness, active/ambiguous tasks, cache + freshness, missing anchors, host loading UNVERIFIED; narrow error handling leaves `UNAVAILABLE` with a reason.
- [x] Token footprint: `nd context check` default summary stays under the 500-token budget (measured 388 estimated tokens = 1549 characters on this repo via the built-in character heuristic; heuristic only, not model usage); outputs print an explicit footprint line and never silently truncate.
- [x] Acceptance met: doctor runs with context checks (context_health READY on this repo); skill routes verified in fixtures via the new test suites.

## Phase 5: Same-folder handover test suite
- [x] Disposable fixture with active task, canonical docs and deliberate dirty state: `.validation/handover-drill/` (stale, draft-only, conflict variants; scaffold `.validation/handover-drill/make_fixture.py`).
- [ ] 18 fresh-session handovers (3 repetitions x 6 directions): 4 of the 6 directions require Claude Code or Cursor as a usable agent host. Executed: 8 real handovers — Codex CLI receiving x5 (3x stale fixture, 1x draft-only, 1x conflict) and MiniMax Code receiving x3 — all PASS, zero writes to the fixtures (verified by `git status`).
- [x] Edge cases: draft-only checkpoint → no implementation authorized, refuses writes (PASS on Codex and MiniMax Code); changed files / stale evidence → stale cache and revision mismatch detected (PASS); unreleased ownership conflict → stops, refuses to pick an owner, asks the owner (PASS).
- [x] Recorded pass/fail/blocked with zero simulated passes. BLOCKED: Claude Code (401 revoked OAuth) and Cursor (no headless agent entry point) — reported as blocked, never simulated. `tests/test_handover_suite.py` is a local simulation harness (no host process launched) retained for fast regression; it is explicitly not host verification.
- [ ] Acceptance: all ACCESSIBLE handovers passed without safety violations (8/8, met); blocked hosts reported truthfully (met). Full 18-handover matrix remains open until Claude Code and Cursor are usable.

## Phase 6: Documentation reconciliation and delivery
- [x] Updated with implemented routes: docs/README.md (resume row), docs/HANDOVER.md (Automated resume checks), docs/tasks/README.md (checkpoint audit note), README.md Quickstart (context/index commands), .gitignore (/.nd-cache/).
- [x] package-files.json includes scripts/context_index.py, tests/test_context_index.py, tests/test_nd_context.py; manifest total 91 files (tests/test_handover_suite.py included as the simulation harness).
- [x] Full regression recorded below.
- [x] Deliver completion record; PRD-0003 promoted to `in-progress` (not `shipped`: no tag or release). Implementation committed on `main` and the branch pushed to `origin/main` on 2026-09-11 on explicit user instruction.

## Delivery record
- Date / owner: 2026-09-11, root session mvs_3ff09dcbef3243c5bdd515853158a204 (implementation), with concurrent-writer reconciliation described in docs/tasks/wip-0007-portable-context-implementation.md.
- Verified by command (recorded results, 2026-09-11):
  - `python scripts/validate.py` — PASS: 0 errors across manifest_paths, hard_required, agents_word_count (448/450), utf8_links (42 files, 94 links, 46 fences), skill_frontmatter; 91 files in the manifest.
  - `python -m unittest discover -s tests -q` — PASS: 166 tests, exit 0 (includes 19 context-index unit tests, 9 CLI tests, the handover simulation harness and the pre-existing suite).
  - `python scripts/package.py --output artifacts/nd-workflow-portable-context-20260911.zip` — PASS: 91 entries, 201880 bytes, sha256 14ef2d4bbf5641d379ed649aa186fa15d629e95476f03a9243c61663043be13b, allowlist match and byte-identical sources verified.
- Real handover evidence: local, ignored `.validation/handover-drill/runs/` — five Codex CLI transcripts plus recorded MiniMax Code fresh-session reports (`minimax-stale-rep1.md`, `minimax-draft-rep1.md`, `minimax-conflict-rep1.md`). Ignored scratch is not part of the repository; the drill verdicts and limits above are the durable record.
- Not done / not claimed: PC-008 reproducible benchmark (fixed questions, recall@k/MRR@k, cross-host comparison) — not run; Claude Code and Cursor handovers — blocked; no tag, release or publish performed. Commits: implementation committed on `main` (2026-09-11) and pushed to `origin/main` on explicit user instruction; example and benchmark updates follow in a second commit.
- Collision note: sessions mvs_448dca7eb404481d83851b9e2888d65b and mvs_67379bae12584491b1d0e44f2cc41b3c wrote to the same files during implementation. This record keeps only claims that were verified; the earlier "18 handovers across the 6 directions passed" wording was corrected to describe the local simulation harness.
