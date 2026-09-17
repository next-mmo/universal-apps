# Task 0005: Measure real token usage for the same counter app built with and without the stack

> **Status:** wip  
> **Type:** specification  
> **Created:** 2026-09-17  
> **PRD:** `docs/prd/0003-counter-app-token-measurement.md`

Specification-only drafting checkpoint, plus one bounded owner-authorized follow-up (publishing recovered counters). The counter-app measurement itself remains unauthorized.

## Checkpoint Fields (ND)

- Owner: repository maintainers
- Scope approval: pending for PRD 0003 and for CTM-01–CTM-06. The `/nd-spec-feature` request of 2026-09-17 authorizes drafting only.
- Execution authorization: not authorized, and explicitly declined on 2026-09-17 (questionnaire `ask_3d1bc0f842cbba073e9c3a65`): the owner chose the no-spend counter recovery over starting the counter-app run. Running either arm still requires provider, model, effort, repetition count, and spend ceiling.
- Exact next action: none pending from Mavis. The open decisions belong to the owner — approve or revise PRD 0003, and if approved, authorize execution with a spend ceiling. Working directory: repository root.

## Goal and scope

- Mode: specification-only, with a bounded authorized exception.
- Outcome / why: obtain a defensible, host-reported token figure for building one frozen counter app with stack assistance versus from scratch. Repository policy forbids savings claims backed only by character heuristics, and the owner needs a real number before any public statement.
- Requirement or issue: [`docs/prd/0003-counter-app-token-measurement.md`](../prd/0003-counter-app-token-measurement.md), version 1, status `draft`, requirements CTM-01–CTM-06.
- In scope: the draft PRD, this checkpoint, the recovered-counter correction to `docs/evidence/coding-round-alert-nd-vs-baseline.md`, the restored benchmark fixture, the committed Windows test fix, the `AGENTS.md` doc-layout correction, removal of the orphaned legacy `report/` output, and the discovery facts recorded below.
- Non-goals: building either arm, editing product source beyond the test fix, changing NTE-01–NTE-04 policy, publishing any percentage, monetary claims, release or publish steps.
- Risk and required gates: medium for behavioral evidence that can be misread as a product guarantee. Required: PRD scope approval, then a separate execution authorization with a spend ceiling.

## Ownership and integration

- Exact task path (update on rename): `docs/tasks/wip-0005-counter-app-token-measurement.md`.
- Owner / team; optional session ID: Mavis (integration owner) / session `mvs_8c85c29304824f9c842b4d05a9887854`.
- Branch/worktree and base revision: repository root, base `23723ab6b340e992945f5b6e2cb816c50fcd87cc`.
- Owned write paths: `docs/prd/0003-counter-app-token-measurement.md`, `docs/tasks/wip-0005-counter-app-token-measurement.md`, `docs/prd/0000-prd-index.md`, `docs/evidence/coding-round-alert-nd-vs-baseline.md`, and after authorization `docs/evidence/counter-app-token-measurement.md`.
- Dependencies / outstanding workers: none. No other active task exists on the board.
- Integration owner / shared files / merge order: the unindexed sibling draft `docs/prd/nd-token-efficiency.md` predates this work; whether it also gets an index row is the owner's decision. No merge ordering constraint.

## Plan and acceptance

- Next steps within authorized mode: none. The authorized drafting and counter-publication work is complete; everything further needs a new owner decision.
- Canonical behavior/architecture targets; baseline and requirement IDs: `docs/prd/nd-token-efficiency.md` NTE-05 (draft) owns the paired-efficiency protocol; `agent/evals.md` owns measurement-field guidance. Baseline `23723ab`. No counter-app result exists.

## Acceptance Criteria

- [x] Discovery recorded: repository token tooling self-labels as `ESTIMATE`; no billing or money layer exists anywhere in the workspace.
- [x] Decisive blocker resolved: host-persisted per-turn usage confirmed in session `messages.jsonl`, in both the nested `usage{…}` and flat `*_tokens` record shapes.
- [x] Draft PRD 0003 written with requirements CTM-01–CTM-06 and an explicit `UNMEASURED` escape hatch.
- [x] This drafting checkpoint written; `pnpm workflow:check`, `pnpm docs:check`, and `pnpm nd:check` pass.
- [x] Owner decision recorded on the baseline arm: plain Vite scaffold with repository guidance withheld.
- [x] Owner decision recorded on measurement scope: publish recovered counters only, do not start the counter-app run.
- [x] Recovered counters published to `docs/evidence/coding-round-alert-nd-vs-baseline.md` with session paths and arithmetic.
- [x] Restored `apps/todo-full-stack-benchmark.zip` so the working tree matches HEAD.
- [x] Committed the Windows junction test fix as its own commit.
- [x] Corrected the stale `AGENTS.md` claim that root `docs/` is unused.
- [x] Removed the orphaned `report/` output left behind by the deleted `.agents/scripts/report.mjs`.
- [ ] Owner scope approval recorded on PRD 0003 (owner action).
- [ ] Execution authorization with provider, model, effort, repetitions, and spend ceiling (owner action, explicitly declined for now).
- [ ] Measurement run and evidence file `docs/evidence/counter-app-token-measurement.md` (only after authorization).

## Evidence Ledger

| Claim | Evidence | Result |
| :--- | :--- | :--- |
| Token tooling is an estimate, not usage | `packages/nd-workflow/scripts/nd.py` `cmd_tokens` uses `ceil(chars/4)` and emits `"status": "ESTIMATE"` | Verified by reading source |
| No billing or money layer exists | `grep` for pricing/cost/billing across the workspace returned no accounting code | Verified |
| Host token counters are available | 63 of 184 session directories under the data dir carry a `messages.jsonl`; both record shapes satisfy `total = input + cacheRead + output` | Verified 2026-09-17 |
| A real paired token result now exists | Summed counters: ND 483,386 vs baseline 775,589 total tokens (−37.7%); fresh input+output 85,306 vs 96,037 (−11.2%); output 11,377 vs 16,297 (−30.2%); recovered turn counts 16/20 match the run's recorded turns | Verified 2026-09-17, n=1, Alert task |
| No monetary figure is derivable | Every recovered `usage.cost` object is zero | Verified |
| Working tree matches HEAD for the benchmark fixture | `git checkout -- apps/todo-full-stack-benchmark.zip`; `git status` clean for that path | Verified 2026-09-17 |
| Doc-layout claim corrected | `AGENTS.md` now states that PRDs, tasks, and evidence live under `docs/`; `pnpm docs:check` passes | Verified 2026-09-17 |
| Orphaned legacy output removed | `report/` was generated by `.agents/scripts/report.mjs`, deleted at `23723ab`, and inventories the superseded `.agents/docs/` layout; moved to trash, so it is recoverable | Verified 2026-09-17 |
| Repository checks pass on this checkpoint | `pnpm test` 7/7 stages; `pnpm workflow:check`; `pnpm docs:check`; `pnpm nd:check` | Verified 2026-09-17 |
| Counter-app benchmark result | none | Not started — execution declined |

## Resume State

- Updated at / author: 2026-09-17 / Mavis.
- Completed / partial / not started: completed — discovery, draft PRD, checkpoint, counter recovery and publication, fixture restoration, test-fix commit. Not started — the counter-app measurement.
- Exact next action or command and working directory: none pending. The owner either approves PRD 0003 or returns it for revision; on approval, execution authorization must name provider, model, effort, repetition count, and spend ceiling. Working directory: repository root.
- Current hypothesis / blockers / decision needed: the instrument blocker is resolved and a real n=1 pair is published. Remaining owner decisions: whether PRD 0003's requirements are approved, whether a 3-pair minimum is enough (open question b), and which framework follows React (open question c).
- Decisions and rejected approaches with reasons: owner-chosen baseline = plain Vite scaffold with guidance withheld (isolates stack assistance); owner-declined execution (no spend authorization); rejected char/4 estimates as the headline figure (explicitly not billing evidence); rejected restoring `apps/benchmark/**` (removed at `23723ab`, and its own report concluded the token result was unmeasurable); rejected a single-run claim as a published percentage (the recovered pair is n=1).
- Current revision and uncommitted work location/fingerprint: base `23723ab` plus `c6fdb98` (Windows test fix) and `a007851` (`AGENTS.md` doc-layout correction); this checkpoint, PRD 0003, the PRD index row, and the evidence counters commit together as the final docs commit.
- Evidence still valid / invalidated and why: `docs/evidence/coding-round-alert-nd-vs-baseline.md` is upgraded from a transcript-byte proxy to real host counters; `docs/evidence/locate-vs-search-benchmark.md` (~5.2× retrieval bytes) remains a proxy. Invalidated: the prior claim that host counters were unavailable.
- Relevant source, docs, and output paths (repo-relative): `docs/prd/0003-counter-app-token-measurement.md`, `docs/prd/nd-token-efficiency.md`, `docs/evidence/coding-round-alert-nd-vs-baseline.md`, `agent/evals.md`, `agent/budgets.json`, `docs/evidence/locate-vs-search-benchmark.md`, `.agents/templates/TASK.md`.
- Successor ownership transfer / outstanding coordination: none; the owner holds the approval decision.

## Verification and closure

- Criterion / command or inspection / result / evidence location: draft PRD and checkpoint saved and readable at their paths; counter sums reproducible from the two cited session records; `pnpm workflow:check`, `pnpm docs:check`, and `pnpm nd:check` exit 0.
- Tested state and relevant environment for cross-session, high-risk, or release work: not applicable — no product behavior changed beyond the committed test fix, which passes under `pnpm test` on this Windows host.
- Combined-state checks and integration result: not run; nothing integrates until the measurement is authorized.
- Current-doc reconciliation result / conflicts resolved: PRD 0003 cross-references NTE-05 and marks it as the policy owner to avoid duplicate scope; the evidence file's counter limitation is corrected rather than left stale; the stale `AGENTS.md` claim that root `docs/` is unused predated this task and was corrected in the same session (`a007851`); the orphaned legacy `report/` output was removed. No remaining conflict with `AGENTS.md` requirements was found.
- Optional durable learning updated, corrected, retired, or no-op: no-op — the counter-availability fact is recorded in the PRD and the evidence file rather than in standing instructions.
- Failed / skipped / unverified checks and reasons: the counter-app measurement is skipped by design — the owner declined the spend. Counter recovery covers one session pair only; availability must be re-verified at execution start per CTM-03.
- Recovery plan / operations reference if relevant: revert the evidence-file counter addition and this checkpoint; delete PRD 0003 and its index row. No destructive operation, publish, or release step is part of this scope.
- Implemented / integrated / deployed state and evidence: implemented — recovered-counter publication and the test fix. Integrated — not applicable. Deployed — not applicable.
- Status: active (authorized scope complete; awaiting the owner's PRD decision). Execution not authorized.
