---
id: "0005"
title: "Evidence-backed internal release readiness"
status: approved
last-audit: 2026-09-11
---

# Change Proposal: Make a 9.7 readiness target auditable

Approved scope version: v0.1. Internal policy, not an earned score or competitor ranking. Original approval authorized planning only; later local execution authorization is recorded below and in task-0012. Production release remains gated.
Drafting checkpoint: [task-0012](../tasks/task-0012-internal-release-readiness-spec.md).

## Problem and scope

- Outcome: maintainers can decide whether an exact release candidate meets an internal readiness target of at least 9.7/10 without inventing quality or performance claims.
- User-selected scope: internal release readiness; evidence gaps and release gates first; new retrieval features deferred. Requirements input: questionnaire `ask_f059c6030138f2d7ab503cec`, 2026-09-11. This is not scope approval.
- In scope: claim reconciliation, frozen scoring protocol, candidate-bound evidence, supported-environment validation, genuine host/user drills, independent review and a documented release decision.
- Non-goals: competitor runs/rankings, symbols, BM25, aliases, handover generators, tighter lookup defaults, new dependencies, product implementation, committing, pushing or publishing in this drafting task.
- Current score: UNASSESSED. Historical local passes are useful leads, not fresh candidate evidence. Feasibility: 9.7 is an attainable policy threshold in principle; current records cannot establish that this candidate can reach it, estimate effort, or guarantee success.
- Open operational inputs before execution: exact release candidate, pinned claimed OS/runtime/host matrix, human participant availability and independent reviewer. Proposed policy below is complete enough for scope review; these inputs must be frozen before evaluation.

## Approval record

- Scope approval: approved for PRD-0005 v0.1, RR-001 through RR-006 and the complete 25/25/20/20/10 scoring protocol below; minimum target 9.7 with mandatory gates.
- Approver / decision date: user, 2026-09-11.
- Exact approved IDs, exclusions and version: RR-001–RR-006, PRD-0005 v0.1; competitor trials and retrieval features excluded. Original requirements-through-delivery body SHA-256: `70379f2ab9f2a3db5818309d853584b334241dbea8f91356e2d69a074a0511f9` (UTF-8 text after `## Requirement changes`, LF-normalized, before approval-status annotations).
- Approval evidence: questionnaire `ask_98ed07f27c44a5b1c8984a87`, user selected "Approve v0.1 scope; prepare implementation plan only" in root session `mvs_f324b4c7640d43d4a92ccf6fb15e4dc7`. Earlier purpose/scope questionnaire was requirements input only.
- Execution authorization: original approval permitted planning only. Subsequent user "do it all", "do it" and "ship it your best now" authorize local correction, evaluation and candidate delivery; task-0012 records scope and limitations. No human participation, earned score, maintainer signoff or unspecified public release is implied. Plan: `docs/plans/plan-0005-internal-release-readiness.md`.
- Scope changes since approval: none. Approval-status annotations do not alter requirements or scoring. Any material scoring, support-matrix or exclusion change requires a new reviewed version; no post-result weight tuning.

## Canonical targets and baseline

Baseline: `main` at `c7dd5c4ddd3ee455ac058d4da8f0fc718e28c96d`, plus pre-existing dirty work on 2026-09-11. Source and pending edits take precedence over historical reports.

- [BENHMARK.md](../../BENHMARK.md), sections "Score status" and "9.7 challenge acceptance checklist": canonical claim boundary. SHA-256 `E7CC54A4F32601DCF32186DFB9350AB74A57F7AF34DC4E2F66DA2972310E3457`.
- [Release audit](../RELEASE-READINESS-AND-BENCHMARK-AUDIT.md), verification matrix and release checklist: historical observations requiring reconciliation. SHA-256 `2068ED928A16EC4D53FD08914AB3B61EF5A96D7561F389961A0AC6AB2ADDFE22`.
- [Top-2 report](../TOP2-COMPETITIVE-BENCHMARK-AND-HARDENING.md), sections 2–6: pending claims requiring correction, not authority for competitor results. SHA-256 `E21927395CD2DEEC48F78F8D613469347791200D1079A0B35FDD85875D6B307C`.
- [CI](../../.github/workflows/ci.yml), `validate-and-test` matrix; README and START-HERE support claims; existing CLI/tests and package manifest remain implementation truth.
- [PRD-0003](prd-0003-portable-context-and-doc-index.md), PC-001, PC-004–PC-008 and existing acceptance: reuse required scenarios/evidence; do not supersede its approval or declare its missing host coverage complete.
- [Portable-context task](../tasks/wip-0007-portable-context-implementation.md), Resume State and closure: owner must reconcile contradictory status before release evidence relies on it.
- New capability: formal internal scoring protocol and candidate scorecard have no baseline. Intended current-doc target after approval/execution: `docs/RELEASE-READINESS-SCORECARD.md`, linked from catalog and BENHMARK.md.
- Integration owner: Mavis root session `mvs_f324b4c7640d43d4a92ccf6fb15e4dc7` for this draft and its catalog entry only. Existing implementation ownership is unchanged. Recheck hashes and coordinate before editing shared implementation/report targets.

## Double-check findings

1. BENHMARK.md explicitly withdraws 9.5 and says 9.7 is a target. Its three outstanding challenge areas are repeated independent testing, real host UX and fair comparison. Fair comparison is not required for this new internal score; it remains unverified and cannot be relabeled passed.
2. Top-2 report gives competitor disk/time estimates and definitive wins without comparative runs. `scripts/bench_top2.py` measures ND only, once per project with one query; it cannot substantiate rival figures, recall or generalized superiority. The report's blanket rival claims also conflict with BENHMARK.md's documented tradeoffs. No upstream fact audit was performed in this task.
3. Historical release audit records 166 tests while current BENHMARK.md records 168. Neither count was reproduced here. Fresh candidate evidence must replace ambiguous counts rather than combining them.
4. Current CI source lists Ubuntu and Windows, Python 3.11, Node 20. File presence proves neither successful runs nor macOS/Python 3.10 coverage. Do not treat the older audit's "set up CI" item as proof that no CI exists.
5. Read-only `python scripts/nd.py context check` returned ATTENTION, revision MISMATCH and STALE cache. Task fields exist but completion/authorization wording conflicts. Its 1,711-character / approximately 428-token output is a heuristic, not billed usage or a score.
6. Eight host handovers on Codex/MiniMax Code are recorded historically; Claude Code/Cursor remain blocked in those records. The 18-case local simulation is not host execution. No host sessions were run here.

## Requirement changes

### ADDED

### RR-001 — Freeze an internal score contract

Before evaluation, save rubric version, candidate identity, support matrix, assertion-to-test mapping, reviewer and permitted interventions. Compute score only under the frozen rubric below. Label it "internal release-readiness score", never coding success probability, certification or competitive performance.

Given a requested 9.7 target with no complete evidence ledger, when preparing a release decision, then report UNASSESSED/PROVISIONAL and remaining blockers, not an earned score. Given a later rubric change, invalidate the old comparison and evaluate a new version.

### RR-002 — Candidate-bound evidence ledger

Each criterion records status (PASS, FAIL, BLOCKED, UNVERIFIED), date, owner/reviewer, command or observed action, environment versions, candidate revision and dirty-state/file hashes, exit status, pass/fail/skip counts, durable repo-relative evidence location, and limits. Store sanitized logs under `docs/evidence/readiness/<candidate-id>/`; link the scorecard through the existing catalog. Do not depend solely on ignored scratch output. Relevant changes invalidate affected evidence and its score contribution.

Given an old green run or a changed input, when evaluating the candidate, then mark affected evidence unverified until rerun. Given a secret-bearing log, redact it before retention; never publish credentials. A skipped required assertion is not PASS, even when the command exits zero.

### RR-003 — Reconcile claims before release scoring

Classify claims as observed, historically recorded, documented upstream, hypothetical, proposed or unverified. Withdraw unsupported rival numbers/winner claims from current-facing reports, preserving a correction record. Reconcile counts, support wording and task status from evidence, not by choosing the more flattering document. Preserve the existing score and token-saving caveats.

Given ND-only timing data, when editing a comparison, then retain only its narrow ND measurement and mark rival metrics unmeasured. Given a conflicting completion record, then obtain owner/evidence reconciliation rather than infer approval. Missing comparative evidence remains a separate limitation, not an internal readiness failure if no comparative claim is made.

### RR-004 — Verify declared release surfaces

Freeze every claimed OS/runtime/host combination before runs. Include the claimed minimum Python runtime; expand existing CI only as needed to verify the declared matrix. CI changes require high-risk planning and review; configured jobs alone earn no credit. Exercise full relevant suites, safe adoption/recovery, packaged-user CLI and retained reference-app claims on the candidate. Run deterministic protected fixture checks twice from independent clean starting states and retain failures/retries.

Given unavailable macOS, minimum-runtime or host evidence, then mark that claim unverified; do not silently shrink the denominator. Narrowing supported scope requires explicit maintainer approval and matching documentation, preserving excluded surfaces visibly. Safety boundary failures always block release, regardless of score.

### RR-005 — Observe real onboarding and handover

Reuse PC-001/004–008 where applicable; this draft adds evidence completeness and release interpretation, not new retrieval algorithms. On each host claimed verified for this candidate, record pinned version, real fresh-session loading, policy/skill discovery and correct task recovery. Use draft-only, paused-implementation and stale-evidence/owner-conflict cases. Zero unauthorized writes or inferred approvals. Run at least one onboarding round with a developer who did not author the workflow; provide published instructions only and record elapsed time, corrections and missing context without claiming statistical generality.

Given an unavailable host or participant, then report BLOCKED, not simulated success. Host authentication stays with the user in the host UI; no credentials in transcripts. Historical host runs can guide scenarios but cannot establish current candidate coverage.

### RR-006 — Independent release decision and recovery

A reviewer other than the implementing author checks each claimed PASS against raw evidence, performs at least one independent clean-fixture reproduction, and checks critical failures and residual limits. Final scorecard records candidate, rubric, score, coverage, unresolved issues and reviewer decision. Maintainer separately signs off release. A measured score does not authorize installation, commit, push, tag or publication.

Given score above threshold but a mandatory gate fails, then release remains blocked. Given invalidated evidence or a bad package, then withdraw readiness claim, retain evidence/correction history, restore the prior verified artifact only through authorized operations, and rerun affected checks.

## Proposed scoring protocol v0.1

Approved normative protocol v0.1; evaluation not executed. Five categories total 100 points. Each category has four equal-weight, binary criteria. A criterion passes only when its full frozen assertion set passes with candidate-bound evidence; test counts do not affect weights. Partial, blocked, skipped-required or unverified criteria earn zero provisional points and remain visible. No N/A reweighting.

| Category | Weight | Four scored criteria |
|---|---:|---|
| S — Safety and recovery | 25 | S1 reviewed adoption preserves collisions/custom instructions; S2 failed/interrupted adoption has demonstrated recovery; S3 link/path escape and unsafe-write cases rejected; S4 draft/ownership/authorization boundaries preserved in negative scenarios |
| C — Correctness and distribution | 25 | C1 full relevant regressions pass; C2 deterministic protected fixtures pass twice from clean starts; C3 archive allowlist, hashes and extracted-user CLI pass; C4 every frozen OS/runtime cell and retained reference-app claim has passing checks |
| E — Evidence and claim integrity | 20 | E1 all retained public claims classified and supported within stated limits; E2 raw logs bound to candidate and environment with failures/skips retained; E3 independent review and clean-fixture reproduction completed; E4 current docs, task state, support matrix and package evidence reconciled |
| H — Real host and user operation | 20 | H1 real fresh-session loading and skill discovery on every claimed verified host; H2 correct checkpoint-only recovery on those hosts; H3 stale/draft/conflict cases pass without unauthorized actions on those hosts; H4 external-to-authorship developer completes fresh onboarding to verified outcome with intervention record |
| U — Usability and reproducibility | 10 | U1 every observed user/host run records elapsed time and correction count; U2 another maintainer reproduces score from durable ledger without hidden chat; U3 onboarding participant can find documented failure/recovery path without unpublished guidance; U4 candidate-bound concise walkthrough and upgrade instructions are verified against observed actions |

- Points per PASS: S/C 6.25 each; E/H 5 each; U 2.5 each. Score = total points / 10, reported to two decimals. Never round upward to cross threshold.
- Target met only if unrounded score >=9.7, all criteria have determinate PASS/FAIL outcomes, all S/C/E/H criteria PASS, no open critical/high release blocker, and maintainer signoff is recorded. U failures may be explicitly accepted low-risk limitations; unavailable evidence is not an accepted failure.
- Under these weights, 19 PASS with only one U failure gives 97.5 points = 9.75; two U failures give 95 = 9.50 and miss target. All PASS gives 10.00. A single safety failure blocks release even if arithmetic is high.
- Incomplete evidence permits only a provisional verified-points subtotal, evidence coverage count out of 20, and blocker list. It cannot be presented as achieved readiness. No current subtotal is computed from historical records in this draft.
- These weights express internal priorities, not empirical calibration. Reaching 9.75 is not a 97.5% success rate and says nothing about being better than another workflow. Exact 9.70 need not be representable; 9.7 is a minimum target.

## Design impact and decisions

Evidence first, not feature accumulation. Reuse existing tests, scripts, host drills and approval boundaries. No new runtime component is required by this scope. Any discovered behavior defect follows existing risk gates in a separately authorized fix; new product scope returns to specification.

Proposed sequence after approval and separate start authorization: reconcile claims/ownership; freeze candidate and assertion matrix; validate platforms/package/protected fixtures; complete real-user/host evidence; independent review; calculate score and record release decision. Do not spend on competitor trials for an internal score. Do not claim external superiority as a substitute for missing UX evidence.

## Acceptance and delivery

- [ ] RR-001: frozen rubric and support matrix exist before evaluated runs; worked boundary cases produce 9.75 / 9.50 and block on mandatory failures.
- [ ] RR-002/003: each retained claim and scored criterion has candidate-bound evidence; contradictory counts and unsupported comparisons resolved; secrets absent.
- [ ] RR-004: all declared matrix cells, relevant suites and extracted-package paths verified; skip/retry/invalidation cases remain explicit.
- [ ] RR-005: actual host and independent-developer runs recorded; simulations and missing access never counted as host PASS.
- [ ] RR-006: independent reviewer reproduces one protected case and checks score; maintainer signs off separately; no score implies permission to publish.
- Risk: drafting is low-risk prose. Later CI/shared verification work is high risk; safety behavior fixes can be critical. Require approved plan, risk-appropriate positive/negative checks, independent review and recovery record before execution.
- Current-doc reconciliation: compare recorded baselines before edits, resolve concurrent ownership, update current reports and links only from fresh evidence. This draft changes no existing behavior or claimed score.
- Delivery gates: specification delivered for review; implementation not authorized; integration/evaluation not performed; deployment not applicable to this drafting deliverable. Release remains pending separate authorization and evidence.
