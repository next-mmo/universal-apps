# Task 0001: Adopt Agent Workflow Scrum

> **Status:** wip  
> **Scrum Artifact:** sprint increment  
> **Created:** 2026-09-03  
> **PRD:** `.agents/docs/prd/0001-tauri-universal-platform.md` (context baseline only; no product behavior change authorized)

## Outcome

Tauri Universal has a repository-local, pnpm-aware Agent Workflow Scrum foundation that preserves its existing agent contract and product work.

## Change Contract

- **Human outcome:** developers and agents can start with bounded context, track one increment, select checks from exact Git scope, and hand off evidence without importing Counter-demo history.
- **Acceptance evidence:** tailored docs and commands pass workflow/document/adapter checks; existing lint, build, CLI, and MCP checks remain green.
- **Non-goals:** do not change application behavior, modify the pre-existing route edit, install Graphify/OpenViking, configure remote services, deploy, commit, or push.
- **Affected layers:** root agent/context guidance, `.agents/` skills/scripts/docs, package scripts, ignore rules, and CI.
- **Risk:** standard developer-workflow change; human acceptance required before completion.
- **Baseline:** `apps/tauri-app/src/routes.tsx` was already modified before initialization and remains outside this task.
- **Recovery:** remove the added workflow files/scripts and restore only this task's hunks in existing files; retain the pre-existing route edit.

## Acceptance Criteria

- [x] Reusable committed scripts and skills are present without Counter PRDs/tasks or pending benchmark work.
- [x] Root instructions preserve the existing plan-approval and package-import rules.
- [x] Context, verification routing, documentation, and commands match pnpm and the monorepo layout.
- [x] Graphify and OpenViking remain optional, with OpenViking explicit-only.
- [x] Workflow, documentation, adapter, lint, test, and build checks pass with fresh evidence.
- [ ] Human accepts the initialized workflow.

## Evidence Ledger

| Claim | Evidence | Result |
| :--- | :--- | :--- |
| Pre-existing work preserved | Initial and final route diff both report 1 insertion/2 deletions | Passed; task did not edit `apps/tauri-app/src/routes.tsx` |
| Baseline lint | `pnpm lint` | Passed with existing warnings |
| Baseline CLI integration | `pnpm agent:test` | 9 checks passed |
| Baseline MCP integration | `pnpm mcp:test` | 8 checks passed; existing Node/npm warnings |
| Locked setup | `pnpm install --frozen-lockfile` | Passed |
| Smart context | `pnpm context "initialize Agent Workflow Scrum in existing Tauri Universal pnpm monorepo"` | Passed; L0 estimated 876/1500 tokens |
| Exact scope and plan | `pnpm change:scope --base origin/main`; `pnpm verify:plan --base origin/main` | Passed; resolved base/head/merge-base `7103d7985319` and selected pnpm checks |
| Workflow and documentation | `pnpm workflow:check --strict-budget --base origin/main`; `pnpm docs:check` | Passed; Scrum skill has a 872/900 headroom warning |
| Agent adapters | Git Bash `.agents/scripts/skill.sh init all` and `check all` | Passed; generated Claude/Cursor files remain ignored |
| Product tests | `pnpm test` | Passed: 9 CLI and 8 MCP integration checks |
| Generated agent docs | `pnpm agent:docs:check` | Passed: 33 pages |
| Static analysis | `pnpm lint` | Passed with warnings; imported sequential workflow loops and existing product warnings remain non-failing |
| Production build | `pnpm build` | Passed: 4,283 modules transformed; existing externalized-module and large-chunk warnings remain |
| CI definition | `.github/workflows/agent-workflow.yml` | Added; remote GitHub execution pending first push/PR |

## Approved scoped extension: Tauri Universal UI skills

The increment also includes a first-party UI skill family inspired by the structure of the public gluestack-ui-v5 skill. It is adapted to this repository's actual React DOM, React Native Web, token, scaffold, catalog, and workflow contracts; it does not add gluestack dependencies or copy gluestack APIs into the product.

### Extension acceptance

- [x] Eight top-level skills are present under `.agents/skills/` and individually pass the skill validator.
- [x] Parent routing and focused setup, component creation, composition, styling, variants, performance, and validation guidance match repository ownership.
- [x] Skill metadata is present and implicit invocation remains enabled.
- [x] The repository adapter check passes in the current Git Bash environment: `bash .agents/scripts/skill.sh check` and `check all` both pass.

### Extension evidence

| Claim | Evidence | Result |
| --- | --- | --- |
| Eight skills have valid structure | `quick_validate.py` run against all eight new skill folders | Passed |
| Workflow consistency | `pnpm workflow:check --strict-budget` | Passed; existing Scrum skill remains near its documentation budget |
| Documentation integrity | `pnpm docs:check`; `pnpm agent:docs:check` | Passed; 33 generated agent pages are current |
| Existing agent checks | `pnpm agent check --changed` | Passed: 12 checks |
| Canonical adapter check | `bash .agents/scripts/skill.sh check` and `check all` | Passed in this Git Bash environment; the earlier CRLF block was specific to that Windows/WSL invocation |

## Approved scoped extension: Reuse-first token efficiency

User approved the complete implementation plan on 2026-09-05. [Suggestion 0001](../suggestions/0001-reuse-first-token-efficiency.md) records the decision and exact policy targets. This extension changes repository guidance and evaluation instructions only; prior work and human acceptance remain unchanged. Recover by reverting only this extension's hunks and generated copies.

### Token-efficiency acceptance

- [x] Root guidance routes to a reuse-first sequence that preserves requirements and approvals.
- [x] Context and verification guidance avoid redundant work without losing fresh evidence or required checks.
- [x] Evaluation guidance covers equivalent reuse, defect, and security tasks with host input/output tokens, calls, repeated reads, and verification outcomes.
- [x] Standing instruction and entry-point estimates show no net growth; report behavioral savings as unmeasured.
- [x] Workflow/documentation checks pass and affected existing adapters match canonical sources; record unrelated baseline adapter failures separately.

### Token-efficiency evidence

| Claim | Evidence | Result |
| --- | --- | --- |
| Baseline | `pnpm workflow:check --strict-budget`; `pnpm docs:check` | Passed; root ~690 tokens, Scrum entry point ~872 tokens; existing Scrum budget headroom warning |
| Baseline working tree | `git status --short` | Clean before this extension; prior task evidence above is historical |
| Reuse-first guidance | `AGENTS.md`; Scrum delivery reference | Passed; root routing and delivery sequence preserve approvals, contracts, and safety boundaries |
| Bounded context and verification | Scrum context-routing and verification references | Passed; named uncertainty/freshness and meaningful regression/negative-path rules are explicit |
| Evaluation coverage | `agent/evals.md` | Passed; host input/output, calls, repeated reads, equivalent reuse, defect, and security scenarios are specified |
| Final workflow/documentation | `pnpm workflow:check --strict-budget`; `pnpm docs:check` | Passed; root ~673/800, Scrum entry point ~872/900 with existing headroom warning |
| Existing adapters | `bash .agents/scripts/skill.sh check all` | Passed after syncing ignored Claude/Cursor adapters |
| Changed-scope agent checks | `pnpm agent check --changed`; `pnpm agent:docs:check`; `git diff --check` | Passed: 7 checks, 33 generated pages, clean diff check |
| Behavioral savings | Paired baseline/revised agent runs | Unmeasured; no percentage claimed |

## Approved scoped extension: Todo workflow starter

User approved the starter package and CLI slice on 2026-09-05. The implementation adds `@package/agent-workflow` and exposes `pnpm agent init todo`; it keeps the starter focused on a product brief and first task so agents can begin with bounded context instead of copying a large application. The existing `apps/web-todo` remains the reference consumer.

### Starter acceptance

- [x] `@package/agent-workflow` exposes a safe starter registry and writer with stable subpath exports.
- [x] `pnpm agent init todo` supports `--dry-run` and `--json`, refuses directory conflicts, and does not overwrite existing files.
- [x] The Todo starter creates only concise `AGENTS.md`, `README.md`, PRD, and active-task/evidence files.
- [x] The agent catalog and `llms.txt` route users to the starter and existing Todo example.
- [x] Changed-scope checks include both CLI and starter-package typechecks.

### Starter evidence

| Claim | Evidence | Result |
| --- | --- | --- |
| Package contracts | `pnpm exec tsc -p packages/agent-workflow/tsconfig.json` | Passed |
| CLI integration | `pnpm agent:test` | Passed: 13 assertions, including dry-run, creation, and rerun preservation |
| Catalog route | `pnpm agent recipe todo-starter --framework universal` | Passed; bounded output includes command, example, and verification |
| Budget | `pnpm agent budget --check` | Passed; default response 248/1200 chars |
| Changed-scope coverage | `pnpm agent check --changed` | Passed: 13 checks in 108.5s; lockfile scope selected the full consumer build matrix |
