# Agent Workflow Scrum Delivery

## Operating principle

- Optimize for the approved human outcome and the smallest safe change.
- Scale ceremony to risk and verify at the real user, process, or service boundary.
- Keep requirements, implementation, observations, and human decisions distinct.
- Improve reusable workflow policy only through a human-approved suggestion.

## Scrum operating model

| Scrum concept | Repository artifact | Authority or exit gate |
| :--- | :--- | :--- |
| Product goal | Product PRDs | Human product owner |
| Product backlog | PRDs and `tasks/todo-*` | Human priority |
| Sprint backlog | One `tasks/wip-*` record | Approved change contract |
| Impediment | One `tasks/blocked-*` record | Named external dependency |
| Increment | Change plus `tasks/done/done-*` evidence | Definition of Done |
| Sprint review | User-boundary acceptance and handoff | Human acceptance |
| Retrospective | `suggestions/NNNN-*.md` | Human policy decision |

Agents maintain implementation and evidence. They do not replace human product ownership or approve their own workflow proposals.

## Delivery loop

| Phase | Required output | Exit gate |
| :--- | :--- | :--- |
| Discover | Instructions, Git state, affected owners, dependencies, risks | Scope is understood |
| Define | Outcome, acceptance, non-goals, risk, recovery | Material ambiguity is resolved |
| Baseline | Current behavior and check results | Existing failures are separated |
| Design | Contracts, data flow, boundaries, rollback | Smallest safe slice is identified |
| Implement | Reviewable code, tests, configuration, and docs | No unrelated rewrite |
| Verify | Scope-selected checks plus real-boundary evidence | Criteria pass at changed layers |
| Review | Diff and evidence against the contract | Risks and gaps are explicit |
| Handoff | Outcome, files, checks, risks, skipped work, decisions | Human can evaluate and continue |
| Learn | Deduplicated workflow proposal | Human accepts, rejects, or defers |

## Risk levels

- **Fast:** typo, comment, minor style, or isolated one-line defect. Reproduce, patch, run the narrowest check, and report.
- **Standard:** components, APIs, packages, refactors, dependencies, configuration, or behavior. Use an active task, baseline, acceptance criteria, evidence, and documentation synchronization.
- **High:** auth, payments, destructive migrations, production infrastructure, secrets, or external side effects. Require explicit human scope, threat/risk review, staged execution, observability, and rollback.

## Evidence rules

- Record exact commands and outcomes; do not replace evidence with “works.”
- Distinguish failures caused by the change from pre-existing or environmental failures.
- For UI work, verify the visible flow, relevant viewport/accessibility behavior, and console output.
- For CLI/MCP work, verify public command/protocol success and negative paths.
- For Tauri/Rust work, verify the Rust boundary and the relevant desktop capability, not only the web build.
- For package changes, verify stable exports and at least one real consumer.
- Use `pnpm workflow:report` for a generated local snapshot; `report/` is ignored and never canonical.

## Learning loop

Search [`suggestions/`](suggestions/) before creating a proposal. Use [the template](suggestions/0000-template.md), keep the current task bounded, and apply policy only after explicit human acceptance.

All Agent Workflow Scrum artifacts live under `.agents/docs/`. Existing application documentation remains under its current application-owned paths.
