# Project Orientation

Verified project facts and entry points for Tauri Universal monorepo.

## Purpose and entry points
- Name / purpose / supported users: Tauri Universal platform and cross-framework application foundation.
- Main entry points and source links:
  - React desktop and web shell: `apps/tauri-app/`
  - Web Todo demo: `apps/web-todo/`
  - Cross-framework playgrounds: `apps/vue-playground/`, `apps/svelte-playground/`, `apps/native-playground/`
  - Framework-neutral contracts: `packages/core/`, `packages/pro-core/`
  - UI libraries: `packages/ui/`, `packages/pro/`, `packages/pro-vue/`, `packages/pro-svelte/`, `packages/ui-native/`
  - Desktop bindings: `packages/tauri-api/`, `apps/tauri-app/src-tauri/`
  - CLI & workflow packages: `packages/cli/`, `packages/agent-workflow/`, `packages/mcp/`, `packages/nd-workflow/`
- Runtime/version pins: Node.js >= 22, pnpm 10+, Rust 1.80+, Python 3.10+ (for ND scripts).
- [Architecture](ARCHITECTURE.md): verified monorepo architecture and boundary rules.
- Canonical current behavior/API docs: `apps/tauri-app/content/docs/`, `agent/app-foundation.md`, `llms.txt`.

## Reproduce development
| Action | Exact command | Working directory/source | Last observed result |
|---|---|---|---|
| Approved dependency setup | `pnpm install` | repository root | Verified (pnpm lockfile v9) |
| Web app dev | `pnpm dev:web` | repository root | Discovered (`apps/tauri-app`) |
| Desktop app dev | `pnpm dev` | repository root | Discovered (`apps/tauri-app` + Tauri) |
| Monorepo tests | `pnpm test` | repository root | Verified (CLI, MCP, foundation checks pass) |
| ND workflow diagnosis | `pnpm nd:doctor` | repository root | Verified (`packages/nd-workflow/bin/nd.mjs doctor .`) |
| ND workflow verification | `pnpm nd:check` | repository root | Verified (`packages/nd-workflow/bin/nd.mjs check .`) |
| Workflow consistency | `pnpm workflow:check` | repository root | Verified (~757 tokens) |
| Documentation check | `pnpm docs:check` | repository root | Verified |
| Production build | `pnpm build` | repository root | Verified (Vite / TypeScript) |

## Operations and ownership
- Deployable service/persistent data? N/A; client libraries, CLI tools, desktop shell, and static web apps.
- Responsible team/role: repository maintainers.
- Public vulnerability policy: see repository security policy if present.

## Agent adoption
- Tool/version: Mavis / MiniMax Code / Claude Code compatible.
- Canonical skills: `.agents/skills/` (ND skills + Universal UI skills).
- Skill selection: `.agents/skill-selection.json`.
- Instruction loading: root `AGENTS.md` and `CLAUDE.md`.
- Workspace boundary: `C:/Users/dila/Documents/projects/tauri-universal`.

## Durable knowledge and open risks
- Retained package `packages/nd-workflow`: contains package-internal instructions and tests; root instructions govern the monorepo.
- Case sensitivity: Windows NTFS requires consistent uppercase `.agents/docs/ARCHITECTURE.md` across scripts.
- Durable docs: all workflow docs live under `.agents/docs/`; root `docs/` is not created.
