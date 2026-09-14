# Task 0002: Adopt ND Workflow in Monorepo

> **Status:** wip  
> **Type:** workflow adoption increment  
> **Created:** 2026-09-15  
> **PRD:** `.agents/docs/prd/0001-tauri-universal-platform.md` (context baseline; no product behavior change authorized)

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
