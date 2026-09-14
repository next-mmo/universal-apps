# Project-aware QA initialization and workflow proposals

Extend nd-user-testing using the existing [handoff contract](qa-handoff.md). Initialize a QA plan and status ledger, not an application, ND installation, test framework or runtime environment. Existing safety and interaction-mode rules still apply.

## Initialize from evidence

1. Identify target and user goal. Inspect current requirements, project catalog, manifests and existing tests only through permitted tools. For visible-UI-only rounds use visible application/help/docs and mark unavailable facts unknown; do not substitute terminal/source inspection. Use declared behavior and observed surfaces together, not a framework name as proof of product type.
2. Select app, game, CLI, workflow, mixed or unknown profile. Record evidence and confidence for the choice. For mixed products apply relevant profiles by surface, deduplicate shared checks, and keep stable criterion IDs. If unknown, save partial plan and ask only for facts that block safe coverage; do not guess gameplay rules or supported devices.
3. Turn relevant candidate checks below into concrete steps, expected results, source requirement, test data, allowed mode and evidence method. Mandatory criteria come from the requested/approved scope. Other profile suggestions are exploratory; they do not silently expand release requirements. Record excluded checks and reasons (unsupported, out of scope or unknown). Unknown required behavior is UNVERIFIED, not excluded to obtain PASS.
4. Persist plan in the existing QA report skeleton. Add profile/evidence, plan revision, initialization scope, candidate decisions, risk order, execution bounds and improvement backlog. Use requested time/round budget; otherwise state a bounded first pass over named flows and stop after that checklist. Do not begin an unlimited play or retry loop.
5. Append QA_PLAN_INITIALIZED with evidence and next action. Lifecycle PLANNED, outcome UNVERIFIED, every unattempted check UNVERIFIED. Init-only stops here: no app launch, gameplay, test execution, dependency installation, fixture creation or nd-setup-project invocation. A request to initialize and run permits continuing the round within its stated test scope and safety gates; emit ROUND_STARTED only when execution starts.
6. On resume reuse the report, IDs and evidence. Revalidate target/version and approvals. Append QA_PLAN_REVISED with previous/new plan revision and reason for permitted changes; never silently remove mandatory checks, erase failed evidence or broaden test permissions. Material scope changes require user approval before execution. If prior evidence becomes stale, mark affected checks UNVERIFIED and retain its history.

## Candidate profiles

Use only capabilities actually present or required. These are prompts for planning, not assertions that the app supports them.

| Profile | Candidate user journeys | Evidence to preserve |
|---|---|---|
| App | Navigation, forms, validation, CRUD, loading/empty/error states, role boundaries, refresh/persistence, keyboard focus and supported layouts | Role, disposable record IDs, visible before/after state, expected vs actual |
| Game | Start/tutorial, controls, legal/illegal moves, turn order or timing, score/lives, pause/resume, win/loss/draw where applicable, terminal-state lockout, restart, save/load if supported | Game mode, level, initial state, action sequence, outcome, seed only if exposed by permitted UI, actual input/focus and observed result |
| CLI | Help, valid/invalid arguments, input validation, stdout/stderr, exit status, interactive prompts where supported, repeated execution and file outputs | Exact safe command/inputs, working directory, exit result, redacted output and disposable file state |
| Workflow | Entry conditions, approval gates, status transitions, handoff, pause/resume, retries, failure recovery and durable records | Actor/role, trigger, prior/new state, timestamps, ownership, approvals, artifact links |

For games, distinguish functional defects from subjective difficulty/balance feedback. Do not force wins, alter saves, inject internal state or claim terminal coverage from code alone. Random or timing-dependent behavior needs initial conditions, observed frequency and uncertainty; inability to reach a terminal state within budget stays UNVERIFIED when required. Network play, purchases, chat and shared leaderboards retain external-action gates. For CLI in UI-only mode use an allowed visible terminal surface only if explicitly included; otherwise record blocked coverage, not a hidden shell workaround.

## Workflow improvement review: propose only

After the round, inspect its evidence for redundant approvals, missing context, unclear steps, broken handoff, status drift, repeated retries or missing recovery guidance. No evidence-backed improvement means no-op. Distinguish product bug, environment constraint, agent execution error and instruction defect; correct instructions ignored by an agent do not justify rewriting the skill.

- Create a stable `<round>-IMP-NNN` proposal with observed friction, evidence/event links, affected workflow/skill and exact section if known, user impact, proposed change, risk, expected benefit (hypothesis), validation scenario, owner and next action. Do not promise token/time savings without measured evidence.
- When workflow-improvement triage is authorized, deduplicate and create/reuse `docs/tasks/todo-NNNN-<slug>.md` using ND TASK template. Mode review-only while drafting; implementation not authorized; approval pending. Report-only rounds keep proposals in the report and create no tasks. Preserve existing assigned ownership.
- Clear instruction/workflow correction needs a task, not a duplicate PRD. Unresolved product behavior goes through nd-spec-feature as draft PRD plus specification-only checkpoint. ND-specific friction may link nd-feedback-collector evidence, but do not create competing canonical tickets.
- Append WORKFLOW_IMPROVEMENT_PROPOSED and TASK_LINKED or PRD_DRAFTED only after actual records exist. Status PROPOSED, approval PENDING. An explicit owner decision can mark ACCEPTED, REJECTED or DEFERRED with actor/date/reason and WORKFLOW_IMPROVEMENT_DECIDED. ACCEPTED does not authorize execution by itself.
- Wait for explicit approval and execution authorization before editing shared workflows, skills, project instructions, event rules or configuration. Use nd-skill-editor for later authorized skill changes, nd-setup-project for separately requested adoption, and ordinary ND task gates for other changes. Never automatically apply proposals, self-modify nd-user-testing, or start an improvement loop. Retest improvement separately with before/after evidence after authorized implementation.

## Additional report fields

Insert into the QA report; keep one canonical ledger rather than a second status board.

```markdown
## QA initialization
- Profile / surfaces / evidence / confidence:
- Plan revision / target version / initialization scope:
- Execution bounds / named flows / stop condition:
| Candidate | Include? | Mandatory or exploratory | Source / reason | Criterion ID |
|---|---|---|---|---|

## Workflow improvement proposals
| Improvement ID | Friction / evidence | Proposed change | Task / PRD | Status | Approval | Owner / next action |
|---|---|---|---|---|---|---|
```

New event names use the existing sequence/time/actor/entity/from/to/evidence/next-action schema: QA_PLAN_INITIALIZED, QA_PLAN_REVISED, WORKFLOW_IMPROVEMENT_PROPOSED, WORKFLOW_IMPROVEMENT_DECIDED. These are local recorded events, not hooks or background automation.

## Maintainer scenarios

- Tic-Tac-Toe with documented draw: plan legal moves, turn alternation, win/draw/restart; no invented lives, save system or network play. Init-only executes no moves.
- Endless runner without documented victory: plan controls, score, collision/loss and restart; do not add a mandatory win state.
- Admin app with approval workflow: mixed app/workflow profile, shared criterion IDs for approval checks; require disposable accounts/data.
- CLI project requested in strict browser-only mode: save partial plan, mark incompatible checks BLOCKED when execution is attempted; do not run shell commands.
- Repeated missing handoff context: evidence-backed IMP proposal and planned task when authorized; leave workflow unchanged, approval PENDING.
- Agent skipped a correct documented safety step: record execution error, not a claim that skill text needs removal.
- Existing failed criterion on resume: retain failure history; do not replace plan with a smaller passing checklist.

These scenarios validate instruction decisions only. They are not live game/app/CLI execution evidence.
