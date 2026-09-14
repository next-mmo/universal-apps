# Task: Large-project speed and token efficiency specification

## Goal and scope
- Mode: specification-only.
- Outcome: prepare separate performance proposal while retaining portable-context approval and saved plan.
- Exact PRD/version: docs/prd/prd-0004-large-project-retrieval-efficiency.md, approved v0.1, LP-001–LP-008 unchanged.
- Technical plan: docs/plans/plan-0004-large-project-retrieval-efficiency.md, six conditional phases unstarted.
- Approval: user questionnaire ask_7d1216a9667b262bf6f2549a, 2026-09-11 (submittedAt 1789066575370): "Approve PRD-0004 v0.1 scope; planning only, no implementation".
- Execution authorization: further planning only. No index implementation, installs, measurements, host configuration, graph creation or live archive moves; separate explicit start instruction required.
- Risk: high shared retrieval/data-integrity boundary; scope approved, later execution authorization, baseline, regression and independent review required.

## Ownership and integration
- Exact task: docs/tasks/task-0008-large-project-retrieval-spec.md.
- Owner/integration: root mvs_448dca7eb404481d83851b9e2888d65b, no workers.
- Baseline recorded: main ec5db2a3208e1e02101ca50ca1534992dcf69f7e plus pre-existing dirty work, not a fresh clean-state assertion.
- Owned files: PRD-0004, plan-0004, this checkpoint; status-only/save updates to PRD-0003, plan-0003 and task-0007.
- Prior saved task: docs/tasks/task-0007-portable-context-spec.md. PC-001–PC-010 remain approved for planning only, unchanged. Do not inherit approval or create duplicate indexing modules.

## Plan and acceptance
- [x] Read existing catalog, prior PRD/plan/task and PRD/PLAN/TASK templates.
- [x] Reconcile portable-context stale approval metadata and park work without file moves or loss of requirements.
- [x] Draft independent LP requirements and conditional phased plan, including privacy, incremental updates, fallback and truthful token accounting.
- [x] Save explicit approval/execution boundary and next action.
- [x] Explicit user scope approval for PRD-0004 v0.1 recorded; planning only, no start instruction.
- Before later experiments: select authorized representative corpus/hardware, fixed queries/golds and performance budgets; none measured in this turn.

## Resume State
- Updated: 2026-09-11, root.
- Complete for drafting: portable-context saved; new PRD and plan authored. Unstarted: both feature implementations and performance/host testing.
- Next action: await requested further planning or explicit implementation start. Before experiments, agree authorized corpus/hardware and performance budgets; do not run experiments now. Do not ask again for already-recorded v0.1 scope approval.
- Proposed direction: local incremental shared cache, bounded provenance/expansion, explicit relation table; SQLite FTS5 optional candidate, not chosen backend. No custom graph or parser suite.
- Open: real large-project fixture, scale/language mix/hardware/SLOs; resolve before experiment freeze. No broad workspace/home search for inputs. Unknown usage stays unknown.
- Relevant evidence: INDEXING-BENHMARK.md is comparative/proposed protocol, not measured results; PRD-0003 and plan-0003 own PC obligations.
- Successor: verify exact approvals, current dirty source and shared interface conflicts; no active implementation writer assigned. Resume this task in place if approved/started later.

## Verification and closure
- Files read back for status, version, scope and next actions. No application tests or benchmarks warranted for specification-only work.
- PC requirement body preserved; approval metadata now agrees with explicit recorded decision. Six-phase PC plan retained.
- Source behavior unchanged; no indexing capability or score claimed.
- Status: done for planning delivery and approval recording; LP v0.1 scope approved, implementation unauthorized. Portable feature remains saved/parked, not archived as implemented. No requirements or source behavior changed in this approval update.
