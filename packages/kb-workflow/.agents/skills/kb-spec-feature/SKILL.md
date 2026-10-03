---
name: kb-spec-feature
description: Feature specification and planning skill. Guides drafting a new PRD in docs/prd/ with standardized YAML frontmatter, aligning with .agents/docs/VISION.md and ROADMAP.md, and breaking it down into an actionable plan and task files in docs/tasks/. Use when asked to "spec a new feature", "create PRD", "write spec for X", "break down feature", or when starting non-trivial product work.
---

# Spec Feature: Product Requirement & Planning

This skill translates user ideas, issues, and roadmap items into clean, actionable **PRDs (Product Requirement Documents)** and task files, ensuring alignment with the product vision and avoiding premature or uncontrolled coding.

---

## When to Run This Skill

- When planning new product scope, multi-component architectural additions, or features that lack clear requirements (see `.agents/docs/WORKFLOW.md`).
- When a user asks to *"design a new feature"*, *"write a PRD for X"*, or *"plan feature Y"*.
- **Skip for small or localized work**: Bug fixes, styling tweaks, minor API enhancements, or tasks with straightforward scope in `docs/tasks/` do not need a PRD. Reuse existing approved plans rather than drafting duplicate specifications.

---

## Step-by-Step Specification Process

### Step 1: Pre-Flight Alignment Checks

Before drafting, apply [decision and token routing](../../docs/WORKFLOW.md#decision-and-token-safeguards) when a consequential premise is uncertain or planning requires substantial investigation. Keep user requirements distinct from claims about current implementation.

Before drafting:
1. **Check `.agents/docs/VISION.md`**:
   - Does this align with the mission and users defined there?
   - Does it violate any **Non-goals**?
2. **Check the roadmap family**:
   - `.agents/docs/ROADMAP.md` (the live board) — does this fit into the current milestone?
   - `.agents/docs/ROADMAP-BACKLOG.md` (the queue) — or does it belong in the Backlog/Icebox?
3. **Find the Next PRD ID**:
   - Inspect `docs/prd/` to find the highest numbered ID (e.g., `0024`), and allocate `0025`.

---

### Step 2: Draft the PRD

Copy `.agents/templates/PRD.md` to `docs/prd/NNNN-<slug>.md` using the standard format:

```markdown
---
id: "NNNN"
title: "<Feature Display Name>"
status: draft          # draft | approved | in-progress | shipped | archived
last-audit: YYYY-MM-DD
---

# Product Requirement Document (PRD): <Feature Name>

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
- [ ] Criterion 1: Concrete, testable user action & expected outcome.
- [ ] Criterion 2: API integration test verifying the route end-to-end.
- [ ] Criterion 3: Error handling, edge case, or empty state.
- [ ] Criterion 4: Clean machine / isolation verified (when release-relevant).

## 6. Risk Tier & Rollback Path
* **Risk Tier**: Low | Medium | High | Critical (per WORKFLOW.md)
* **Rollback Path**: How to revert or disable if an issue is discovered.
```

---

### Step 3: Human Approval Gate

Stop and present the drafted PRD to the human product owner:
- Highlight the **User Stories**, **Acceptance Criteria**, and **Out of Scope** items.
- Solicit explicit human approval before implementation of new scope. Planning and task breakdown can make that scope reviewable first. Reuse approval already given for the same scope; do not require a second approval solely because the artifacts were updated to reflect it.

---

### Step 4: Scaffold Task Files

Once approved, update the PRD frontmatter `status: approved` and create the corresponding task file:

- Create `docs/tasks/todo-NNNN-<slug>.md` (template: `.agents/templates/TASK.md`)
- Link it directly to the PRD: `> PRD: [PRD-NNNN](../prd/NNNN-<slug>.md)`
- Map the assigned acceptance criteria to actionable task checkboxes, referencing the parent criterion IDs; do not copy the entire PRD into every task.
- Update `.agents/docs/ROADMAP.md` (active board) if the work is starting now, otherwise `.agents/docs/ROADMAP-BACKLOG.md` under the milestone queue.
