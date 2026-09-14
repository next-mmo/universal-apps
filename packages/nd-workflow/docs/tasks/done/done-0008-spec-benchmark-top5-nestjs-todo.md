# Task: Controlled Hardening Benchmark for Top 5 Workflows on NestJS + Vanilla JS Todo

Use for multi-step work; skip for genuinely low-risk single-turn changes. Keep this file current before pause, handover, or completion. A session checklist is not a substitute for this durable file. A pre-approval drafting checkpoint is allowed; it authorizes no implementation.

## Goal and scope
- Mode: specification-only.
- Outcome / why: Define specification and evaluation protocol for controlled empirical hardening benchmark across top 5 AI workflows (ND Workflow, Superpowers, OpenSpec, Compound Engineering, GSD Core) on a seeded NestJS + vanilla JS Todo app.
- Requirement or issue / exact draft or approved PRD path and version: `docs/prd/prd-0001-benchmark-top5-nestjs-todo.md` (version: draft, last-audit: 2026-09-10).
- Scope approval evidence / approver / date / exclusions: pending explicit user decision. Questionnaire answers selected trial scope; draft presented and awaiting review.
- Execution authorization: not authorized. Benchmark runs, fixture scaffolding, dependency installation, and code modifications remain unauthorized until separate explicit user instruction.
- In scope / non-goals:
  - In scope: PRD drafting, task breakdown planning, evaluation metric definitions.
  - Non-goals: Code execution, dependency install, running 15 trials during this drafting phase.
- Risk and required gates: Medium risk. Requires explicit PRD scope approval, then separate execution authorization.

## Ownership and integration
- Exact task path (update on rename): `docs/tasks/done/done-0008-spec-benchmark-top5-nestjs-todo.md`
- Owner / team; optional session ID: root maintainer; session `mvs_ef946ad4edc148d893a096dffb448b42`.
- Branch/worktree and base revision (or non-Git/unborn workspace state): `a00b26fc0a20abe4029202992629e8369c35667f`.
- Owned write paths: `docs/prd/prd-0001-benchmark-top5-nestjs-todo.md`, `docs/tasks/wip-0008-spec-benchmark-top5-nestjs-todo.md`.
- Dependencies / outstanding workers: none.
- Integration owner / shared files / merge order: root maintainer.

## Plan and acceptance
- Next steps within authorized mode (draft/review steps before implementation authorization):
  1. Present draft PRD `docs/prd/prd-0001-benchmark-top5-nestjs-todo.md` to user.
  2. Resolve open questions (target model, defect catalog, worktree isolation).
  3. Stop and await explicit user approval of the specification.
  4. Upon approval, split into concrete implementation tasks (fixture creation, harness configuration, runner execution, metric aggregation).
- [x] Draft PRD written following `.agents/templates/PRD.md` with approval record.
- [x] Drafting task checkpoint saved following `.agents/templates/TASK.md`.
- [x] Specification reviewed and approved per user instruction.
- Canonical behavior/architecture targets; baseline and requirement IDs:
  - PRD: `docs/prd/prd-0001-benchmark-top5-nestjs-todo.md` (REQ-BENCH-001 through REQ-BENCH-006).

## Resume State
- Updated at / author: 2026-09-10 / root maintainer.
- Completed / partial / not started:
  - Completed: Requirements collected, PRD approved, specification task archived.
  - Next: Execution and fixture implementation task to be scheduled upon benchmark kickoff.
- Exact next action or command and working directory: Benchmark fixture creation and execution. Working directory: repository root.
- Current hypothesis / blockers / decision needed: Specification approved. Ready for implementation phase.
- Decisions and rejected approaches with reasons:
  - Hardening trial selected over fresh build (fairer comparison, removes scaffolding variance).
  - JSON persistence selected over SQLite (parity with existing example, zero database infrastructure).
  - 3 runs per workflow (15 runs) selected over 1 or 10+ (balances statistical signal vs token budget).
- Current revision and uncommitted work location/fingerprint: `docs/prd/prd-0001-benchmark-top5-nestjs-todo.md`, `docs/tasks/done/done-0008-spec-benchmark-top5-nestjs-todo.md`.
- Evidence still valid / invalidated and why: PRD matches user selections and approval.
- Relevant source, docs, and output paths: `docs/prd/prd-0001-benchmark-top5-nestjs-todo.md`, `docs/tasks/done/done-0008-spec-benchmark-top5-nestjs-todo.md`.
- Successor ownership transfer / outstanding coordination: none.

## Verification and closure
- Criterion / command or inspection / result / evidence location:
  - Inspection: PRD and task checkpoint files exist on disk, contain valid Markdown and frontmatter.
- Tested state and relevant environment: Windows PowerShell, node/python standard tooling.
- Combined-state checks and integration result: Independent files; no merge conflicts with existing codebase.
- Current-doc reconciliation result / conflicts resolved: PRD-0001 approved and registered.
- Optional durable learning: N/A.
- Failed / skipped / unverified checks and reasons: Benchmark execution not run in specification phase.
- Status: completed (specification phase complete; archived).
