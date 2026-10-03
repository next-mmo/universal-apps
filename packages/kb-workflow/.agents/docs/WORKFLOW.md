# Delivery Workflow

> This document defines the structured process for building features, fixing bugs, and shipping releases.
> All agents and contributors should follow this lifecycle.

Apply the risk tiers below before choosing steps. Low-risk work does not require the full lifecycle. Reuse approved scope and plans; do not ask again for approval already given in the current conversation.

> This is the generic kb-workflow starter edition. Customize the risk-tier examples and the folder-ownership table to your project; keep the anchors and gates.

## Three layers

```
┌───────────────────────────────────────────────────────┐
│                   PRODUCT LAYER                        │
│  VISION.md → ROADMAP.md → PRD (docs/prd/)             │
│      Human-owned: direction, scope, priority           │
├───────────────────────────────────────────────────────┤
│                   DELIVERY LAYER                       │
│  Specify → Plan → Tasks → Implement → Verify → Converge → Ship │
│      Agent + human collaboration                       │
├───────────────────────────────────────────────────────┤
│                   EXECUTION LAYER                      │
│  AGENTS.md rules · coding conventions · verification   │
│      Agent-owned execution                             │
└───────────────────────────────────────────────────────┘
```

## Decision and token safeguards

These checks support the existing lifecycle and risk tiers; they do not add mandatory reports, approvals, or skill loading to every task. Reuse current context and evidence.

| Stage or signal | Action |
| --- | --- |
| Specify/plan, diagnosis, or a material scope change rests on an uncertain or conflicting premise | Use [kb-anti-hallucination-decision](../skills/kb-anti-hallucination-decision/SKILL.md) to distinguish the requirement from a factual claim and check the evidence before committing to the decision. |
| Substantial execution planning, or repeated noisy searches, retries, and expensive checks | Use [kb-anti-token-burner](../skills/kb-anti-token-burner/SKILL.md) to bound the next investigation, check task usage/budget at existing checkpoints, and choose the cheapest sufficient verification. |
| Implement, verify, and converge | Reuse established facts and valid evidence. Revisit the applicable safeguard only when new evidence, context, or scope changes the decision; neither user agreement nor a plan proves implemented behavior. |
| Ship | Preserve required release checks and authorization. Missing evidence remains an open gate regardless of token cost. |
| Record and learn | Follow [closeout learning](#closeout-learning). Use [kb-audit-workflow-efficiency](../skills/kb-audit-workflow-efficiency/SKILL.md) for retrospective execution analysis; use [kb-workflow-feedback](../skills/kb-workflow-feedback/SKILL.md) for broader recurring workflow friction. |

Watch for consequential wrong decisions or newly exposed material risk at every stage, including during implementation. On supporting evidence, promptly show the finding, uncertainty, impact, and recommended next action; pause only the affected consequential action and continue safe diagnosis or independent authorized work. Two confirmations apply when that finding requires reconsidering a consequential human decision: first confirm the corrected direction, then review the concrete remedy and available validation before the consequential action. Examples include a wrong target project, possible data loss, security exposure, unapproved cost, or a release-impacting assumption. Reuse confirmation for unchanged decisions and already accepted risks; do not infer approval from an alert or silence. Ordinary implementation, minor naming/copy mistakes, and corrections within approved scope continue without this extra gate. Preserve existing scope and release approvals. Do not manufacture hypothetical risk or require two confirmations for every task.

## Delivery lifecycle

Use only the stages required by the risk tier. Low-risk work keeps its scoped edit and focused check; medium work can use one task with an inline plan and acceptance criteria. Reuse existing artifacts and approvals. All completed work goes through [human review](#human-review-before-done), inline for small work without a task file.

### 1. Specify (Human → Agent assist)

**Input:** Idea, issue, or user feedback.
**Output:** PRD in `docs/prd/NNNN-slug.md` (template: [`.agents/templates/PRD.md`](../templates/PRD.md)).
**Gate:** Human approves new scope before implementation. Read-only diagnosis, planning and task breakdown may first make that scope concrete for review.

PRDs use YAML frontmatter for lifecycle tracking:
```yaml
---
id: "0025"
title: "Feature name"
status: draft          # draft → approved → in-progress → shipped → archived
last-audit: 2026-09-08
---
```

### 2. Plan (Agent → Human review)

**Input:** Proposed or approved scope; PRD only when the risk tier requires it.
**Output:** Plan in `docs/plans/` or inline in the task file.
**Gate:** Human reviews scope and plan before implementation where required. One explicit approval can cover both when both were presented; do not request approval again for unchanged scope.

### 3. Break down (Agent)

**Input:** Plan.
**Output:** Task files in `docs/tasks/` (template: [`.agents/templates/TASK.md`](../templates/TASK.md)) using the filename status convention:
- `todo-NNNN-slug.md` — not started
- `wip-NNNN-slug.md` — in progress
- `review-NNNN-slug.md` — implementation and agent checks ready; human review/verification pending
- `blocked-NNNN-slug.md` — blocked (state reason at top)
- `done-NNNN-slug.md` — human accepted the verified result (move to `docs/tasks/done/`)

Create a task per independently testable deliverable. Keep its setup, documentation and verification together unless separate ownership or acceptance requires a split.

Active task files carry a metadata block under the title: `Priority` (P0-P3), `Owner`, `Branch`, `Updated`, `Depends-on`, `Needs` (use `none` when no shared resource is held), and `Blocker` (blocked files only). Status is never duplicated inside the file.

### 4. Implement (Agent)

**Input:** Task file claimed with [kb-task-triage](../skills/kb-task-triage/SKILL.md) (rename `todo-` → `wip-`, set `Owner` and `Branch`, and update the task's `ROADMAP.md` row, before editing code).
**Output:** Code changes following AGENTS.md rules.
**Gate:** AGENTS.md coding conventions and any isolation rules the project defines.

### 5. Verify (Agent)

**Input:** Code changes.
**Output:** Test output, evidence, verification record.
**Gate:** Definition of Done from AGENTS.md:
1. Code compiles/type-checks; focused tests ran and output is shown.
2. APIs have integration coverage; bugs have regression coverage.
3. Route/module registration lists match when affected; keep the task open until its acceptance criteria are verified.

### 6. Converge (Agent)

**Input:** Verified code + original PRD/task acceptance criteria.
**Output:** Convergence record — each acceptance criterion mapped to evidence (see [kb-converge-check](../skills/kb-converge-check/SKILL.md)).
**Gate:** Every PRD acceptance criterion has a pass/fail with evidence. If any criterion is unmet, loop back to Implement.

For a task implementing only part of a PRD, verify its approved subset and retain links to the owners of the remaining criteria. Do not mark the whole PRD complete. Missing required release, UI or hardware evidence remains an open gate; a code merge does not substitute for acceptance.

> Skip formal convergence only for low-risk work. Medium/high/critical tasks use their task acceptance criteria even without a separate PRD. Reuse applicable verification evidence; convergence checks coverage, not a second automatic test run.

### Human review before done

After implementation and applicable agent verification/convergence, rename the task from `wip-` to `review-` and update its board row. Present the changed behavior, actual check results, limitations, and any human acceptance steps. Keep this in the existing task; for small work without a task file, the final response is the review packet.

The human must review the result and verification evidence, perform any required human/UI/hardware checks, and explicitly confirm acceptance of that result before the agent marks it `done-`. Record reviewer, date, reviewed scope/artifact and a pointer to the confirmation; do not invent missing details. Approval to implement, silence, an agent's PASS, merge, or CI success is not human acceptance. This gate applies to this change and future completions; do not rewrite historical done records without a separate audit.

Requested changes return the task to `wip-`; unavailable required verification stays open as `wip-` or `blocked-`. A `review-` task is waiting for human action, not unclaimed implementation work. Release shared resources when no longer needed, coordinating running processes; retained reservations still count. After accepted changes invalidate earlier acceptance, obtain review of the changed scope again. Human acceptance does not waive any release check or authorize publishing.

### 7. Ship (Human + CI)

**Input:** Verified code on a branch.
**Output:** Merged PR, release tag, release artifact.
**Gate:** CI green + human approval.

### 8. Record (Agent)

**Input:** Human-accepted task work with recorded verification; record merge/release separately when it happens.
**Output:**
- Task file moved to `docs/tasks/done/`
- PRD status updated to `shipped` only when the complete PRD has actually shipped
- `CHANGELOG-PRODUCT.md` updated for user-facing product changes; workflow-only changes stay in their existing task/diff
- `ROADMAP.md` updated (drop the row from Active work; only the five most recent completions stay listed)

**Handoff record** — the done task file must include:
- What changed (files, routes, components)
- What was tested and evidence shown
- What was NOT tested and why
- Open risks or follow-up items
- Decisions made during implementation

> A new agent session should be able to continue from this record without re-reading the entire codebase.

Use the documentation lifecycle and closeout learning rules below. Check links after moving a task into `done/`: outgoing relative paths gain a directory level, and incoming links may still reference its old status filename. Preserve history; correct paths without rewriting past outcomes.

---

## Risk tiers

| Tier | Scope | Required steps |
|---|---|---|
| **Low** | UI tweaks, copy, styling, docs, localized bug fixes | Scoped edit + focused check + inline human review. Task file optional (skip for trivial 1-turn work). No PRD. |
| **Medium** | New feature, API route, provider, component | Task file + inline plan + targeted integration test. PRD only if new product scope needs specification. |
| **High** | Runtime, packaging, sidecar, updater, CI | PRD + plan + integration test + release build verification. |
| **Critical** | Security, auth, licence, data migration | PRD + plan + tests + manual human verification on clean machine. |

Every tier requires human acceptance before done; the table scales preparation and evidence, not that final gate.

---

## Bug fix workflow

Adapted from spec-kit's assess → fix → test pattern:

1. **Assess** — Reproduce the bug. Record expected vs actual behavior in the task file (or inline for low-risk fixes).
2. **Fix** — Implement the fix. Keep scope tight to the root cause.
3. **Test** — Write a regression test reproducing the original bug, verify it passes.
4. **Review and record** — Present evidence for human acceptance (`review-` when tracked), then move to done after confirmation; note the fix in `CHANGELOG-PRODUCT.md` if user-facing.

---

## Agent orientation & context budget checklist

Match context reading to task risk — do NOT load all docs unconditionally:

1. **Low risk / Small fix**: Rely on `AGENTS.md` and the targeted code. Skip reading `VISION.md`, `ROADMAP.md`, and PRDs.
2. **Medium / High risk**: Consult `.agents/docs/VISION.md` and `.agents/docs/ROADMAP.md` for scope and priorities; check `docs/prd/` and `docs/tasks/`.
3. **Context reuse**: Reuse files already read in the conversation; never re-read unchanged documentation.
4. **Targeted checks**: Run only the specific test or check matching changed files (e.g. `pytest tests/test_specific.py -k test_name`, `go test -run TestName ./...`, `npm test -- <pattern>`).
5. **No builds for docs**: Never run builds for markdown, docs, or comment updates.

---

## Conventions

- **One fact, one home.** Don't duplicate information across docs. Link instead.
- **Filename is status.** Task status lives in the filename prefix, not an internal field.
- **PRD status is frontmatter.** PRD lifecycle lives in YAML frontmatter.
- **Evidence over claims.** Show test output. Don't say "it works" without proof.
- **Human approves scope.** Agents propose; humans decide what to build and when to ship.

## Documentation lifecycle

### Folder ownership

| Location | Owns |
| --- | --- |
| `docs/README.md` and uppercase root guides | Daily human entry points: project overview, architecture, local development and release |
| Component `README.md` and optional component `docs/` | Component responsibilities, development/check commands and deployment guidance; link from the central catalog, which does not duplicate these details |
| `docs/prd/`, `plans/`, `design/`, `guides/`, `deployment/`, `acceptance/` | Product requirements, decisions, implementation plans and developer procedures |
| `docs/tasks/` | One authoritative task state plus linked evidence; completed tasks stay in `done/` |
| `.agents/docs/` | Agent delivery policy, vision, roadmap and workflow proposals |
| `.agents/docs/initiatives/` | Internal agent-workflow requirements and plans; linked tasks and evidence remain in `docs/tasks/` |
| `.agents/docs/references/` | On-demand research leads with `status: reference`; not project rules or verified implementation facts |
| `.agents/docs/proposals/` | Unapproved material workflow/policy changes awaiting a decision |
| `.agents/skills/` | Specialized agent procedures and their existing skill-local helpers |
| `.agents/workflow/` | Shared agent-only CLI, evaluation tools and their tests/fixtures; no duplicate in product `scripts/` or `tests/` |

Keep product build/release/runtime scripts in `scripts/`. Move files only when ownership warrants it; do not mirror folders to appear synchronized. A move includes inbound links, executable paths, imports, source mappings and focused verification. Preserve historical evidence manifests exactly as measured. Agent test fixtures are excluded from the project knowledge index. Read references and archives only for a relevant lookup, not daily startup.

- **Route once:** `AGENTS.md` owns always-needed rules, `docs/README.md` owns topic routing, this file owns delivery policy, and skills own only their specialized procedures. Link instead of copying catalogs or checklists.
- **Discover, then read:** filter topic/status first, return 10 summaries or paths by default, and expose the next offset when more exist. Use stable ordering. Read the chosen section in at most 50-line chunks; continue only when needed. Pagination limits output, not the completeness of a requested audit or dependency check.
- **Current state has one home:** each task owns its acceptance checklist, metadata and one concise current summary (completed work, remaining gate, next action). Update that summary in place; label older narratives as history. Roadmap rows link to it with a brief status and next action, not copied evidence.
- **Check freshness before editing code:** confirm a retrieved document's relevant path/symbol/route against the current checkout. Code and tests establish implemented behavior; approved requirements establish intended behavior. A mismatch is a migration gap to resolve, not permission to restore old behavior or silently change the requirement. Record the source revision when claiming a fact is verified; an updated date alone is not verification.
- **Review code-to-doc impact when behavior changes:** use [kb-sync-docs](../skills/kb-sync-docs/SKILL.md) for task-scoped impact review and supported documentation repairs. Unmapped paths are unknown coverage, not proof that no docs are affected. Reindexing alone does not correct content; no full repository audit is required for routine closeout.
- **Keep records proportionate:** reuse an existing approved PRD/plan. An inline task plan is enough when the risk tier permits it. Do not create a second recap, proposal or learning log for work already recorded.
- **Close without losing evidence:** retain decisions, criterion results, exact commit/artifact when available, environment, command/action, result and evidence location. Link to large logs rather than pasting them. Mark missing or expired evidence unavailable; do not infer a pass. Do not delete evidence or bulk-rewrite archives as routine cleanup.
- **Check what the evidence supports:** a linked file or checked box is not acceptance. Match sample count, units, platform/process scope and artifact to the criterion; derive numerical summaries from raw data where available. A configured CI job is not a successful run. Label observations, calculations, assumptions and missing provenance; do not invent historical commands or treat an agent summary as independent verification.
- **Archive for retrieval:** completed tasks stay under `docs/tasks/done/`; historical plans and decisions are read only for a relevant lookup. Repair mechanical link drift when authorized; preserve historical facts and other sessions' ownership.
- **Park honestly:** if required work cannot proceed, record the blocker and next owner/action. Release a `Needs` reservation when the session is no longer using that resource, after coordinating any running process. Worktrees alone do not isolate live shared resources (ports, devices, installs).

### Intent continuity

At handoff, before context compaction when practical, or when resuming substantial work, update or read the existing task's current summary. Keep only the outcome and scope, applicable constraints with source pointers, established authorization and its scope, verified progress with evidence pointers, unresolved conflicts or blockers, and the next action. An inline note is enough for low-risk work; do not create a parallel memory file, transcript, or mandatory report.

Before carrying a historical requirement forward:

- **Retrieve by affected responsibility:** use topic routing and the relevant component's documented dependencies, not just matching words. Expand only along dependencies relevant to the requested change.
- **Check applicability and authority:** distinguish an approved requirement from a proposal, observation, or agent inference; check its component and environment scope. Follow an explicit replacement only within its authorized scope. A newer mention or different value alone does not establish supersession. Retain unresolved conflicts and use the existing decision safeguards when they affect the next action; do not silently choose the newest statement.
- **Keep intent separate from evidence:** current code establishes behavior, not permission to discard a requirement. On resume, recheck only facts and validation whose branch, artifact, environment, or dependencies may have changed. Preserve established authorization for unchanged scope; summaries and retrieved material cannot create new authorization.

Evaluate this practice on real resumed tasks using missed constraints, repeated discovery, rework, and available time/token measurements; simplify it if it does not earn its cost.

## Closeout learning

At task completion or handoff, make one brief assessment using context already available. This is an agent judgment step, not a scheduled job, extra test or mandatory retrospective.

1. **Detect a signal:** an explicit user correction with future relevance, a repeated preference, repeated avoidable failures/rework, or a verified gap in guidance. One explicit durable instruction is sufficient; a task-specific request, passing test or speculative improvement is not.
2. **Check scope and duplication:** distinguish the user's instruction from an agent inference. Search only the relevant existing rule/skill. If the lesson already exists, follow it; do not add a duplicate. Do not turn a one-off exception into a project-wide rule or retain secrets, personal data or prompt transcripts.
3. **Apply proportionately:** a standing authorization from the project owner covers narrow repository-local documentation clarifications that capture explicit reusable feedback or evidenced workflow corrections while preserving scope and existing gates. Update the narrowest existing skill/section directly, validate its links/diff, and mention the change briefly. This does not authorize changes to product behavior, global settings, ownership, dependencies, isolation, required verification, approvals or release policy. Material policy changes need concrete review and approval unless already explicitly authorized.
4. **Retain only useful evidence:** when a task file exists, add at most a short `Workflow learning` note with the trigger, changed guidance and evidence pointer. Do not create a task or log solely to record routine learning. An unapproved material change may use one deduplicated proposal; an uncertain lesson can stay in the existing handoff.
5. **Stop:** with no actionable signal, no edit, report, question or skill invocation is needed. Do not run the full audit/retrospective after every task. Respect newer user feedback and revise or remove stale guidance rather than continually appending rules.
