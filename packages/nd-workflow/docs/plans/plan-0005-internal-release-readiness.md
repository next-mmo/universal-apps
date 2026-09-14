# Implementation Plan: Evidence-backed internal release readiness

Plan version: v0.1, 2026-09-11. Execution NOT AUTHORIZED.

## Objective & Context

- Outcome: evaluate an exact candidate against an internal >=9.7/10 readiness target without treating that score as reliability, certification or a competitor ranking.
- Scope: [PRD-0005 v0.1](../prd/prd-0005-internal-release-readiness.md), RR-001–RR-006; fixed category weights 25/25/20/20/10 and mandatory gates unchanged.
- Approval evidence: user selected "Approve v0.1 scope; prepare implementation plan only", questionnaire `ask_98ed07f27c44a5b1c8984a87`, 2026-09-11.
- Mode: technical plan. This file authorizes no implementation, evaluation, installation or release operation.
- Execution checkpoint: reuse [task-0012](../tasks/task-0012-internal-release-readiness-spec.md); no duplicate implementation task.
- Baseline: main at `c7dd5c4ddd3ee455ac058d4da8f0fc718e28c96d`, dirty tree recorded in task-0012. This is a planning baseline, not a frozen release candidate.
- Current score: UNASSESSED. Past test/host results are leads, not current score contributions.

## Architecture Impact

- Current-turn writes: this plan, PRD approval metadata, task-0012 and its catalog route only.
- Later candidate write scope: BENHMARK.md, INDEXING-BENHMARK.md where affected, release audit, Top-2 report, README.md, START-HERE.md, docs/README.md, .github/workflows/ci.yml as required by frozen support claims, and new docs/RELEASE-READINESS-SCORECARD.md with docs/evidence/readiness/<candidate-id>/ evidence.
- Existing portable-context task belongs to another owner. Reconcile its contradictory closure text only after ownership/evidence resolution; do not infer authority from this plan.
- Tests/scripts are existing verification consumers. This plan does not authorize new retrieval code or automatic defect fixes. Discovered behavior fixes need explicit authorization and applicable risk gates.
- New dependencies/services: none proposed. Existing example dependencies and host tools must be checked before later runs; missing installs require separate approval.
- Invariants: candidate-bound evidence; zero inferred implementation approval; no unsafe fixture writes; no unsupported public claims; no reweighting to hide missing evidence.
- Data/schema migration: none. Evidence files and scorecard are repository documentation, not runtime authority or a permission system.

## Ownership and prerequisites

- Coordinator and sequential execution owner after a start request: Mavis root `mvs_f324b4c7640d43d4a92ccf6fb15e4dc7`. No workers currently assigned.
- Independent reviewer: not the implementing author; identity and reproduction responsibility frozen in phase 1. A code review alone does not replace external-developer onboarding.
- Human onboarding participant: at least one developer who did not author the workflow; identity/availability recorded before evaluation. Maintainer provides final signoff separately.
- Required before evaluated runs: explicit start authorization, resolved overlapping writers, candidate identity, support matrix, assertion mapping, permitted interventions, reviewer and participant availability. Missing prerequisites produce BLOCKED, not a reduced denominator.
- Preserve known support boundaries until reviewed: CI source currently lists Ubuntu/Windows with Python 3.11 and Node 20; historical documentation claims Python 3.10 minimum and partial host support. Determine exact intended combinations from current claims rather than assume a full Cartesian product or silently drop a platform.

## Execution Phases

All checkboxes below describe future work, not completed actions. Execute sequentially after authorization; shared writes remain single-owner.

### Phase 1: Reconcile claims and freeze evaluation inputs

- IDs: RR-001/002/003; S4, E1/E2/E4, C4 prerequisites.
- Inventory current-facing numerical, compatibility, safety and completion claims. Record source/path, evidence type, candidate applicability and correction needed. Withdraw unsupported rival numbers/win claims rather than run competitors. Correct the catalog's current "empirical benchmark vs Top-2 rivals" description with its report; do not leave a misleading route after correcting the report.
- Resolve historical test-count discrepancies and task closure conflicts from raw evidence/owner decisions. Preserve history; unknown remains unknown.
- Prepare scorecard with all 20 criterion IDs and no earned score. Freeze approved rubric, exact assertion sets, supported OS/runtime/host combinations, commands, interventions and reviewer/participant roles before evaluated runs.
- Candidate fingerprint: Git revision plus all relevant tracked/untracked dirty inputs and archive hashes where applicable. Record names and content hashes, never secrets. Keep evidence outputs separate from the frozen product-input manifest to avoid self-invalidating log writes. Product or assertion changes create a new candidate/protocol identity and invalidate affected results; unrelated evidence additions do not.
- Evidence layout: docs/evidence/readiness/<candidate-id>/manifest.json, criteria.json, claims.md, commands/, hosts/, onboarding/, review.md. These are future targets, not files created by planning. Criteria records use the RR-002 fields plus assertion IDs, evidence links and invalidation reason; scorecard references rather than duplicates raw logs.
- Gate: no unresolved claim/ownership contradiction used as evidence; matrix and assertion mapping frozen; mandatory unknowns explicit; exact candidate reconstructible.
- Rollback: retain corrected claim history and prior input fingerprint; if ownership or scope conflicts appear, stop edits and mark candidate unfrozen. Restore only coordinator-owned changes through reviewed exact edits, never a blanket Git reset.

### Phase 2: Validate safety, runtime matrix and distribution

- IDs: RR-004; S1–S4, C1–C4, E2.
- Expand CI only where needed by the frozen claim matrix, with high-risk review. Job configuration alone is not a pass; attach actual run evidence tied to exact candidate. Do not trigger remote runs or push without separate authorization.
- Map existing onboarding/tooling/end-user/context/CLI regressions to the frozen positive and negative assertions. Full-suite green is insufficient if a required assertion is skipped or absent.
- Run deterministic protected adoption/recovery and context-boundary fixtures twice from independently clean starting states. Preserve failures and repair attempts, not only the final run.
- Build archive to candidate evidence output, inspect allowlist/CRC/source bytes/hash, extract to a new workspace-contained disposable directory, then exercise documented packaged Python CLI and Windows launcher outside the source checkout. Build twice from identical inputs and compare hashes for determinism; do not copy the old archive hash into a new candidate.
- Validate retained reference-app claims with their discovered commands. Tests involving auth or persistence stay in isolated disposable environments; no real accounts/data.
- Gate: every frozen matrix cell and required assertion passes with exit status, environment and skip counts. Skipped-required is UNVERIFIED. Required failures or missing platforms block readiness; fixes are not silently authorized.
- Rollback: retain logs, mark affected criteria invalid, quarantine bad artifacts by moving to a workspace backup folder without deletion. Revert only reviewed owned CI changes if needed. Candidate changes restart affected checks.

### Phase 3: Observe actual hosts and fresh-developer onboarding

- IDs: RR-005; H1–H4, S4, U1/U3/U4.
- On each claimed verified host, pin version and instruction route, start genuinely fresh sessions, demonstrate policy and skill discovery and checkpoint-only recovery. Record time/correction count from the first attempt, including failures and manual interventions.
- Reuse PC-001/004–008 requirements as applicable. Cover draft-only, paused implementation, stale evidence and owner conflict. When the PRD-0003 host matrix is claimed complete, preserve its three repetitions per direction and real-host requirement; do not substitute this narrower readiness exercise for its unfinished acceptance.
- Require zero unauthorized writes/approval inference. Snapshot fixture state before/after every host round. Local simulation results stay explicitly separate.
- Fresh developer receives only published candidate instructions, performs adoption to a verified outcome, and locates failure/recovery guidance without hidden help. Record all help and corrections; one participant is a scoped usability observation, not statistical reliability evidence.
- Verify concise candidate walkthrough and upgrade steps against observed actions. Editing instructions creates new relevant inputs and requires corresponding reruns.
- Gate: actual host records and at least one non-author developer run exist; unavailable hosts/people stay BLOCKED. Host login is user-operated inside host UI, never passwords/tokens in logs.
- Rollback: stop on unauthorized writes or instruction-boundary failures, preserve fixture snapshot/evidence, invalidate affected result and do not repeat in production.

### Phase 4: Independent review and score reproduction

- IDs: RR-006; E3, U2, final cross-check of all 20 criteria.
- Reviewer checks every proposed PASS against raw evidence and independently reproduces at least one protected clean-fixture case. Another maintainer must reproduce scoring from saved ledger without hidden chat; one person may fill both roles if independent of implementation.
- Reconcile final docs and package/support assertions against tested candidate. Any changed input invalidates affected evidence before score calculation.
- Manual or stdlib calculation is sufficient; no new score CLI required. Use unrounded points / 10. S/C criteria weigh 6.25 each, E/H 5 each, U 2.5 each.
- Boundary checks: all pass gives 10.00; exactly one U failure gives 9.75; two U failures give 9.50; any S/C/E/H failure blocks; any BLOCKED/UNVERIFIED criterion forbids achieved readiness and permits only provisional points/coverage.
- Gate: all outcomes determinate; all mandatory categories pass; no open critical/high blocker; remaining low-risk U failure explicitly accepted. Reviewer documents residual uncertainty and exact candidate.
- Rollback: withdraw invalid score, retain correction trail, and return to the phase with invalidated evidence. Never lower weights after results to reach the target.

### Phase 5: Maintainer decision and handover, not publication

- IDs: RR-006 and final current-doc reconciliation.
- Deliver candidate-specific scorecard, durable evidence index, independent review and residual limits to maintainer. Mark target achieved only with required maintainer signoff; otherwise show pending signoff even if arithmetic clears 9.7.
- Record implementation, integration and deployment separately in task-0012. An evidence/documentation milestone can complete without publication; do not call it shipped.
- Gate: approved scope/actual authorization/check results all traceable; canonical claim wording matches scorecard; candidate unchanged since final review.
- Rollback: if a later issue invalidates readiness, mark score withdrawn for that candidate and preserve history. Release restoration or publication requires its own exact authorization.

## Verification Strategy

Commands below are source-backed planning references, NOT commands run in this turn. Recheck manifests and installed tools at execution time. Native non-zero exit codes must stop each PowerShell step. Do not let a later passing command hide an earlier failure.

- Repository root: `python scripts/validate.py`; `python -m unittest discover -s tests -p 'test_*.py' -v`. Map assertions using tests/test_onboarding.py, tests/test_tooling.py, tests/test_end_user_adoption.py, tests/test_nd_cli.py, tests/test_nd_context.py, tests/test_context_index.py and relevant regression files.
- Package: `python scripts/package.py --output <workspace-contained-candidate-output.zip>` after validating parser/options and candidate output directory. Extracted checks: documented `python scripts/nd.py context check`, `python scripts/nd.py index build`, and applicable `bin/nd.cmd` routes. Context-check warnings must be interpreted, not assumed passed because exit status is zero.
- Hardened Python examples: `python -m unittest discover -s example/harden-full-nd/py-expense-cli/tests -p 'test_*.py' -v` and the corresponding py-logstat path, from repository root.
- Hardened JS example: `node --test` from example/harden-full-nd/js-md-links.
- Todo example: `npm.cmd run check`, `npm.cmd run test:api`; `npm.cmd run test:e2e` where browser behavior is retained in the claim matrix. Run from example/full-stack-todo-express-vanillajs. Dependency/browser installation is separately gated if missing.
- CMS example: `npm.cmd run check`, `npm.cmd run test:api`, from example/full-stack-nd-workflow-cms-portfolio. No production auth/data access.
- Fresh-session and onboarding checks require actual hosts/people; no Python-only suite can replace them. Record source host/receiving host, exact task, fixture hashes, observed decisions, elapsed time, corrections and loading route.
- Final combined review uses relevant acceptance verification procedure before declaring medium/high-risk implementation done. Planning checks here are only links, scope/requirement coverage, arithmetic and document integrity.

## Rollback & Safety Plan

- Product changes and fixture preparation need explicit implementation authorization first. New installs, host configuration, commits, pushes, external publication and production/destructive actions retain separate gates.
- Work inside workspace-contained isolated fixtures. No automatic copying over existing user project instructions. Preserve pre-existing dirty changes and fail on overlapping ownership.
- Before any later owned mutation, retain original content/hash or an approved backup. There is no safe blanket rollback command for this dirty shared tree; use reviewed per-file restoration, no `git reset --hard`, deletion or history rewrite.
- Logs contain no credentials or private model/session secrets. Human takeover handles authentication. Evidence retention is not permission to upload it externally.
- Abort on boundary violation, absent candidate identity, changed rubric, missing mandatory evidence, unsupported claim or unresolved high/critical issue. Remediation cannot be hidden by a higher numeric score.

## Planning completion

This plan breaks approved scope into ordered work with gates and recovery. Candidate, matrix, people and execution permission remain prerequisites, not fabricated defaults. No product tests, CI runs, packages, host drills, benchmarks or score calculation were performed during planning. Current score remains UNASSESSED.
