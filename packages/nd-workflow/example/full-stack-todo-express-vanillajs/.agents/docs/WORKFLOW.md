# Delivery Workflow

## Choose the shortest safe route

Highest applicable risk wins; size never downgrades sensitive behavior. Risk follows impact, not words mentioned in prose.

| Risk | Trigger | Minimum gate |
|---|---|---|
| Low | Isolated, non-sensitive behavior or prose | Scoped edit and focused check; single-turn work needs no task file |
| Medium | Feature, shared component, shared workflow | Task with inline plan; affected checks and integration review |
| High | Runtime, CI, public contracts, migrations | Approved scope, plan, affected integration/build proof, recovery plan |
| Critical | Auth, security, payments, data integrity | High gates plus positive/negative cases and human signoff in an isolated representative environment |

A one-line auth fix is critical. Prose about auth is not automatically critical; security instructions affecting execution can still carry higher risk.

## Specification and execution authorization

- Direct implementation requests authorize their stated work, subject to risk and safety gates; clear fixes do not need a duplicate PRD or repeated permission. A specification-only request authorizes discovery, draft documents and drafting checkpoints, not implementation permission.
- Before waiting for scope approval, save the draft PRD with open questions and a specification-only task checkpoint. A session checklist does not replace files. Record exact paths and verify they exist before reporting delivery; do not claim a complete draft if blocked inputs remain.
- Questionnaire answers select requirements, not approval. Present the saved draft, identify its version, and stop for explicit scope approval. Silence, an ambiguous "continue", and an agent-written status label are not approval evidence.
- Record approver, date, exact approved scope/version, decision evidence and exclusions. Scope approval permits task breakdown but not execution. An explicit approval and start instruction may authorize both; record each separately. Installs, destructive changes and publication retain their own gates.
- Material scope changes invalidate affected approval: return proposal to draft, identify changed requirements and seek renewed approval before affected implementation. Non-semantic corrections retain approval with a recorded version mapping. On resume, verify approval evidence and execution authorization instead of trusting a task's next-command field.
- A drafting task may finish with a delivered PRD still awaiting approval; an implementation task requires approved scope and execution authorization. For single-executor features, update the drafting task in place to implementation mode upon approval rather than minting a duplicate task file. A separate docs/plans file is optional when the task's inline plan suffices. Review-only requests remain read-only.

## Execution

1. **Orient:** Inspect existing state, relevant source, and only necessary references. Resolve blocking uncertainty; do not re-specify approved requirements.
2. **Plan:** Clear work uses a short task plan. Use `spec-feature` only for unresolved product scope. Reuse existing specs. Record decisions when alternatives have costly consequences.
3. **Implement:** Prefer a failing regression test for bugs and test-first logic where practical. If no executable test is feasible, record reproduction, alternative proof, and limitations. Never invent a test pass.
4. **Verify:** Use impact-based checks from `AGENTS.md`. Medium/high/critical work uses `converge-check`. Test affected consumers, error paths, and combined changes; missing required checks block completion.
5. **Reconcile and hand over:** Update current docs, checkpoint task state, and optionally capture durable learning. Archive only when required scope passes. Implemented, integrated, and deployed are distinct outcomes.

## Parallel execution contract

- Default to one executor. Delegate when independent work benefits from isolated context or substantial parallel execution; fresh agents/worktrees are not free or mandatory.
- Coordinator assigns task ID/path, owner, exact write scope, dependencies, base revision/workspace state, acceptance, and return format before dispatch.
- Freeze shared interfaces before dependent implementation. Coordinator owns catalog, shared specs, root instructions, manifests/lockfiles, and integration; workers propose shared changes rather than race to write them.
- Use disjoint scopes or isolated worktrees and serialize conflicting edits. Without an initial Git commit, record workspace/file state; do not assume worktree creation is available or auto-commit to enable it.
- Worker handoff: changed paths, tested state, commands/results, unresolved assumptions, and required integration order. Parent must inspect returned changes, resolve semantic conflicts, and verify the combined state. Separate passing tests are insufficient.
- Preserve active work in a durable checkpoint before interruption. Resuming owner verifies branch, dirty state, outstanding writers, and invalidated evidence before editing.

## Current documentation and change history

- Small projects: update the existing canonical feature/API documentation directly; use a PRD only for unresolved requirements. Larger projects may designate capability specs under `docs/specs/` when adopted, not as mandatory empty scaffolding.
- Every change proposal names its canonical target(s), baseline revision/section, and stable requirement identifiers. New capability: name intended target and explicitly mark baseline absent.
- At integration, compare target with baseline. Stop on conflicting concurrent edits; integration owner resolves intent before applying additions, full replacements, or removals. Record removal/migration effects.
- Rewrite canonical content to describe current behavior, not merely "changed from X". Link source and tests, mark implementation/deployment state, and update catalog routes. A proposed requirement is not current behavior.
- Record reconciliation result in task. Keep proposal as history, then update lifecycle status accurately. Do not mark `shipped` until release/deployment evidence exists; record pending deployment separately.
- Delta headings are a local change-summary convention, not OpenSpec CLI compatibility or automatic synchronization.

## Shipping and recovery

- Release owner checks relevant CI/combined tests against exact candidate state. Preserve tested artifact identity; changes invalidate affected evidence.
- Deployed services and persistent data require an approved rollout, health criteria, rollback/restore constraints, and responsible team route; use the optional runbook template.
- A successful build is not a deployed release. Record deployment evidence, health result, and recovery readiness before claiming shipped. No real production changes without authorization.
- Existing permissions, human review gates, and security controls remain in force even when task acceptance passes.
