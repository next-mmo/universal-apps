# QA report, events and ND developer handoff

Use with nd-user-testing. This is a local Markdown record contract, not an event service or issue-tracker integration. Reuse project conventions when equivalent; keep links and one canonical record per bug. Reports are allowed QA artifacts, not application fixes.

## Storage and ownership

- Default report: `docs/qa/round-<UTC timestamp>-<unique-id>.md`; evidence in a sibling round-specific folder only when needed. Use filesystem-safe IDs, create without overwrite, and redact before saving. Do not fabricate screenshot paths.
- Link the report from the existing docs catalog; record report-write or catalog permission failures as handoff blockers. For report-only/read-only-document requests, follow the narrower write scope and return unsaved findings explicitly.
- Local triage requests authorize drafting task/PRD records, not application changes. No external issue creation, notifications, commits or publication without separate authorization.
- Before creating IDs, inspect `docs/tasks/` including archived tasks and `docs/prd/`. Coordinate unique numeric IDs with the current owner. Do not rename or take ownership of someone else's active WIP. If a collision occurs, reserve a new ID and update links.
- Existing bug/task found: append new evidence or link it with owner coordination. Same symptoms are not proof of same root cause. Uncertain duplicates stay linked candidates, not silently merged.

## Status model

Keep these dimensions separate; file names remain ND task lifecycle, not new QA status prefixes.

| Record | Values | Transition authority |
|---|---|---|
| Round lifecycle | PLANNED, RUNNING, PAUSED, COMPLETED | QA operator; COMPLETED means round ended, not product passed |
| Criterion / round outcome | PASS, FAIL, BLOCKED, UNVERIFIED | Direct test evidence; blocked or unattempted is never passed |
| Bug | NEW, TRIAGED, IN_PROGRESS, READY_FOR_RETEST, CLOSED, REOPENED, DEFERRED, DUPLICATE | QA triages; authorized dev starts/fixes; QA verifies closure; owner decides deferral |
| ND task file | todo, wip, blocked, done | Follow TASK template and task catalog; preserve exact linked path on rename |
| PRD | draft, approved, in-progress, shipped, archived | Follow nd-spec-feature; QA cannot self-approve scope or claim shipped |

NEW becomes TRIAGED after evidence and route are sufficient. An authorized developer may start a todo task as wip and set IN_PROGRESS. A fix revision plus developer check evidence permits READY_FOR_RETEST. QA sets CLOSED only after reproduction and relevant regression checks pass on that revision; failures set REOPENED. Blocked retest leaves READY_FOR_RETEST with the blocker recorded. DEFERRED requires owner/date/reason; DUPLICATE requires canonical bug link. Neither means fixed or passed. Task archive waits for its own acceptance and integration gates; pending deployment stays explicit.

Append local events for ROUND_STARTED, CHECK_RECORDED, BUG_FOUND, BUG_TRIAGED, TASK_LINKED, PRD_DRAFTED, BLOCKER_FOUND, ROUND_PAUSED, ROUND_RESUMED, FIX_REPORTED, RETEST_PASSED, RETEST_FAILED, BUG_CLOSED, BUG_REOPENED, BUG_DEFERRED, BUG_DUPLICATE and ROUND_COMPLETED as they actually occur. No placeholder events or invented actors. Each event records sequence, UTC time, actor, entity ID, previous/new status, evidence or reason, and next action. Update current summary and affected cross-links with the same event. Keep old events intact; corrections append a superseding event. Resume from last valid checkpoint, not transcript memory. Events are manually maintained by the executing agent; there is no automatic synchronization.

## Routing decisions

| Finding | Durable action when triage is authorized | Developer next action |
|---|---|---|
| Reproduced deviation from approved/current behavior | Create or reuse todo bug task; no new PRD | Read reproduction and acceptance; obtain execution authorization before fixes |
| Desired behavior ambiguous or new capability requested | Use nd-spec-feature: draft PRD and specification-only task checkpoint | Resolve named product decision; wait for explicit scope approval and execution authorization |
| Existing canonical bug/task | Link new round evidence, preserve canonical ID and ownership | Follow existing task; no duplicate ticket |
| Non-reproducible suspicion | Keep NEW observation with missing evidence; no confirmed fix task | Triage/investigate only if separately authorized |
| Environment prevents test | Record blocker, affected criterion IDs and recovery owner/action | Restore authorized test environment; do not assume app defect |
| ND workflow/skill friction | Route to nd-feedback-collector, link report | Inspect workflow feedback separately from application bugs |

For a clear bug task, use `.agents/templates/TASK.md` (source project or bundled starter resource). Preserve required sections: Goal and scope, Ownership and integration, Plan and acceptance, Resume State, Verification and closure. Fill:

- Mode: review-only while recording/triaging; execution authorization: not authorized. Intended remediation is separately gated; authorized developer updates mode to implementation when starting.
- Exact report path, round/bug/criterion IDs, canonical requirement and version, affected surface, severity, reproduction frequency, preconditions/test data, numbered steps, expected vs actual, redacted evidence.
- Proposed remediation scope, non-goals, risk tier and dependencies. Auth/payments/security/data-integrity bugs retain critical gates even if small.
- Acceptance: original reproduction passes, adjacent negative/regression cases pass, required UI mode/version matches, no unauthorized data changes, fresh QA retest recorded. Never prescribe an unverified root cause as fact.
- Owner: unassigned unless actually assigned; named QA reporter separate from developer owner. Exact next action and unresolved decision visible at top/Resume State.
- Task and report link each other. If work moves to wip/blocked/done, update backlinks or leave a canonical redirect. Never classify an implementation task as done just because its ticket was written.

For PRDs use `.agents/templates/PRD.md` through nd-spec-feature. Record open questions, current requirement baseline, draft status and pending approval. Do not invent selected options. Create a specification-only checkpoint; if missing product input blocks a complete draft, save partial scope and the exact decision needed. No implementation breakdown on unapproved scope.

## Project-aware plans and improvement proposals

For QA-plan initialization, gameplay coverage or workflow improvements, read [project profiles](project-profiles.md). Extend this report with profile/evidence, plan revision, execution bounds and improvement proposals. Additional local events: QA_PLAN_INITIALIZED, QA_PLAN_REVISED, WORKFLOW_IMPROVEMENT_PROPOSED and WORKFLOW_IMPROVEMENT_DECIDED. Init-only stays PLANNED/UNVERIFIED. Improvement proposals stay separate from product bugs, with approval PENDING and no authorized execution. Existing status and task/PRD routing rules still apply.

## Report skeleton

Replace placeholders with observed facts or explicit unknowns. Omit unused sections, not mandatory criteria. Use actual relative links to saved artifacts.

```markdown
# QA round <ID>: <target>

- Lifecycle: PLANNED
- Outcome: UNVERIFIED
- Operator / UTC start / last update:
- Target / environment / app version or revision / baseline changes:
- Allowed interaction mode / tools / test account role (no credentials):
- Authorized test data, side effects and cleanup:
- Scope / canonical requirement links / mandatory criterion IDs:
- Coverage: <passed>/<mandatory>; failed <n>, blocked <n>, unverified <n>
- Next owner / next action / approval needed:

## Acceptance matrix
| Criterion ID | Required behavior | Mandatory? | Result | Evidence / limitation | Bug ID |
|---|---|---|---|---|---|

## Bugs
### <round ID>-BUG-001: <observable defect>
- Status / severity / impacted users:
- Environment / reproducibility / preconditions:
- Steps:
  1. <visible action>
- Expected / actual:
- Evidence / requirement / affected criterion IDs:
- Existing issue / duplicate candidate:
- Task or PRD path / owner / next action:
- Fix revision / developer evidence / QA retest: not available

## Blockers and unverified scope
- <cause, dependent criteria, attempted recovery, owner/action>

## Status events
| Seq | UTC time | Actor | Event | Entity | From | To | Evidence / reason | Next action |
|---|---|---|---|---|---|---|---|---|

## Developer handoff
| Bug ID | Severity | Status | Task / PRD | Approval | Owner | Next action |
|---|---|---|---|---|---|---|

## Closure
- Outcome reasoning / outstanding mandatory checks:
- Cleanup completed / leftovers:
- Product fixes made: none
- Implementation / integration / deployment: unverified unless evidenced
```

Round outcome: FAIL takes precedence when any mandatory criterion failed; otherwise BLOCKED if any mandatory criterion is blocked; otherwise UNVERIFIED for missing mandatory evidence or no mandatory criteria; otherwise PASS. Exploratory findings remain separately visible even when acceptance passes; PASS is not a production-release recommendation. Retests get a new linked round so old outcomes remain intact.

## Scenario checks for skill maintainers

1. Confirmed broken Save against approved behavior: FAIL criterion; BUG_FOUND; todo task with reproduction, pending execution, no PRD.
2. Request for a new Save approval workflow: draft PRD plus specification-only checkpoint, no invented product decision or implementation.
3. Mandatory browser unavailable: bounded recovery, BLOCKED dependent checks; independent checks continue; no fake PASS or automatic P0.
4. Existing defect reproduced: append/link canonical task evidence, no duplicate ID or ownership takeover.
5. Delete button reaches shared data: stop before action, require exact approval or disposable environment; record blocked coverage.
6. Developer claims fixed but no UI retest: require fix revision and developer checks for READY_FOR_RETEST; a bare claim leaves status unchanged. Never CLOSED or done; failed retest means REOPENED.
7. Two passes and one unattempted mandatory check: overall UNVERIFIED, not PASS.
8. Known fail plus blocked check: overall FAIL, blocker still listed; report-only mode creates no remediation task.

These are contract/scenario checks, not evidence of a live browser run or production readiness.
