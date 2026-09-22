---
id: "0011"
title: "ND adoption document closure and task routing"
status: in-progress
last-audit: 2026-09-23
---

# Change Proposal: Reviewable closure for ND project adoption

Five additive edits to the shipped adoption guidance of the retained `packages/nd-workflow` package,
so that an adoption ends with a closure view a reviewer can read in one place: which documents are
canonical, which task tracks real work on each, whether an optional layout was chosen, and how to
read the expected ambiguity in `context check` output.

## Problem and scope

- **User / problem / desired outcome:** an existing project adopted into ND Workflow can finish with
  the user unable to tell which documents survived consolidation, whether follow-up work should be a
  `task-*`/`done-*` record, or whether an old path still exists. The `9router-rust` adoption of
  2026-09-23 recorded exactly this friction: the migration checklist already covered inventories and
  link repair, but nothing answered those questions in one compact view, and `context check`'s
  accurate `ATTENTION` result with several open tasks read as "adoption incomplete".
- **In scope (approved):** ADC-01 – ADC-05 below, in
  `packages/nd-workflow/.agents/skills/nd-setup-project/references/document-migration.md` and
  `packages/nd-workflow/docs/ONBOARDING.md`, plus one consistency repair in
  `packages/nd-workflow/docs/plans/README.md`.
- **Non-goals:** rewording or removing existing checklist rules; a mandatory folder taxonomy; creating
  tasks because documents exist; new CLI options, generated output, schema, or test artifacts; edits
  to `nd-setup-project/SKILL.md`; any distribution, release, or publication step; any edit to the
  upstream repository.
- **Removed from the originally proposed scope (recorded, not silently dropped):** the three-phase
  structure was reduced before implementation because Gate A/B review, per-file dispositions, pre-move
  link repair, and the final report already exist (`document-migration.md:15`, `:18`, `:20-28`,
  `:40-46`, `:50`, `:54`, `:62`), and the proposed Phase 3 scenario test contradicted the plan's own
  "add code only if a concrete gap remains" rule.
- **Open questions:** none blocking. The one accepted trade-off is recorded under Design impact.

## Approval record

- **Scope approval:** approved (narrowed revision).
- **Approver / decision date:** repository owner, 2026-09-23.
- **Exact approved scope:** ADC-01 – ADC-05 as written below, in the two named content files, plus the
  `docs/plans/README.md` link repair; nothing else.
- **Exclusions:** the discarded three-phase structure, the Phase 3 scenario test, `SKILL.md` edits,
  CLI/manifest/test changes, upstream edits, and any publish step.
- **Approval evidence:** the owner's structured decision of 2026-09-23 in the drafting session —
  target = the narrowed revision of `plan-0005-adoption-document-closure.md`; home = the retained copy
  in this repository; execution = start, after closing `wip-0015` first. Recorded in the plan's
  Status block as well.
- **Execution authorization:** granted together with scope approval for this documentation-only
  change, and limited to the paths above.
- **Scope changes since approval / renewed decision needed:** none. Any edit outside the named paths,
  or any change to an existing rule rather than an addition, returns this proposal to draft.

## Canonical targets and baseline

- **Canonical targets:** `packages/nd-workflow/.agents/skills/nd-setup-project/references/document-migration.md`
  (ADC-01, ADC-02, ADC-03, ADC-05), `packages/nd-workflow/docs/ONBOARDING.md` (ADC-04), and
  `packages/nd-workflow/docs/plans/README.md` (repair). Both content files are in the distribution
  manifest (`package-files.json`, entries for `document-migration.md` and `docs/ONBOARDING.md`), so
  they ship in the npm tarball and the ZIP.
- **Baseline revision and file state:** repository `main` at `687cb95`; the feedback record
  `packages/nd-workflow/.agents/feedback/20260923-021221-adoption-document-closure.md` and
  `plan-0005-adoption-document-closure.md` are uncommitted work of the 2026-09-23 Codex session.
- **Baseline measurement the plan must move:** `python scripts/validate.py` reported **1 error** —
  `docs/plans/README.md:5: linked file omitted from distribution manifest` — because the uncommitted
  README edit linked a maintainer-local plan that is not in the manifest. Expected after: 0 errors.
- **Integration owner / related concurrent changes:** the repository owner; the concurrent Codex
  session's plan and feedback are inputs, not competing writers.

## Requirement changes

### ADDED

**ADC-01 — Life-cycle link in the closure view.** Given a consolidation inventory, when a document has
real implementation or acceptance work, then the inventory records the task path
(`todo-*`/`wip-*`/`blocked-*`/`done-*`) that tracks it; when no such work exists, then the column reads
`none` rather than implying a task.

**ADC-02 — A document is not a task.** Given a canonical document adopted into the project, when the
migration completes, then no task is created merely because the document exists; a `blocked-*`
deployment task does not authorize deployment.

**ADC-03 — Optional layout decision at Gate A.** Given documents that may be reorganised, when Gate A
runs, then it asks explicitly whether the existing layout stays or an optional category layout improves
navigation, and Gate B still requires exact source/destination paths and link consumers before any
move.

**ADC-04 — Reading `context check` ambiguity.** Given complete checkpoints and more than one open task,
when `context check` reports `ATTENTION` with an `ambiguous` list, then the adoption guidance explains
that this is accurate output rather than incomplete adoption, and that a successor must name an exact
task path to resume.

**ADC-05 — Bounded stale-reference audit.** Given approved moves, when closure is verified, then the
audit covers the adopted project's owned docs and source, excluding or explaining historical recovery
evidence and independent vendored subtrees, and inspects relative Markdown links.

### MODIFIED / REMOVED

- None. Every edit is additive; no existing rule is reworded or retired.

## Design impact and decisions

- **Files and contracts:** two shipped guidance documents, one maintainer-local README, and the
  unchanged `nd-setup-project` four-state output contract (`SKILL.md:30`, `ONBOARDING.md:48-53`,
  `document-migration.md:60`). The new closure column and `context check` explanation must not replace
  or weaken that contract — ADC-04 is explicitly additive prose beside it.
- **Accepted trade-off (divergence):** the fix lands in the retained copy, which is this repository's
  publish source for `@next-mmo/nd-workflow` (`.github/workflows/release.yml` validates and publishes
  the packaged tarball), so npm consumers receive it at the next release. The upstream GitHub
  repository at pinned revision `04d875d` is not updated; a later pinned re-import would overwrite
  these edits. Accepted by the owner on 2026-09-23 in preference to writing outside the workspace.
- **Rejected alternative — implement only upstream:** correct provenance, but it does not reach npm
  consumers until a re-import and requires writing outside the project workspace.
- **Rejected alternative — ship the plan with the package:** adding `plan-0005` to the manifest would
  make the README link valid, but plans 0003 and 0004 are deliberately maintainer-local, and the
  package tarball gains nothing from an implementation plan for its own instructions.
- **Validation consequence:** `scripts/validate.py` requires every relative link from a manifest file
  to resolve to another manifest file. These edits add no new inter-file link; the repair removes the
  single violating link, which is why the validator goes from 1 error at baseline to 0.
- **Trust boundaries and data:** no runtime behavior, no privileged path, no persistent data.

## Acceptance and delivery

Every criterion passed on the verified tree before the commit; the commands and their output are
recorded in the governing task, `docs/tasks/done/done-0017-adoption-document-closure.md`.

- [x] `python scripts/validate.py` from `packages/nd-workflow` reports **0 errors** (baseline was 1).
- [x] `python -m unittest tests.test_tooling tests.test_end_user_adoption` passes, confirming manifest
      closure over the edited files and that `docs/ONBOARDING.md` remains excluded from end-user
      adoption.
- [x] `pnpm workflow:check` and `pnpm docs:check` pass at the repository root, with the change
      attributed to one active `wip-` task carrying this PRD reference, acceptance criteria, and a
      non-empty evidence ledger.
- [x] Each of ADC-01 – ADC-05 is present in the named file, additive only, with no existing rule
      reworded or removed; verified by inspecting the diff, not by intent.
- [x] The four adoption states remain separately reported and are not collapsed by the new closure
      view.
- **Risk / required approvals / rollback constraints:** Medium (shared workflow guidance inside a
  distributed package; reviewed and approved by the owner on 2026-09-23). Rollback is reverting the
  edits to three files; no persistent data, migration, or deployment is involved, and no publication
  is part of this change.
- **Current-doc reconciliation plan:** after verification, update the plan's Status block and the
  governing task with results, correct `docs/plans/README.md` if the plan's location changes, and
  leave the feedback record as history. Upstream divergence is recorded here rather than resolved.
- **Implementation, integration, and deployment gates:** implementation = the three file edits;
  integration = the package validator, the affected package tests, and both repository gates on the
  final tree; deployment = **not applicable** (no release or publication is authorized by this PRD;
  the edits ship with the next release that validates them). Landed 2026-09-23 as `d737c1b`, with the
  records in `4d63caf`. This PRD stays `in-progress`: it reaches consumers only when a release
  publishes the package, and no release is authorized here.
