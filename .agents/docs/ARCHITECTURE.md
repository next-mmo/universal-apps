# Tauri Universal Architecture and Ownership

## Product composition

| Area | Owner | Boundary |
| :--- | :--- | :--- |
| React application and docs | `apps/tauri-app/` | Browser UI, Tauri shell, generated agent documentation |
| Example consumers | `apps/web-todo/`, `apps/*-playground/` | Integration evidence for shared packages |
| Framework-neutral contracts | `packages/core/`, `packages/pro-core/` | Schemas and behavior without UI/platform dependencies |
| UI and feature packages | `packages/ui/`, `packages/pro/` | Stable React subpath exports |
| Framework adapters | `packages/pro-vue/`, `packages/pro-svelte/`, `packages/ui-native/` | Vue, Svelte, and React Native Web bindings |
| Desktop boundary | `packages/tauri-api/`, `apps/tauri-app/src-tauri/` | Typed commands, browser fallbacks, Rust capabilities |
| Agent interfaces | `packages/cli/`, `packages/agent-workflow/`, `packages/mcp/`, `llms.txt` | Bounded discovery, workflow starters, documentation, recipes, and MCP tools |

Application documentation under `apps/tauri-app/content/docs/` owns public usage guidance. `llms.txt` routes agents to focused material; generated bundles are derived.

## Workflow planes

Agent Workflow Scrum separates four information classes:

1. **Decision:** human approval, active task, affected PRD, and applied policy define intended behavior.
2. **Observation:** current source, direct runtime evidence, checks, and exact Git scope establish current behavior.
3. **Context:** local routing selects bounded relevant material; Graphify and OpenViking add optional advisory evidence.
4. **Execution:** Discover → Define → Implement → Verify → Review → Sync/Handoff → Learn.

Do not use tests or retrieved context to override a requirement. Do not use a requirement as proof that code works.

## Workflow ownership

| Component | Owns | Must not own |
| :--- | :--- | :--- |
| `AGENTS.md` | Compact standing repository policy | Detailed procedure or history |
| `CONTEXT.md` | Durable context, authority, and recovery map | Task implementation detail |
| `.agents/skills/` | Canonical agent workflows | Product requirements |
| `.agents/scripts/` | Context, scope, verification, checks, adapters | Human approval |
| `.agents/docs/prd/` | Current product requirements | Implementation evidence |
| `.agents/docs/tasks/` | Current increment and recovery state | Reusable global policy |
| `.agents/docs/tasks/done/` | Completed evidence | Current authority |
| `.agents/docs/suggestions/` | Workflow proposals and decisions | Product requirements |

## Verification boundaries

`change:scope` reports committed, staged, unstaged, and untracked paths from an explicit base. `verify:plan` maps those facts to pnpm checks for this monorepo, but path mapping cannot prove dynamic imports, generated docs, subprocesses, MCP protocol behavior, Tauri commands, or native capabilities. Add the narrowest owning boundary check.

The context and workflow checkers treat `apps/`, `packages/`, and `apps/tauri-app/src-tauri/` as product paths. Product changes therefore require one active task plus a referenced PRD and evidence ledger.
