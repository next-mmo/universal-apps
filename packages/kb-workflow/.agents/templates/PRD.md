---
id: "NNNN"
title: "<Feature Display Name>"
status: draft          # draft → approved → in-progress → shipped → archived
last-audit: YYYY-MM-DD
---

# Product Requirement Document (PRD): <Feature Name>

> Copy this file to `docs/prd/NNNN-<slug>.md` (allocate the next id in `docs/prd/`).
> Draft it with `.agents/skills/kb-spec-feature/SKILL.md`; human approval gates implementation.

## 1. Goals & User Problem
* What problem does this solve for the user?
* Who is the primary persona?

## 2. User Stories
* As a [role], I want [capability] so that [benefit].

## 3. Scope & Non-Goals
* **In Scope**: Exact boundaries of what will be built.
* **Out of Scope**: What will explicitly NOT be built in this phase.

## 4. Technical & Architectural Requirements
* UI / frontend touchpoints (routes, components)
* Backend API endpoints and data
* Runtime & dependencies (isolation, packaging)
* Performance & hardware considerations

## 5. Acceptance Criteria (Required for Convergence)
- [ ] C1: Concrete, testable user action & expected outcome.
- [ ] C2: API integration test verifying the route end-to-end.
- [ ] C3: Error handling, edge case, or empty state.
- [ ] C4: Clean machine / isolation verified (when release-relevant).

## 6. Risk Tier & Rollback Path
* **Risk Tier**: Low | Medium | High | Critical (per WORKFLOW.md)
* **Rollback Path**: How to revert or disable if an issue is discovered.
