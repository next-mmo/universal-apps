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
- [ ] The repository adapter check passes in the current shell environment; the current run is blocked by pre-existing CRLF handling in `.agents/scripts/skill.sh` and the two existing workflow skills.

### Extension evidence

| Claim | Evidence | Result |
| --- | --- | --- |
| Eight skills have valid structure | `quick_validate.py` run against all eight new skill folders | Passed |
| Workflow consistency | `pnpm workflow:check --strict-budget` | Passed; existing Scrum skill remains near its documentation budget |
| Documentation integrity | `pnpm docs:check`; `pnpm agent:docs:check` | Passed; 33 generated agent pages are current |
| Existing agent checks | `pnpm agent check --changed` | Passed: 12 checks |
| Canonical adapter check | `bash .agents/scripts/skill.sh check` | Not passed in this Windows/WSL invocation: `set -euo pipefail` and existing frontmatter checks encounter CRLF; no new-skill-specific failure was reported |
