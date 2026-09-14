# Task: Synthesize best-in-class agent workflow

## Context
- Goal: Upgrade starter with 2026 best practices (Superpowers TDD/subagents + OpenSpec delta specs + Compound learnings + 1-page Architecture map).
- Source: Research on top frameworks (Superpowers, OpenSpec, Spec Kit, Compound Engineering, GSD Core).

## Ownership & State
- Exact task path: `docs/tasks/done/done-0002-synthesize-best-in-class-workflow.md`
- Owner / session: Mavis session `mvs_0c8b76d884eb46f9a6b7b1b8188e023c`
- Branch / worktree: `master`
- Write scope: `.agents/docs/ARCHITECTURE.md`, `.agents/skills/compound/`, `AGENTS.md`, `.agents/docs/WORKFLOW.md`, templates, docs catalog, validation scripts.
- Dependencies / concurrent writers: None.

## Scope
- In scope: 1-page ARCHITECTURE.md template, compound skill, delta spec support in PRD/spec-feature, streamlined AGENTS.md token budget, 5-phase loop in WORKFLOW.md.
- Out of scope: External network calls during validation, git push, unapproved dependencies.
- Risk tier: Medium (framework template upgrade, non-executable docs and skills).

## Implementation Plan
- Step 1: Draft ARCHITECTURE.md system map and compound skill.
- Step 2: Streamline AGENTS.md, WORKFLOW.md, PRD.md, and TASK.md.
- Step 3: Update documentation catalog docs/README.md and setup guide START-HERE.md.
- Step 4: Update and run automated validation suite; package verified distribution zip.

## Acceptance Criteria
- [x] Criterion 1 — ARCHITECTURE.md exists with component map, data flow, invariants, and trust boundaries: `.agents/docs/ARCHITECTURE.md` verified.
- [x] Criterion 2 — compound skill exists and is referenced in AGENTS.md and WORKFLOW.md: `.agents/skills/compound/SKILL.md` verified with YAML frontmatter.
- [x] Criterion 3 — PRD template and spec-feature skill support OpenSpec-style delta specs (ADDED/MODIFIED/REMOVED): `.agents/templates/PRD.md` and `.agents/skills/spec-feature/SKILL.md` verified.
- [x] Criterion 4 — AGENTS.md stays lean (50 lines, <55 budget) while maintaining strict risk precedence and execution safety.
- [x] Criterion 5 — Validation suite passes (no broken links, valid UTF-8/LF, no skill frontmatter corruption, 100% allowlist match): 16/16 policy checks pass.

## Verification & Handoff Record
- **What changed**: Added `.agents/docs/ARCHITECTURE.md` (1-page system map template) and `.agents/skills/compound/SKILL.md`. Streamlined `AGENTS.md` (50 lines), updated `WORKFLOW.md` to 5-phase loop, enhanced `PRD.md` with delta spec sections, updated `spec-feature` to eliminate duplicate embedded template, linked architecture in catalog and setup guide.
- **Verification evidence**:
  - `python .validation/validate_starter.py` passed with 16/16 policy checks, 0 errors, 22 valid relative links, 5 skills.
  - `python .validation/package_starter.py` verified CRC, byte identity, allowlist, hidden directory preservation, and generated archive.
- **Tested state**: Aggregate core SHA-256 `d2ae4e2212587c7b278ee8daa6e353687efdde4244546ca99bceef67ee62bd9b`.
- **Environment**: Windows PowerShell; Python 3.12.10 (standard library only).
- **Evidence freshness**: Hash verification executed immediately prior to packaging.
- **Compounded learnings**:
  - Skill execution triggers must stay tightly scoped to prevent accidental context loading.
  - Python `in` substring assertions in validation suites are case-sensitive; check sentence capitalization carefully.
- **What was NOT tested & why**: Live cross-client tool discovery in third-party agent apps (requires manual client launch).
- **Open risks or follow-up**: None for starter package.
- **Rollback / recovery**: Revert to previous package or restore from `.validation/before-20260909-130752/`.
- **Status**: Completed and converged.
