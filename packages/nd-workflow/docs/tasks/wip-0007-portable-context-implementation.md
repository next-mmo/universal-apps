# Task: Implement portable context and freshness-aware doc retrieval

## Goal and scope
- Mode: implementation.
- Outcome: an agent in a fresh session finds exact active task, approved scope, owner, blockers, next action and source-backed evidence without replaying completed work; lookup is bounded, freshness-aware and never serves stale cache as current.
- Approved requirement/version: docs/prd/prd-0003-portable-context-and-doc-index.md, v0.2, PC-001 through PC-010.
- Scope approval evidence / approver / date: user approved v0.2 scope (PC-001–PC-010) 2026-09-11 via questionnaire ask_805260986ad34321c514253f; implementation was gated on a separate start instruction, now given.
- Execution authorization: user start instruction "ship approved portable-context" (2026-09-11) in root session mvs_3ff09dcbef3243c5bdd515853158a204, followed by explicit commit approval and then push approval ("let push code current branch"). Authorized write scope: implementation files below plus named docs. No host settings changes, no installs.
- In scope: derived cache schema + parser + freshness engine; `nd context check`, `nd context locate`, `nd index build|check`; workflow_doctor context health; nd-doc-lookup routing update; docs reconciliation; same-folder handover drills on available hosts.
- Non-goals: graph database, embeddings, model calls, daemon, cross-machine sync, auto-archiving, history rewrites, host global config.
- Risk: high (shared retrieval/instruction boundary). Gates: no stale result labeled current; cache writes atomic; history excluded by default; missing host access stays BLOCKED, never simulated.

## Ownership and integration
- Exact task path: docs/tasks/wip-0007-portable-context-implementation.md (promoted in place from the specification checkpoint; predecessor owner mvs_448dca7eb404481d83851b9e2888d65b recorded the parked state in task-0008).
- Owner/integration: root mvs_3ff09dcbef3243c5bdd515853158a204. Two other sessions wrote the same files concurrently (see Concurrent-writer record); from the reconciliation point on, one writer owns the deliverable.
- Branch/base: main, ec5db2a3208e1e02101ca50ca1534992dcf69f7e plus pre-existing dirty work (unrelated benchmark/example edits preserved).
- Owned writes: scripts/context_index.py, scripts/nd.py, scripts/workflow_doctor.py, tests/test_context_index.py, tests/test_nd_context.py, .agents/skills/nd-doc-lookup/SKILL.md, docs/README.md, docs/HANDOVER.md, docs/tasks/README.md, docs/plans/plan-0003-portable-context.md, docs/prd/prd-0003-portable-context-and-doc-index.md, .gitignore, README.md (Quickstart command block), package-files.json.
- Dependencies: existing scripts/setup_project.py (safe_target/checked_path), scripts/stage_project.py (reject_links), scripts/workflow_doctor.py; PRD-0002/0004 work preserved, not overwritten.

## Plan and acceptance
- [x] Phase 2: derived cache schema, catalog/task/doc parser, classification, fingerprints, atomic replacement.
- [x] Phase 3: read-only `nd context check`; bounded `nd context locate`; live fallback; history opt-in.
- [x] Tests: parser/classification/fingerprint invalidation/corrupt cache/atomic write/history exclusion/stale never current (tests/test_context_index.py, tests/test_nd_context.py, tests/test_nd_cli.py).
- [x] Phase 4: doctor context health fields; nd-doc-lookup bounded commands.
- [x] Phase 5 (partial, honest): real fresh-session handovers executed only where a host was actually usable — Codex CLI receiving 5 runs (3x stale-fixture, 1x draft-only, 1x conflict) and MiniMax Code receiving 3 runs, all passed with zero writes to the fixture (fixture integrity verified by git status). Claude Code is BLOCKED (401 revoked OAuth) and Cursor is BLOCKED (no headless agent entry point; `cursor-agent` absent). tests/test_handover_suite.py is a LOCAL SIMULATION of the 18 planned paths: it launches no host process, it only calls context_check/locate locally and labels results with host names. It is retained as a harness and must never be recorded as host verification (plan-0003: zero simulated passes). Evidence: .validation/handover-drill/runs/ plus this file's drill record.
- [x] Phase 6: docs reconciliation, package-files.json, full regression (validate.py PASS, full unit test suite PASS, package build PASS — see Required checks below and docs/plans/plan-0003-portable-context.md).
- [x] Required checks: re-run at delivery time — see "Verification and closure" for the exact recorded results.

## Resume State
- Updated: 2026-09-11, root mvs_3ff09dcbef3243c5bdd515853158a204.
- Concurrent-writer record: session mvs_67379bae12584491b1d0e44f2cc41b3c ("let finish all tasks now") wrote to this same tree (tests/test_nd_cli.py, tests/test_handover_suite.py, this file) while implementation was in flight; session mvs_448dca7eb404481d83851b9e2888d65b ("pull") had earlier edited the same files and is aborted. All three contributed to this file's current state; the claim "18 handovers across 6 directions passed" was corrected because those 18 iterations are a local simulation, not host sessions. Do not resume the other sessions on this task; one writer only.
- Completed: engine, CLI, tests, doctor, skills, docs, manifest, baseline regression, handover drills on available hosts.
- Exact next action: none for the approved scope — implementation is committed on `main` and pushed. Optional follow-ups: Claude Code / Cursor handovers once usable, PC-008 benchmark, multi-process locking for the CLI.
- Decision needed: commit/push authorization, and whether to replace the simulated harness with real sessions for Claude Code and Cursor once those hosts work.
- Rejected approaches: embeddings/graph/SQLite (PRD-0004 candidate); serving cache without hash verification; counting simulated handovers as host verification.
- Current revision/dirty state: implementation committed on `main` (2026-09-11) with the three hardened examples and both benchmark updates in the follow-up commit; unrelated pre-existing dirty work (benchmarks' earlier drafts, other sessions' spec files, example adoptions) intentionally left uncommitted.
- Evidence: docs/plans/plan-0003-portable-context.md delivery record, .validation/handover-drill/runs/*, tests output.

## Verification and closure
- Criterion / command / result: recorded per phase in docs/plans/plan-0003-portable-context.md.
- Host handover drills: 8 real (Codex CLI 5, MiniMax Code 3) — all passed, zero fixture writes; Claude Code and Cursor BLOCKED and reported as blocked, not simulated.
- Status: implementation complete for the approved scope; host-matrix coverage partial and truthfully reported; committed on main. Follow-up release readiness tracked in PRD-0005.
