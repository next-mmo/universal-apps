# Task 0005: Define the counter-app token measurement and recover real host counters

> **Status:** done  
> **Type:** specification  
> **Created:** 2026-09-17  
> **Completed:** 2026-09-17  
> **PRD:** `docs/prd/0003-counter-app-token-measurement.md`

Specification-only increment: define the counter-app measurement and recover the real host counters that make it possible. The measurement run itself was never authorized and is not part of this increment.

## Checkpoint Fields (ND)

- Owner: repository maintainers
- Scope approval: Approved 2026-09-17 for specification-only drafting (the `/nd-spec-feature` request) plus one bounded follow-up: publishing the recovered counters. Approval of PRD 0003's requirements is a separate owner decision and is tracked by the PRD itself.
- Execution authorization: Not granted, and explicitly declined 2026-09-17 (questionnaire `ask_3d1bc0f842cbba073e9c3a65`): the owner chose the no-spend counter recovery over starting the counter-app run.
- Exact next action: none. Closed to `done/`.

## Goal and scope

- Mode: specification-only, with one bounded authorized exception (counter publication).
- Outcome / why: obtain a defensible, host-reported token figure for building one frozen counter app with stack assistance versus from scratch. Repository policy forbids savings claims backed only by character heuristics, so a real number is required before any public statement. This increment established whether such a number is obtainable and from where; the run that produces it is a later, separately authorized step.
- Requirement or issue: [`docs/prd/0003-counter-app-token-measurement.md`](../../prd/0003-counter-app-token-measurement.md), version 1, status `draft`, requirements CTM-01–CTM-06.
- In scope and delivered: the draft PRD, the drafting checkpoint, the counter-availability discovery, the recovered-counter correction to [`coding-round-alert-nd-vs-baseline.md`](../../../packages/nd-workflow/docs/evidence/coding-round-alert-nd-vs-baseline.md), the restored benchmark fixture, the committed Windows test fix, the `AGENTS.md` doc-layout correction, and removal of the orphaned legacy `report/` output.
- Non-goals: building either arm, editing product source beyond the test fix, changing NTE-01–NTE-04 policy, publishing any percentage, monetary claims, release or publish steps.

## Discovery record

- Repository token tooling is an estimate, not usage: `packages/nd-workflow/scripts/nd.py` `cmd_tokens` computes `ceil(chars/4)` and self-labels `"status": "ESTIMATE"`.
- No billing or money layer exists anywhere in the workspace, so no currency figure is derivable from repository data alone.
- Host-persisted per-turn usage **does** exist: `<activeDataDir>/v2/sessions/YYYY/MM/DD/<HH-MM-SS>-<session_id>/messages.jsonl` holds one record per assistant turn. 63 of 184 session directories carried such a file on 2026-09-17.
- Two record shapes were observed, and both satisfy `total = input + cacheRead + output`: a nested `usage { input, output, cacheRead, cacheWrite, totalTokens, cost { … } }` object in older records, and flat `input_tokens`, `output_tokens`, `cache_read`, `total_tokens`, `context_window`, and `request_duration_ms` fields in newer ones. This supersedes the earlier claim that host counters were unavailable.

## Ownership and integration

- Exact task path: `docs/tasks/done/done-0005-counter-app-token-measurement.md` (moved from `docs/tasks/wip-0005-counter-app-token-measurement.md` on completion; the task ID is preserved).
- Owner / team; session ID: Mavis (integration owner) / session `mvs_8c85c29304824f9c842b4d05a9887854`.
- Branch/worktree and base revision: repository root, base `23723ab6b340e992945f5b6e2cb816c50fcd87cc`.
- Owned write paths: `docs/prd/0003-counter-app-token-measurement.md`, `docs/tasks/wip-0005-counter-app-token-measurement.md`, `docs/prd/0000-prd-index.md`, `docs/evidence/coding-round-alert-nd-vs-baseline.md`, and after authorization `docs/evidence/counter-app-token-measurement.md`.
- Dependencies / outstanding workers: none. No other task was active on the board.
- Integration owner / shared files / merge order: the unindexed sibling draft `docs/prd/nd-token-efficiency.md` predates this work; whether it also gets an index row is the owner's decision. No merge ordering constraint.

## Plan and acceptance

- Canonical behavior/architecture targets; baseline and requirement IDs: `docs/prd/nd-token-efficiency.md` NTE-05 (draft) owns the paired-efficiency protocol; `agent/evals.md` owns measurement-field guidance. Baseline `23723ab`. No counter-app result exists.
- Completion state: every criterion this increment committed to is verified. The remaining PRD 0003 work is the authorized run, which was declined, so it was never a criterion of this increment.

## Acceptance Criteria

- [x] Discovery recorded: repository token tooling self-labels as `ESTIMATE`; no billing or money layer exists anywhere in the workspace.
- [x] Decisive blocker resolved: host-persisted per-turn usage confirmed in session `messages.jsonl`, in both the nested `usage{…}` and flat `*_tokens` record shapes.
- [x] Draft PRD 0003 written with requirements CTM-01–CTM-06 and an explicit `UNMEASURED` escape hatch.
- [x] Drafting checkpoint written; `pnpm workflow:check`, `pnpm docs:check`, and `pnpm nd:check` pass.
- [x] Owner decision recorded on the baseline arm: plain Vite scaffold with repository guidance withheld.
- [x] Owner decision recorded on measurement scope: publish recovered counters only, do not start the counter-app run.
- [x] Recovered counters published to `docs/evidence/coding-round-alert-nd-vs-baseline.md` with session paths and arithmetic.
- [x] Restored `apps/todo-full-stack-benchmark.zip` so the working tree matches HEAD.
- [x] Committed the Windows junction test fix as its own commit.
- [x] Corrected the stale `AGENTS.md` claim that root `docs/` is unused.
- [x] Removed the orphaned `report/` output left behind by the deleted `.agents/scripts/report.mjs`.

## Evidence Ledger

| Claim | Evidence | Result |
| :--- | :--- | :--- |
| Token tooling is an estimate, not usage | `packages/nd-workflow/scripts/nd.py` `cmd_tokens` uses `ceil(chars/4)` and emits `"status": "ESTIMATE"` | Verified by reading source |
| No billing or money layer exists | Workspace-wide search for pricing, cost, and billing returns no accounting code | Verified |
| Host token counters are available | 63 of 184 session directories under the data dir carry a `messages.jsonl`; both record shapes satisfy `total = input + cacheRead + output` | Verified 2026-09-17 |
| A real paired token result now exists | Summed counters: ND 483,386 vs baseline 775,589 total tokens (−37.7%); fresh input+output 85,306 vs 96,037 (−11.2%); output 11,377 vs 16,297 (−30.2%); recovered turn counts 16/20 match the run's recorded turns | Verified 2026-09-17, n=1, Alert task |
| No monetary figure is derivable | Every recovered `usage.cost` object is zero | Verified |
| Working tree matches HEAD for the benchmark fixture | `git checkout -- apps/todo-full-stack-benchmark.zip`; `git status` clean for that path | Verified 2026-09-17 |
| Doc-layout claim corrected | `AGENTS.md` now states that PRDs, tasks, and evidence live under `docs/`; `pnpm docs:check` passes | Verified 2026-09-17 (`a007851`) |
| Windows symlink escape test runs unprivileged | `packages/cli/test/source.test.mjs` now passes using a junction fallback; `source:test` 34 pass, 0 fail, 1 skip | Verified 2026-09-17 (`c6fdb98`) |
| Orphaned legacy output removed | `report/` was generated by `.agents/scripts/report.mjs`, deleted at `23723ab`, and inventories the superseded `.agents/docs/` layout; moved to trash, so it is recoverable | Verified 2026-09-17 |
| Repository checks pass on this increment | `pnpm test` 7/7 stages; `pnpm workflow:check`; `pnpm docs:check`; `pnpm nd:check` | Verified 2026-09-17 (`14bc6f7`) |
| Counter-app benchmark result | none — PRD 0003 remains `draft` and the run was never authorized | Not in this increment |

## Carried forward

These are owner-owned and were never part of this increment's deliverable. They stay with PRD 0003 and produce no task-file obligation.

1. Scope approval for `docs/prd/0003-counter-app-token-measurement.md` (CTM-01–CTM-06); the PRD is `draft` with no approver or date.
2. Execution authorization naming provider, model, reasoning effort, repetition count, and spend ceiling — explicitly declined on 2026-09-17.
3. The measurement run itself, and its evidence file `docs/evidence/counter-app-token-measurement.md`, only after authorization.
4. Open questions in PRD 0003: whether a 3-pair minimum is sufficient at the observed variance, and which framework follows React in a gated extension.
5. A decision on whether the unindexed sibling draft `docs/prd/nd-token-efficiency.md` also receives a row in `docs/prd/0000-prd-index.md`.

## Resume State

- Updated at / author: 2026-09-17 / Mavis.
- Completed / partial / not started: completed — discovery, draft PRD, checkpoint, counter recovery and publication, fixture restoration, Windows test fix, doc-layout correction, orphan removal. Not started, and never authorized — the counter-app measurement run.
- Exact next action or command and working directory: none. If the owner later authorizes the run, required parameters are provider, model, effort, repetition count, and spend ceiling, executed from the repository root per PRD 0003.
- Current hypothesis / blockers / decision needed: the instrument blocker is resolved and a real n=1 pair is published. No blocker remains on this increment; the outstanding items are the five owner decisions listed under Carried forward.
- Decisions and rejected approaches with reasons: owner-chosen baseline = plain Vite scaffold with guidance withheld (isolates stack assistance); owner-declined execution (no spend authorization); rejected char/4 estimates as the headline figure (explicitly not billing evidence); rejected restoring `apps/benchmark/**` (removed at `23723ab`, and its own report concluded the token result was unmeasurable); rejected a single-run claim as a published percentage (the recovered pair is n=1); rejected a platform skip for the symlink escape test in favor of a junction, to keep real coverage of the `safePath` symlink guard unprivileged.
- Evidence still valid / invalidated and why: `docs/evidence/coding-round-alert-nd-vs-baseline.md` is upgraded from a transcript-byte proxy to real host counters; `docs/evidence/locate-vs-search-benchmark.md` (~5.2× retrieval bytes) remains a proxy. Invalidated: the prior claim that host counters were unavailable.
- Relevant source, docs, and output paths (repo-relative): `docs/prd/0003-counter-app-token-measurement.md`, `docs/prd/nd-token-efficiency.md`, `docs/evidence/coding-round-alert-nd-vs-baseline.md`, `agent/evals.md`, `agent/budgets.json`, `docs/evidence/locate-vs-search-benchmark.md`, `.agents/templates/TASK.md`.
- Successor ownership transfer / outstanding coordination: none; the owner holds the approval decision, and PRD 0003 carries the follow-on work.

## Verification and closure

- Criterion / command or inspection / result / evidence location: draft PRD and checkpoint are readable at their paths; counter sums are reproducible from the two cited session records (`2026/09/15/10-28-49-047-session_bXZzX2YzYTY3Nzk2OWMxMzRkZTM4NTYzNGJkNWUxYTBmYjFm` ND, `2026/09/15/10-28-50-620-session_bXZzXzk2M2QzZWE4ZGMwYTRjMzdhZjE3MjFjNTM1MDhjOWQw` baseline); `pnpm workflow:check`, `pnpm docs:check`, and `pnpm nd:check` exit 0.
- Tested state and relevant environment for cross-session, high-risk, or release work: the one product change in this increment is the CLI test fix, which passes under `pnpm test` on this Windows host; no release artifact was produced.
- Combined-state checks and integration result: `pnpm test` 7/7 stages green with the increment applied; no other task integrated concurrently.
- Current-doc reconciliation result / conflicts resolved: PRD 0003 cross-references NTE-05 and marks it as the policy owner to avoid duplicate scope; the evidence file's counter limitation is corrected rather than left stale; the stale `AGENTS.md` claim that root `docs/` is unused was corrected (`a007851`); the orphaned legacy `report/` output was removed. No remaining conflict with `AGENTS.md` requirements was found.
- Optional durable learning updated, corrected, retired, or no-op: the counter-availability fact was recorded in the PRD and the evidence file rather than in standing instructions; the reusable host-counter mechanics were also written to agent memory.
- Failed / skipped / unverified checks and reasons: the counter-app measurement is skipped by design — the owner declined the spend. Counter recovery covers one session pair only, so availability must be re-verified at execution start per CTM-03.
- Recovery plan / operations reference if relevant: revert the evidence-file counter addition and this record; delete PRD 0003 and its index row. No destructive operation, publish, or release step is part of this scope.
- Implemented / integrated / deployed state and evidence: implemented — recovered-counter publication and the Windows test fix (`c6fdb98`); documentation increment committed as `14bc6f7`. Integrated — not applicable. Deployed — not applicable.
- Status: done. The unstarted measurement run remains with PRD 0003 and requires a new owner authorization.
