# Task 0002: Adopt ND Workflow in Monorepo

> **Status:** wip  
> **Type:** workflow adoption increment  
> **Created:** 2026-09-15  
> **PRD:** `.agents/docs/prd/0001-tauri-universal-platform.md` (context baseline; no product behavior change authorized)

## Checkpoint Fields (ND)

- Owner: repository maintainers
- Scope approval: Gate B approved 2026-09-15 (adoption, baseline `8e5468f`); ND taxonomy-fix scope approved 2026-09-15 via questionnaire `ask_fbb343c7fb0d8063fb6b6c9b`.
- Execution authorization: adoption verification, dependency install, ND taxonomy fix, and cache rebuild approved 2026-09-15.
- Exact next action: re-run `pnpm nd:doctor` and `node packages/nd-workflow/bin/nd.mjs context check` after the classifier patch; hand results to human review.

## Outcome

Tauri Universal adopts ND Workflow as the primary repository delivery workflow. The in-tree package `packages/nd-workflow` is retained and its canonical skills, templates, project orientation, and doctor diagnostics are active at the repository root.

## Change Contract

- **Human outcome:** Developers and agents deliver work using ND risk tiers (Low, Medium, High, Critical), explicit spec/approval gates, doctor diagnostics (`pnpm nd:doctor`), and evidence convergence (`nd-converge-check`, `nd-compound`).
- **Acceptance evidence:**
  - Backups created in `.nd-workflow-adoption/backups/`.
  - `.agents/docs/ARCHITECTURE.md` case-normalized, preserving all monorepo architecture contracts and boundaries.
  - `.agents/docs/PROJECT.md` documents verified monorepo facts, commands, and boundaries without placeholders.
  - `.agents/docs/WORKFLOW.md` defines risk-scaled delivery.
  - 9 canonical skills installed under `.agents/skills/` and tracked in `.agents/skill-selection.json`.
  - 4 templates available under `.agents/templates/`.
  - `pnpm workflow:check` and `pnpm docs:check` pass.
  - `pnpm nd:doctor` runs clean diagnosis.
- **Non-goals:** Do not alter application runtime code, do not delete existing PRDs or historical task evidence, do not push or publish.
- **Affected layers:** `AGENTS.md`, `CONTEXT.md`, `.gitignore`, `package.json`, `.agents/docs/`, `.agents/skills/`, `.agents/templates/`.
- **Risk:** Medium (shared workflow adoption); user approval granted at Gate A and Gate B.
- **Baseline:** Pre-existing working tree was clean at commit `8e5468f`.
- **Recovery:** Restore files from `.nd-workflow-adoption/backups/` and remove added skills/templates.

## Acceptance Criteria

- [x] ND classifies `.agents/docs/tasks/` (wip-/blocked- active, done/ historical, README policy) with regression coverage in `packages/nd-workflow/tests/test_context_index.py`.
- [x] `node packages/nd-workflow/bin/nd.mjs context check` reports `status: READY`, `checkpoint: COMPLETE` with no missing fields.
- [x] `pnpm nd:doctor` reports `context_health: READY` / `COMPLETE` with cache `OK` and `FRESH`.
- [x] `pnpm workflow:check` and `pnpm docs:check` pass with the taxonomy change and this task file in place.
- [x] Superseded Agent Workflow Scrum skills removed (`agent-workflow-scrum`, `agent-workflow-prose`) with budget/link/report references pruned; `pnpm workflow:check --strict-budget` and `pnpm docs:check` stay green.
- [ ] Human reviews and accepts the ND taxonomy change for the standalone `@next-mmo/nd-workflow` package.

## Scoped extension: ND taxonomy alignment (approved 2026-09-15)

Scope approved via questionnaire `ask_fbb343c7fb0d8063fb6b6c9b` (option: full fix). Adds `.agents/docs/tasks/` classification parity to `packages/nd-workflow/scripts/context_index.py`, matching regression tests, a `.gitignore` entry for `.nd-cache/`, and the checkpoint fields above. Risk: Medium (retained standalone workflow package). Recovery: revert `context_index.py`, `test_context_index.py`, `.gitignore`, and this task file's added sections.

## Scoped extension: superseded scrum skills retired (approved 2026-09-15)

Scope approved via questionnaire `ask_fcd9129d9537eeddce96a226` (option: skills only). Removed `.agents/skills/agent-workflow-scrum` and `.agents/skills/agent-workflow-prose` (moved to trash; recoverable), pruned `doc-budgets.json`, `workflow-check-core.mjs`, and `report.mjs` references, and de-linked retired reference paths in `suggestions/0001`. All PRDs, tasks, evidence, and guides remained at that time; the last scrum-era doc (`agent-workflow.md`) was retired by the extension below.

## Scoped extension: nd task routing parity (approved 2026-09-15)

Scope approved via questionnaire `ask_6370099b3d4eac8b3bd833fc`. `packages/nd-workflow/scripts/nd.py` `cmd_task` now prefers `.agents/docs/tasks/` when that board exists (default `docs/tasks/` unchanged), with regression test in `test_nd_cli.py` and an updated handover message. Smoke: scratch target produced `.agents/docs/tasks/wip-20260915-smoke-check.md`, no root `docs/`.

## Scoped extension: scrum-era doc retired (approved 2026-09-15)

Scope approved via questionnaire `ask_a086a3ab13de83224b091311`. Retired `.agents/docs/agent-workflow.md` (trash-recoverable) and pruned its four consumers: `report.mjs` document list, `workflow-check-core.mjs` link sources, `.agents/docs/AGENTS.md` fact-home table row, and `README.md` nav link (now points to `WORKFLOW.md`). Also removed the dead `model-recommend.md` entry from `report.mjs`. Report regenerated (17 documents); `workflow:check --strict-budget` and `docs:check` exit 0.

## Evidence Ledger

| Claim | Evidence | Result |
| :--- | :--- | :--- |
| Gate A user decision | Ownership: ND primary; Location: retain monorepo package | Recorded |
| Gate B user decision | Explicit confirmation of diffs, operations, and recovery plan | Approved |
| Backups secured | 6 files in `.nd-workflow-adoption/backups/` | Verified |
| Architecture preserved | `ARCHITECTURE.md` case normalized; monorepo boundaries intact | Verified |
| Project facts verified | `PROJECT.md` populated from actual source, commands, and pins | Verified |
| Delivery policy active | `WORKFLOW.md` defines risk tiers, spec gates, convergence | Verified |
| Skills and templates | 9 skills in `.agents/skills/`, 4 templates in `.agents/templates/` | Verified |
| ND taxonomy parity | `classify_path` maps `.agents/docs/tasks/`; new regression cases in `packages/nd-workflow/tests/test_context_index.py` | Verified |
| Package suites | `python -m unittest discover -s tests -p "test_*.py"` exit 0; `node --test tests/launcher.test.mjs` 5/5 pass | Verified |
| Checkpoint complete | `nd context check` → `status: READY`, `checkpoint: COMPLETE`, `active_tasks: [.agents/docs/tasks/wip-0002-adopt-nd-workflow.md]` | Verified |
| Cache rebuilt | `nd index build` → 65 entries (`active_task: 1`, `historical: 1`); `cache_freshness: FRESH` | Verified |
| Docs link repaired | `done-0001-adopt-agent-workflow-scrum.md` suggestion link now `../../suggestions/…`; `pnpm docs:check` exit 0 | Verified |
| Superseded skills retired | `agent-workflow-scrum` + `agent-workflow-prose` removed from `.agents/skills/`; budget/link/report references pruned; `workflow:check --strict-budget` + `docs:check` exit 0; report regenerated (19 documents) | Verified |
| Workflow naming cleanup | `.agents/docs` titles, task-board/suggestions guides, and `report.mjs` branding renamed to ND Workflow; `workflow:check --strict-budget` + `docs:check` exit 0; ND `context check` `READY`/`COMPLETE`/`FRESH` | Verified |
| nd task routing aligned | `cmd_task` prefers `.agents/docs/tasks/` when present; scratch smoke created `.agents/docs/tasks/wip-20260915-smoke-check.md`; package unittest + launcher suites exit 0 | Verified |
| Scrum-era doc retired | `.agents/docs/agent-workflow.md` trashed; 4 consumers pruned; dead `model-recommend.md` entry removed; report regenerated (17 documents); `workflow:check --strict-budget` + `docs:check` exit 0 | Verified |
