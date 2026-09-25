# Task Tracking

Use [task template](../../.agents/templates/TASK.md) for multi-step work. Genuinely low-risk single-turn fixes skip task records; sensitive changes never qualify merely by size. Use [nd-task-status](../../.agents/skills/nd-task-status/SKILL.md) for read-only inspection of active WIP, blockers, and backlog.

- `todo-NNNN-slug.md`: planned.
- `wip-NNNN-slug.md`: active, one per executor session; different tasks can run concurrently.
- `blocked-NNNN-slug.md`: blocker and next owner/action visible at top.
- `done/done-NNNN-slug.md`: required scope verified, delivery state explicit.

Coordinate unique IDs, exact task path, owner, write scope, and integration owner before work. Update path on rename; never infer identity from first wildcard match. Reuse safe existing state without assuming Git has a first commit.

Record task mode: specification-only, implementation, or review-only. Pre-approval drafting tasks preserve selected requirements, open questions, exact draft path/version and next drafting action, with implementation not authorized. A drafting deliverable can be done while its PRD remains draft/awaiting approval; do not confuse drafting completion with feature approval. Implementation tasks record approved scope and separate execution authorization. Session UI checklists do not replace these files.

Update Resume State before interruption or ownership transfer, not only completion. See [handover drill](../HANDOVER.md). Coordinator owns shared files and combined-result verification; branch isolation alone does not prove integration. `nd context check` reports checkpoint completeness (owner, scope approval, execution authorization, next action), ambiguous active tasks, missing catalog anchors and cache freshness; it is a read-only audit and never replaces the durable file.

Archive only after required scope passes. Pending deployment, skipped checks, and stale evidence remain explicit. Historical session IDs are provenance, not a current contact method.

## QA handoff

Use [QA contract](../../.agents/skills/nd-user-testing/references/qa-handoff.md) for round reports and status events. Confirmed existing-behavior bugs create or reuse `todo-*` tasks when local triage is authorized; unresolved product scope creates a draft PRD and specification-only checkpoint. Ticket creation never authorizes fixes. Developers read the linked report, reproduction, evidence, risk gates and next action; record fix revision as READY_FOR_RETEST. QA closes bugs only after fresh reproduction and regression checks pass. Bug status and round outcome do not replace ND task lifecycle or deployment evidence.
