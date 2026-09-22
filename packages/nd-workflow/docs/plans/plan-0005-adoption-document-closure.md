# Technical Plan: Adoption document closure and task routing

> **Status:** approved, narrowed revision — 2026-09-23. The original three-phase draft written by the
> 2026-09-23 Codex session was reviewed the same day and reduced to the five items below before any
> implementation: three of its proposed behaviours already exist in the migration checklist, and its
> Phase 3 test artifact contradicted its own "add code only if a concrete gap remains" rule. The
> review, the removed scope and the approval are recorded here rather than in a duplicate file.
>
> **Implemented** 2026-09-23: all five items landed additively in the two content files, plus the
> `docs/plans/README.md` link repair. Verified from `packages/nd-workflow` with
> `python scripts/validate.py` (0 errors, from 1 at baseline) and the full package suite (186 tests,
> OK); verified at the repository root with `pnpm workflow:check` and `pnpm docs:check`. The governing
> record is the repository task `docs/tasks/wip-0017-adoption-document-closure.md`; the change is not
> yet committed.

## Objective & Context

- Mode: implementation, authorized — documentation-only edit of the package's adoption guidance. No
  CLI, schema, generated-output or test change.
- Source: [feedback record](../../.agents/feedback/20260923-021221-adoption-document-closure.md) from
  the 2026-09-23 `9router-rust` adoption.
- Requirement IDs: `docs/prd/0011-nd-adoption-document-closure.md` in the repository root, ADC-01 –
  ADC-05. The governing task is `docs/tasks/wip-0017-adoption-document-closure.md` there too: the
  edited paths live under `packages/`, so the monorepo board owns this change and the package board
  does not duplicate it.
- Approval: user decision of 2026-09-23, recorded in PRD 0011's approval record — narrowed scope,
  retained copy as the home, permission to start after closing `wip-0015`. It excludes the removed
  phases, the Phase 3 scenario test, any upstream edit, and any CLI change.
- Outcome: an adopting agent can answer "where is the current document?", "what work is done or
  blocked?" and "did old links survive?" from one bounded closure view, with no new machinery and
  without turning documents into tasks.
- Current behavior: the [document migration checklist](../../.agents/skills/nd-setup-project/references/document-migration.md)
  already mandates Gate A and Gate B review, per-file dispositions, pre-move link repair and a final
  report (`:15`, `:18`, `:20-28`, `:40-46`, `:50`, `:54`, `:62`). It does not state how a document
  relates to the task tracking its implementation, whether an optional category layout is wanted, or
  how to read the expected ambiguity in `context check` output.
- Divergence (recorded, accepted): this change lands in the retained copy only. The upstream
  repository `next-mmo/nd-workflow` at pinned revision `04d875d` is not updated, so a later pinned
  re-import of that revision would overwrite these edits.
- Non-goals: new CLI options or generated output; a mandatory folder taxonomy; creating a task because
  a document exists; retiring or rewriting existing checklist rules; any distribution or publication
  step; edits to `nd-setup-project/SKILL.md`, which already carries the four-state output contract.

## Architecture Impact

- Files touched — three content files, one consistency repair, this plan:
  - `.agents/skills/nd-setup-project/references/document-migration.md` (ADC-01, ADC-02, ADC-03, ADC-05)
  - `docs/ONBOARDING.md` (ADC-04)
  - `docs/plans/README.md` — repair only: its link to this plan fails `scripts/validate.py`, because a
    manifest file may not link to a file outside the distribution manifest (the plan is
    maintainer-local, like plans 0003 and 0004).
- Candidate checks: `python scripts/validate.py` from the package root, and the package tests that
  build fixtures from `package-files.json`. No new test artifact is added.
- New dependencies, runtime services, schema, data migrations, application behavior: none.
- Invariants: preserve existing canonical facts and historical evidence; category folders stay
  optional and reviewed; task files own lifecycle state; the setup CLI journal covers only its own
  writes; every relative link added from a manifest file must target another manifest file.
- Distribution effect: the two content files ship in the npm tarball and the ZIP; the plan and the
  feedback record remain local to the source package.

## Execution Phases

One phase, five items, all documentation. Each item is additive: no existing rule is reworded or
removed.

1. **ADC-01 — life-cycle link in the closure view.** Add one column, `Task path`, to the inventory
   table at `document-migration.md:15`, and extend the actions note at `:18` to say the column holds
   the `todo-*`/`wip-*`/`blocked-*`/`done-*` task that tracks real work on that document, or `none`.
   Gate: the column is present, the table stays a valid two-row Markdown table, and the disposition
   vocabulary is unchanged.
2. **ADC-02 — a document is not a task.** Add one sentence to the completion checklist (`:50-58`)
   stating that a canonical document is not itself a task, that a task is created only when
   implementation or acceptance work actually exists, and that a `blocked-*` deployment task does not
   authorize deployment. Gate: the sentence does not duplicate the task conventions of
   `nd-spec-feature` and `nd-user-testing`; it states the boundary once, where migration hands off.
3. **ADC-03 — optional layout question at Gate A.** Add a fourth Gate A question (`:24-26`) asking
   whether the existing layout stays or an optional category layout improves navigation, with exact
   paths and link consumers still required at Gate B. Gate: phrasing keeps the taxonomy optional and
   adds no mandatory folders.
4. **ADC-04 — reading `context check` ambiguity.** In `ONBOARDING.md`, extend the readiness section
   (`:46-57`) to explain that complete checkpoints with several open tasks are reported as `ATTENTION`
   with an `ambiguous` list, that this is accurate rather than an incomplete adoption, and that a
   successor must name an exact task path to resume. Gate: matches the implemented behavior in
   `scripts/context_index.py` and does not weaken the four separate adoption states.
5. **ADC-05 — bounded stale-reference audit.** Extend the completion checklist item at `:54` so it
   names the audit scope: the adopted project's owned docs and source, with historical recovery
   evidence and independent vendored subtrees excluded or explained, and relative Markdown links
   inspected after approved moves. Gate: no implication of a project-wide link enforcement mechanism.

## Verification Strategy

- Documentation gate: `python scripts/validate.py` from `packages/nd-workflow` — UTF-8, LF, final
  newline, no trailing whitespace, balanced fences, and every relative link resolving to a manifest
  file. Baseline before this change: **1 error**, `docs/plans/README.md:5: linked file omitted from
  distribution manifest`; expected after: 0 errors.
- Affected package tests: `python -m unittest tests.test_tooling tests.test_end_user_adoption -v`
  (fixture validation over the manifest, and the end-user adoption profile that excludes
  `docs/ONBOARDING.md` from adoption).
- Repository gates: `pnpm workflow:check` (the change must be attributed to one active `wip-` task
  with a PRD reference, acceptance criteria and evidence) and `pnpm docs:check`.
- User-visible acceptance: the checklist and onboarding text let a reader answer the three closure
  questions without reading the adoption transcript, and no existing rule is duplicated or weakened.

## Rollback & Safety Plan

- Rollback point per item: revert that item's edit alone; the items are independent additions to
  separate sections.
- Abort signal: stop if an item requires rewording or removing an existing rule, if the table breaks
  Markdown well-formedness, or if `validate.py` reports a link error after an edit.
- Data backup/restore: not applicable — no persistent data, no migration, no generated output. The
  files are tracked by Git, and the plan and feedback record are uncommitted and are not overwritten
  by this work.
- Irreversible operations: none. Implementation changes no CLI behavior, publishes nothing, and does
  not move documents in any project.
