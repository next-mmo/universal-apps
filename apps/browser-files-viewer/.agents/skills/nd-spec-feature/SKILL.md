---
name: nd-spec-feature
description: Feature specification and planning skill. Guides drafting a new Delta PRD in docs/prd/ and breaking it down into actionable tasks in docs/tasks/. Use when asked to "spec a new feature", "create PRD", "write spec for X", or when unresolved product scope needs definition. Skip for bug fixes or straightforward tasks.
---

# Spec Feature: Product Requirement & Planning

This skill translates feature ideas, issues, and roadmap items into clean, actionable **Delta PRDs** and task files, avoiding premature or uncontrolled coding.

---

## When to Run This Skill

- When planning new product scope, multi-component architectural additions, or features that lack clear requirements (see `.agents/docs/WORKFLOW.md`).
- When a user asks to *"design a new feature"*, *"write a PRD for X"*, or *"plan feature Y"*.
- **Reuse approved scope**: Straightforward bug fixes and localized changes do not need a duplicate PRD. Apply `AGENTS.md` risk precedence first; sensitive changes still require their risk-tier plan and verification even when small. Draft a PRD only for unresolved product scope.

---

## Step-by-Step Specification Process

### Step 1: Find current truth
1. Locate existing requirements, source, and affected architecture using catalog or targeted search. Approved scope needs no duplicate PRD.
2. Name canonical document targets, baseline revision/sections, and stable requirement IDs; new capability explicitly has no baseline. Do not use historical proposals as current behavior.
3. Coordinate unique proposal/task IDs and integration owner. Never overwrite existing files; coordinator owns shared catalog/spec updates.

### Step 2: Draft only unresolved scope
A `/spec-feature` or spec-only request is specification-only: discovery, draft documents and checkpoints are authorized, not code, dependency installation, benchmark runs or implementation delegation. Questionnaire answers are requirements input, not scope approval.
Use `.agents/templates/PRD.md`; do not embed another template here. Record outcome, non-goals, decisions, observable scenarios, relevant failure cases, and recovery constraints.
Use ADDED/MODIFIED/REMOVED only when useful. These are local summaries, not OpenSpec CLI schema. Modifications contain full resulting behavior; removals include migration effects.
Save the draft PRD under `docs/prd/` with status `draft`. Before waiting or handing over, save a specification-only drafting checkpoint using `.agents/templates/TASK.md`: selected requirements, open questions, exact draft path/version, owner, next drafting action and implementation not authorized. A session checklist is not a deliverable. If blocked, save partial draft/checkpoint where authorized and state missing inputs rather than claiming completion. A separate plan file is optional.
Verify saved paths, present the draft and unresolved decisions. Stop after presenting: request explicit approval of that version; do not start implementation. Draft delivery is complete for the drafting scope even while PRD approval remains pending.

### Step 3: Approve and assign
Only an explicit user decision approving the presented scope changes the proposal to `approved`; silence, ambiguous continuation or an agent-written status is insufficient. Record approver, date, exact scope/version, decision evidence and exclusions in the PRD approval record.
When approved work spans multiple architectural phases or decoupled components, draft an implementation plan in `docs/plans/` using `.agents/templates/PLAN.md`. For routine multi-step work, inline plans in task files suffice.
After approval, define the implementation task breakdown. For single-worker or sequential features, reuse the existing drafting task checkpoint in place: update `Mode` from `specification-only` to `implementation`, record approval evidence, and append the implementation plan and acceptance checks (do not mint a duplicate task file). Only create new task breakdown files with `.agents/templates/TASK.md` when approved work splits across multiple parallel workers or decoupled workstreams. Scope approval alone does not authorize execution; wait for an explicit implementation request. One explicit instruction approving the identified draft and starting its implementation can satisfy both records, subject to risk/safety gates. Workers return proposed catalog/shared-doc edits to coordinator.
Material scope changes return affected approval to pending; save the changed draft and obtain renewed approval before affected implementation. On resume, verify approval and execution evidence before taking a saved next action. Clear direct fixes outside this spec-only route retain `AGENTS.md` shortcuts.

### Step 4: Reconcile at integration
Compare canonical targets against recorded baseline. Resolve concurrent conflicts before applying deltas; update current docs to describe implemented behavior with source/test links and deployment state. Record reconciliation in task before closure. Keep proposal as history; `shipped` requires release evidence. Follow `.agents/docs/WORKFLOW.md` for lifecycle details.
