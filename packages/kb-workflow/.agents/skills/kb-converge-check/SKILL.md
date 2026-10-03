---
name: kb-converge-check
description: Convergence verification skill inspired by Spec-Kit. Validates that an implementation completely satisfies its PRD or task acceptance criteria before marking work done. Compares each criterion against fresh evidence (test outputs, UI inspection, API responses) to prevent scope drift and untested requirements. Use when asked to "converge check", "verify against PRD", "check acceptance criteria", or before marking a medium/high-risk task done.
---

# Converge Check: PRD Acceptance Verification

A task is not complete simply because unit tests pass or the code compiles. The **Convergence Gate** proves that every promise made in the PRD or task specification has real, verifiable evidence.

---

## When to Run This Skill

- Before completing medium-, high-, or critical-risk tasks that have PRDs or explicit acceptance criteria.
- Before requesting human signoff on a completed feature or major architectural change.
- When an agent wants to confirm that an implementation has converged with the approved plan.
- **Skip for low-risk tasks**: UI polish, copy, styling, docs, and minor localized bug fixes do not need converge-check.
- **Reuse existing evidence**: Convergence checks coverage using evidence already gathered during implementation; do not rerun test suites unnecessarily.

---

## Step-by-Step Convergence Process

### Step 1: Identify the Specification Source

Find the active task in `docs/tasks/wip-*.md`:
1. Check the task's **Acceptance Criteria** section.
2. Check the linked PRD in `docs/prd/` (if one exists) for the criteria assigned to this task. For a partial PRD implementation, retain links to the owners of remaining criteria instead of requiring every sibling task to be complete.

### Step 2: Build the Convergence Matrix

Construct a tabular evaluation comparing each requirement against **fresh observation evidence**:

Record the tested commit/artifact and relevant environment. Existing evidence remains usable when the changed behavior and environment it covers are unchanged; rerun only checks invalidated by later changes or unresolved failures.

| # | Acceptance Criterion / Requirement | Verification Method | Evidence / Proof | Result |
|---|---|---|---|---|
| 1 | API endpoint returns 200 with formatted payload | Automated Integration Test | `pytest tests/test_*.py` passed (attached output) | ✅ Pass |
| 2 | Error handling on invalid input | Negative unit test | `test_invalid_payload_returns_422` passed | ✅ Pass |
| 3 | UI updates reactively on state change | Manual / Dev inspect | Component state inspected, screenshots or DOM assert | ✅ Pass |
| 4 | Clean machine isolation (no global dependency leaks) | Runtime inspection | Feature environment inspected; no collision with the host toolchain | ✅ Pass |

When evidence conflicts with an assumption, follow [decision and token routing](../../docs/WORKFLOW.md#decision-and-token-safeguards). Preserve missing-evidence gates and reuse unaffected checks; an approved plan does not prove acceptance.

### Step 3: Handle Discrepancies

- **Unmet Criterion**: If any item is ❌ Fail or ⏳ Missing Evidence:
  - Do NOT mark the task done.
  - Return to implementation/verification for missing agent-side work. If only required human verification and acceptance remain, use `review-` and state those steps explicitly.
- **Scope Creep / Drift**: If the implementation added behaviors not requested in the PRD:
  - Check against `.agents/docs/VISION.md` non-goals.
  - Remove unnecessary complexity or seek explicit human approval.

### Step 4: Write the Convergence Record

When applicable agent checks pass, insert the **Convergence Matrix** directly into the task and move it to `review-` for [human review](../../docs/WORKFLOW.md#human-review-before-done). Keep required human checks explicitly pending; an agent PASS cannot satisfy them. Archive to `docs/tasks/done/` only after those checks and explicit human acceptance:

```markdown
## Convergence Record (Verified YYYY-MM-DD)

- Assigned criteria: <IDs and links to the per-criterion evidence matrix>.
- Checks actually run: <command/action, result, tested commit/artifact, environment>.
- Remaining parent-PRD work: <owning tasks, or none>.
- Merge/release state: <actual state; acceptance does not imply publication>.
```

Do not copy generic verification claims for checks that were not run. After acceptance, follow [WORKFLOW.md](../../docs/WORKFLOW.md#closeout-learning) for the brief selective learning check; no automatic retrospective or duplicate convergence file is needed.
