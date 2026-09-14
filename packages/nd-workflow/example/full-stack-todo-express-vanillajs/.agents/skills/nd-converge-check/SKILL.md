---
name: nd-converge-check
description: Acceptance verification skill. Validates that an implementation completely satisfies its PRD or task acceptance criteria before marking work done. Compares each criterion against fresh evidence (test outputs, UI inspection, API responses) to prevent scope drift and untested requirements. Use when asked to "converge check", "verify against PRD", "check acceptance criteria", or before marking a medium/high-risk task done.
---

# Converge Check: Acceptance Verification

Map approved acceptance criteria to evidence for the relevant current state. Passing checks supports those criteria; it does not guarantee defect-free software, model compliance, or production readiness beyond tested scope.

---

## When to Run This Skill

- Before completing medium-, high-, or critical-risk tasks that have PRDs or explicit acceptance criteria.
- Before requesting human signoff on a completed feature or major architectural change.
- When an agent wants to confirm that an implementation has converged with the approved plan.
- **Skip only for genuinely low-risk tasks** under `AGENTS.md` risk precedence; small sensitive fixes and shared workflow changes do not qualify by size or extension.
- **Reuse existing evidence** only when relevant code, config, dependencies, and environment match the tested state. Otherwise rerun affected checks; a passing result from an earlier revision is not current proof.
- **Verification scope** follows `AGENTS.md`: prose-only tasks use links, formatting, and diff; executable docs use affected docs checks/build. No artificial code-test requirement for prose.

---

## Step-by-Step Convergence Process

### Step 1: Identify the Specification Source
Use the exact task path supplied by the caller or current session's recorded task ownership. Do not select the first `wip-*` match.
1. Confirm owner/session, branch/worktree (or non-Git workspace), write scope, and current file state match the task. If task identity is unresolved, stop and request the exact task path.
2. Read task acceptance and approved scope, including canonical target/baseline and relevant scenarios. Do not assume headings from an obsolete PRD template.
3. Compare evidence with current relevant inputs. Cross-session, high-risk, or release work requires tested revision plus dirty-state fingerprint (or file hashes) and environment. Treat stale evidence as missing until affected checks rerun.
4. Confirm integration owner verified combined changes, not only individual branches. Check current-doc reconciliation and any required human or recovery gates; unresolved conflicts block completion.

### Step 2: Build the Convergence Matrix
Construct a tabular evaluation comparing each requirement against **fresh observation evidence**:

| # | Acceptance Criterion / Requirement | Verification Method | Evidence / Proof | Result |
|---|---|---|---|---|
| 1 | Feature / Endpoint executes expected flow | Targeted Automated Test | Test command passed (output attached) | Pass |
| 2 | Error handling on invalid input | Negative test | Error assertion passed | Pass |
| 3 | UI updates reactively on state change | Dev inspection / DOM assert | Inspected in local preview/dev | Pass |

### Step 3: Handle Discrepancies
- **Unmet Criterion**: If any item is Fail or Missing Evidence:
  - Do NOT mark the task done.
  - In an implementation task, address missing behavior or rerun stale/missing checks within approved scope. If blocked by unavailable tools or environment, record blocked/unverified and the blocker.
  - In review-only or verification-only mode, report findings without changing project files; return remediation to the owner.
- **Scope Creep / Drift**: If implementation added unrequested behaviors, report the discrepancy. Only the authorized implementation owner may remove it or seek approval; verification-only work remains read-only.

### Step 4: Write the Convergence Record
In implementation mode, reconcile affected current docs and optionally use `.agents/skills/compound` for durable findings; no-op is allowed. Recheck changed docs and invalidated evidence before closure. When all required criteria pass, record implemented/integrated/deployed state separately and archive the exact task; update recorded path. Pending deployment can remain explicit for implementation-only scope, never claim shipped without release proof. In review-only mode, return record without writing or moving files.

```markdown
## Convergence Record (Verified YYYY-MM-DD)

- [x] All required acceptance criteria verified against recorded current state.
- [x] Task-appropriate checks passed (code tests or prose links/format/diff, as applicable).
- Tested state / environment: <revision + dirty-state fingerprint, or file hashes; relevant versions>
- Integration / current-doc reconciliation: <combined checks, resolved conflicts, targets updated>
- Delivery state: <implemented, integrated, deployed; explicit pending scope>
- Evidence: <commands/inspections, results, and output locations>
- Skipped / unverified: <scope and reason; no unresolved required criterion>
- Ready for human signoff; release/publication still requires authorization.
```
