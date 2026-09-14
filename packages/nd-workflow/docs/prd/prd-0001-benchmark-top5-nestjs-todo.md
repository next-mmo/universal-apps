---
id: "0001"
title: "Controlled Hardening Benchmark: Top 5 Workflows on NestJS VanillaJS Todo"
status: approved
last-audit: 2026-09-10
---

# Change Proposal: Controlled Hardening Benchmark for Top 5 Workflows on NestJS + Vanilla JS Todo

Use only for unresolved product scope. Local delta convention, not an OpenSpec CLI schema. Lifecycle: draft, approved, in-progress, shipped, archived; integrated but unreleased work stays in-progress with deployment pending.

## Problem and scope
- User / problem / desired outcome:
  - Problem: Existing benchmark scores in `BENHMARK.md` are historical task test counts or qualitative fit ratings. No controlled, head-to-head empirical benchmark exists comparing ND Workflow against Superpowers, OpenSpec, Compound Engineering, and GSD Core on an identical software task with reproducible defect hardening, equal models, equal tools, and identical budgets.
  - Desired outcome: An empirical benchmark protocol and evaluation harness measuring 5 workflows across 3 controlled runs each (15 total runs) against a standard seeded NestJS + vanilla JS Todo app with known defects.
- In scope:
  - Application contract: Local single-user NestJS + vanilla JS Todo application with JSON file persistence (matching existing `workflow-todo-example` REST API scope).
  - Defect seed fixture: Standardized repository state containing specific, documented defects across data validation, error handling, edge cases, and UI state sync.
  - Frameworks evaluated (5): ND Workflow, Superpowers, OpenSpec, Compound Engineering, GSD Core.
  - Execution controls: Identical runtime host, identical LLM model and version, identical tool set (shell, file read/edit, test runner), identical token/turn budget caps.
  - Sample size: 3 runs per workflow (15 total runs) for exploratory distribution with recorded variance.
  - Metrics measured: Objective acceptance pass rate (against hidden validation test suite), token consumption (input/output/total), turn count, elapsed time, human intervention count, and regression escape rate.
- Non-goals:
  - Real-world production multi-user auth / database deployment (kept as local single-user JSON per user decision).
  - Proving absolute superiority or marketing hype without statistical significance.
  - Modifying competitor upstream repositories or claiming competitor endorsements.
  - Running the benchmark during this specification phase.
- Selected requirements / open questions (clarification is not approval):
  - Selected: Seeded hardening trial (not fresh build).
  - Selected: Local single-user JSON persistence.
  - Selected: Controlled single-host/model setup.
  - Selected: 3 runs per workflow (15 exploratory runs total).
  - Open question 1: Exact model selection (e.g. Claude 3.5 Sonnet, GPT-4o, or local runtime default).
  - Open question 2: Specific list and categorization of seeded defects in the fixture.
  - Open question 3: Isolation mechanism between runs (clean git worktrees vs temporary clone directories).

## Approval record
- Scope approval: approved
- Approver / decision date: user / 2026-09-10
- Exact approved requirement IDs, exclusions and document revision or content hash: REQ-BENCH-001 through REQ-BENCH-006.
- Approval evidence: User instruction "let finish build all wip now" on 2026-09-10.
- Execution authorization: Authorized for implementation phase.
- Scope changes since approval / renewed decision needed: none (initial draft approved).

## Canonical targets and baseline
- Current feature/API/spec document(s), exact sections and stable requirement IDs:
  - Canonical target: `BENHMARK.md` (section: Empirical Benchmark Results)
  - Reference implementation target: `example/full-stack-todo-nestjs-vanillajs/` (or dedicated benchmark fixture directory)
  - Comparison reference: `BENHMARK.md` (peer frameworks and scoring dimensions)
- Source baseline revision or file-state reference:
  - Existing express todo reference: `example/full-stack-todo-express-vanillajs/` at `a00b26fc0a20abe4029202992629e8369c35667f`
- New capability: intended current-doc target; explicitly state no baseline exists:
  - No baseline exists for NestJS Todo benchmark harness or comparative trial records.
- Integration owner / related concurrent changes:
  - Integration owner: Root session coordinator. Concurrent changes: `docs/tasks/done/done-0007-spec-approval-boundaries.md` (workflow approval rules).

## Requirement changes
Use only relevant sections; each requirement has stable ID and observable scenarios. Specify full resulting behavior for modifications, not fragments dependent on old chat.

### ADDED
- REQ-BENCH-001: Seeded NestJS Todo Application Fixture
  - Behavior: NestJS backend with vanilla JS frontend, single-user JSON store, matching existing REST API routes (`GET /api/todos`, `POST /api/todos`, `PATCH /api/todos/:id`, `DELETE /api/todos/:id`). Seeded with exactly 5 known functional/security/edge-case bugs.
  - Given a fresh fixture checkout, when `npm test:api` or test suite is executed, exactly 5 specific assertions fail corresponding to the seeded defects.
- REQ-BENCH-002: Workflow Harness Configurations
  - Behavior: Independent harness configurations for each of the 5 workflows (ND Workflow, Superpowers, OpenSpec, Compound Engineering, GSD Core) defining instructions, prompt triggers, and workflow artifacts.
  - Given any of the 5 configurations, when an agent session begins, the agent follows only the designated framework instructions.
- REQ-BENCH-003: Controlled Run Execution Protocol
  - Behavior: 3 separate runs per framework (15 total runs). Pinned model, fixed system prompt format, identical tool capabilities, budget cap of 50 turns / 200k tokens per run.
  - Each run executes from a pristine checkout of the seeded fixture in an isolated directory.
- REQ-BENCH-004: Automated Evaluation & Metric Collection
  - Behavior: Post-run evaluation suite runs hidden regression tests, records token usage, wall-clock time, turn count, and file diffs into structured JSON reports.
  - Reports aggregate mean, median, min, max, and standard deviation per framework across the 3 runs.
- REQ-BENCH-005: Benchmark Publication in Repository Docs
  - Behavior: `BENHMARK.md` updated with empirical tables showing pass rates, token costs, duration, and defect escape counts, clearly stating sample size (N=3) and statistical limits.

### MODIFIED
- REQ-BENCH-006: BENHMARK.md Documentation Status
  - Existing: Contains historical 2026-09-09 test records and qualitative editorial fit scores (out of 10).
  - Modified resulting behavior: Retains historical records and qualitative fit scores as historical context, but adds a primary "Empirical Hardening Benchmark" section containing reproducible trial results once executed and verified.

## Design impact and decisions
- Components, data ownership, contracts, and trust boundaries touched:
  - Touches benchmark docs (`BENHMARK.md`), fixture directory (isolated from core workflow starter), and benchmark evaluation scripts.
  - Does not modify core framework policies in `AGENTS.md` or `.agents/`.
- Selected approach / rejected alternatives / consequences:
  - Selected: Hardening existing app with seeded bugs. Rejected: Fresh scaffold from scratch (rejected because scaffold variance obscures workflow quality and introduces non-comparable boilerplate differences).
  - Selected: JSON persistence. Rejected: SQLite / PostgreSQL (rejected to maintain parity with existing Express Todo example and keep tests zero-infrastructure).
  - Selected: 3 runs per workflow (15 runs). Rejected: 1 run (too noisy) or 10+ runs (prohibitive token cost during exploration).
- Link significant decision record only when warranted: N/A.

## Acceptance and delivery
- [ ] Fixture repository builds and runs with reproducible seeded defects.
- [ ] Evaluation harness executes all 15 runs under identical constraints.
- [ ] Hidden validation test suite reliably scores fixed defects without false positives.
- [ ] All run data (tokens, time, turns, pass/fail) captured in structured JSON logs.
- [ ] `BENHMARK.md` updated with transparent summary table, methodology, raw artifact hashes, and clear sample-size limitations.
- Risk / required approvals / rollback constraints:
  - Risk: Medium. High token consumption during run execution; execution requires separate explicit approval before running.
- Current-doc reconciliation plan: compare baseline, resolve conflicts, update canonical behavior and source/test links:
  - Update `BENHMARK.md` with empirical section and links to run artifacts; update `docs/README.md` catalog if fixture becomes a documented example.
- Implementation, integration, and deployment gates:
  - Implementation gate: Requires explicit scope approval and separate execution authorization.
  - Integration gate: All 15 runs completed, verified with hashes, summary validated against JSON data.
  - Deployment gate: N/A (documentation and benchmark fixture only).
