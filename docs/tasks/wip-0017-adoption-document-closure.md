# Task 0017: ND adoption document closure and task routing

> **Status:** wip
> **Type:** implementation
> **Created:** 2026-09-23
> **PRD:** `docs/prd/0011-nd-adoption-document-closure.md`

Implement the approved narrowed scope (ADC-01 – ADC-05) of `plan-0005-adoption-document-closure.md`
inside the retained `packages/nd-workflow` package: five additive edits to the shipped adoption
guidance, plus one consistency repair that the package validator currently rejects.

## Goal and scope

- Mode: implementation.
- Outcome / why: an ND adoption currently ends without a bounded closure view, so a user cannot tell
  which documents are canonical, which task tracks real work on one, whether their layout should
  change, or why `context check` reports `ATTENTION`. The `9router-rust` adoption of 2026-09-23
  recorded this friction as feedback rather than guessing a process change.
- Requirement or issue: `docs/prd/0011-nd-adoption-document-closure.md`, ADC-01 – ADC-05, approved
  (narrowed) 2026-09-23.
- Scope approval evidence / approver / date: repository owner, 2026-09-23, structured decision in the
  drafting session — narrowed revision as the target, retained copy as the home, start after closing
  `wip-0015`. Recorded in PRD 0011's approval record and in the plan's Status block.
- Execution authorization: granted with that decision, limited to the three named files. No release,
  publication, upstream edit, or CLI change.
- In scope: `packages/nd-workflow/.agents/skills/nd-setup-project/references/document-migration.md`
  (ADC-01, ADC-02, ADC-03, ADC-05), `packages/nd-workflow/docs/ONBOARDING.md` (ADC-04), and
  `packages/nd-workflow/docs/plans/README.md` (link repair).
- Non-goals: rewording existing rules; a mandatory folder taxonomy; `nd-setup-project/SKILL.md` edits;
  new CLI options, manifest entries, or test artifacts; upstream propagation; publishing.

## Ownership and integration

- Exact task path: `docs/tasks/wip-0017-adoption-document-closure.md`.
- Owner: repository owner as approver; implemented in the 2026-09-23 session.
- Branch/worktree and base revision: `main` at `687cb95`, uncommitted working tree shared with the
  concurrent Codex session's plan and feedback artifacts.
- Owned write paths: the three files above, this task, `docs/prd/0011-nd-adoption-document-closure.md`,
  `docs/prd/0000-prd-index.md`, and the closure edits to `docs/tasks/done/done-0015-verification-foundation.md`.
- Dependencies / outstanding workers: none blocking. The concurrent Codex session authored the plan and
  feedback; those files are inputs and are not rewritten by this task.
- Integration owner / shared files / merge order: repository owner; the plan and feedback records stay
  where their own conventions place them (package-local), while this repository's board owns the change
  because the edited paths are product paths.

## Plan and acceptance

- Steps: apply the five additive edits in the order listed in `plan-0005`; repair the README link;
  then verify with the package validator, the affected package tests, and both repository gates.
- [x] Observable outcome — required check: `python scripts/validate.py` reports 0 errors (1 at
      baseline) and `python -m unittest tests.test_tooling tests.test_end_user_adoption` passes
      (74 + 2 tests, OK).
- [x] Error or regression behavior — required check: `pnpm workflow:check` and `pnpm docs:check` pass
      at the repository root on the final tree, with this task owning the five product-path changes.
- Canonical behavior/architecture targets: `document-migration.md` and `docs/ONBOARDING.md` describe
  current guidance; the four adoption states (`SKILL.md:30`, `ONBOARDING.md:48-53`,
  `document-migration.md:60`) stay separate and are not collapsed by the new closure column.

## Acceptance Criteria

- [x] ADC-01: the inventory table carries a task-path field and the actions note explains it, with
      `none` for documents that have no tracking task.
- [x] ADC-02: the migration handoff section states that a canonical document is not itself a task and
      that a `blocked-*` deployment task does not authorize deployment.
- [x] ADC-03: Gate A carries an explicit optional-layout question, and Gate B still requires exact
      paths and link consumers before moves.
- [x] ADC-04: `docs/ONBOARDING.md` explains `ATTENTION` with an `ambiguous` list as expected output and
      requires an exact task path to resume.
- [x] ADC-05: the completion checklist names the stale-reference audit scope and its exclusions.
- [x] Every edit is additive: no existing rule reworded, removed, or contradicted (verified by diff).

## Evidence Ledger

- 2026-09-23 — Baseline before this task's edits: `python scripts/validate.py` from
  `packages/nd-workflow` reported **1 error**, `docs/plans/README.md:5: linked file omitted from
  distribution manifest`, caused by the concurrent session's uncommitted README link to the
  maintainer-local `plan-0005`. Recorded before editing so the repair is attributable.
- 2026-09-23 — Closure of `wip-0015`: `git log --format="%h %ci %s" -- vitest.config.ts` → `61fdd90
  2026-09-21`; `git show HEAD:vitest.config.ts` thresholds `statements 94, branches 87, functions 93,
  lines 96` match that task's claimed floors; `git ls-files "packages/*/test/*"` → 33 files. The task
  record's "not committed" statement was corrected and the file was moved to
  `docs/tasks/done/done-0015-verification-foundation.md` with `git mv`.
- 2026-09-23 — After the edits, `python scripts/validate.py` from `packages/nd-workflow` →
  **No errors**: `manifest_paths 0`, `hard_required 0`, `agents_word_count 448/450`, `utf8_links 0
  errors (files=47, relative_links=89)`, `skill_frontmatter 0`. The baseline error was resolved by the
  `docs/plans/README.md` repair.
- 2026-09-23 — Targeted package tests from `packages/nd-workflow`:
  `python -m unittest discover -s tests -p "test_tooling.py"` → **Ran 74 tests, OK**;
  `-p "test_end_user_adoption.py"` → **Ran 2 tests, OK**.
- 2026-09-23 — Full package suite: `python -m unittest discover -s tests -p "test_*.py"` → exit 0,
  **Ran 186 tests, OK (skipped=1)**; `node --test tests/launcher.test.mjs` → **5 pass, 0 fail**.
- 2026-09-23 — Repository gates on the final tree: `pnpm workflow:check` → passed, reporting
  "product synchronization: 5 product path(s)" attributed to this task; `pnpm docs:check` → passed,
  with only the pre-existing `AGENTS.md` headroom warning (780/800) that this change does not touch.
- 2026-09-23 — Additivity verified from the diff rather than from intent: `git diff -U0` over the two
  content files shows **14 insertions, 3 deletions**, and the three deletions are the inventory table
  header, its separator row (both extended with the `Task path` column) and the actions paragraph
  (extended with that column's rule). No existing rule was reworded, removed, or contradicted.

## Resume State

- Updated at / author: 2026-09-23, implementation session.
- Completed / partial / not started: complete — PRD 0011, this task, the plan revision, the `wip-0015`
  closure, the README repair, and all five content edits are done and verified in the working tree.
  Nothing is committed.
- Exact next action or command and working directory: owner review and commit of the change set, then
  move this file to `docs/tasks/done/done-0017-adoption-document-closure.md`, which frees the single
  in-progress slot for `todo-0013` or `todo-0016`. Until it is committed, this task deliberately keeps
  the slot: the change is in flight, and closing it first would leave the product-path changes
  attributed to `blocked-0006` by the fallback rule.
- Current hypothesis / blockers / decision needed: none blocking. The only judgement call was phrasing
  that stays additive; the plan's abort signal never triggered.
- Decisions and rejected approaches with reasons: PRD 0011 records why the three-phase draft was
  reduced, why the fix lands in the retained copy, and why the plan is not added to the distribution
  manifest. One further decision: no cross-reference link was added from `document-migration.md` to
  `docs/ONBOARDING.md`, because the approved scope did not include one and the two documents address
  different readers.
- Current revision and uncommitted work location/fingerprint: `main` at `687cb95` plus uncommitted
  changes across `docs/` and `packages/nd-workflow/`; the plan and feedback records are uncommitted and
  were authored by another session.
- Evidence still valid / invalidated and why: all evidence was produced on this tree and stays valid
  until the change set is edited or committed elsewhere; the `wip-0015` commit evidence is immutable
  Git history.
- Relevant source, docs, and output paths: the three target files, `scripts/validate.py`,
  `tests/test_tooling.py`, `tests/test_end_user_adoption.py`, `.agents/scripts/workflow-check-core.mjs`.
- Successor ownership transfer / outstanding coordination: the narrowed plan and the implemented edits
  should be reported back to the 2026-09-23 Codex session that drafted the original plan; its feedback
  record is retained unchanged as history.

## Verification and closure

- Criterion / command or inspection / result / evidence location: recorded per criterion in the
  Evidence Ledger above, run from `packages/nd-workflow` and the repository root on Windows.
- Tested state and relevant environment: Windows 10, Node, pnpm, Python 3.11 from the repository
  checkout; no application build is involved.
- Combined-state checks and integration result: both repository gates run on the final tree together
  with the package validator, so the change is checked in its combined state rather than per file.
- Current-doc reconciliation result / conflicts resolved: the plan's Status block records the narrowed
  scope; PRD 0011 records the divergence from upstream; `docs/prd/0009` and PRD 0010 had their
  `wip-0015` path references corrected to the `done/` location after the move.
- Optional durable learning updated, corrected, retired, or no-op: the durable lesson — a manifest file
  must not link outside the distribution manifest, which is why package plans are named rather than
  linked — is recorded in `docs/plans/README.md` where the next author will meet it.
- Failed / skipped / unverified checks and reasons: none. The full package suite (186 tests) and the
  Node launcher test (5 tests) both ran green, so no check was omitted that the change could affect;
  the run is recorded in the Evidence Ledger.
- Recovery plan / operations reference if relevant: revert the three content files; no persistent data
  or publication is involved. `docs/plans/plan-0005-adoption-document-closure.md` and the feedback
  record stay in place as the decision history.
- Implemented / integrated / deployed state and evidence: implemented and verified in the working tree
  — package validator 0 errors, 186 package tests plus 5 launcher tests green, and both repository
  gates passing on the final tree. Not committed, not published; release is outside this change.
- Status: active — all acceptance criteria pass and nothing is outstanding except owner review and
  commit, which is deliberately left to the owner rather than performed by the implementing session.
