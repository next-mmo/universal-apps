# Project Orientation

Verified project facts and entry points for the Tauri Universal monorepo.

## Purpose and entry points
- Name / purpose / supported users: Tauri Universal platform and cross-framework application foundation.
- Main entry points and source links:
  - Browser Kitchen and documentation app: `apps/docs/` (TanStack Start + Fumadocs, React DOM)
  - Web Todo demo: `apps/web-todo/`
  - Cross-framework playgrounds: `apps/vue-playground/`, `apps/svelte-playground/`, `apps/native-playground/`
  - Same-domain opt-in framework previews: `apps/docs/previews/` (Vue, Svelte, React Native Web + UniWind)
  - Framework-neutral contracts: `packages/core/`, `packages/pro-core/`
  - UI libraries: `packages/ui/`, `packages/pro/`, `packages/pro-vue/`, `packages/pro-svelte/`, `packages/ui-native/`
  - Tauri bindings for separate native app consumers: `packages/tauri-api/`
  - CLI & workflow packages: `packages/cli/`, `packages/agent-workflow/`, `packages/mcp/`, `packages/nd-workflow/`
- Runtime/version pins: Node.js >= 22, pnpm 10+, Python 3.10+ (for ND scripts); Rust is needed only for a separate native app.
- [Architecture](ARCHITECTURE.md): verified monorepo architecture and boundary rules.
- Canonical current behavior/API docs: `apps/docs/content/docs/`, `agent/app-foundation.md`, `llms.txt`.

## Reproduce development
| Action | Exact command | Working directory/source | Last observed result |
|---|---|---|---|
| Approved dependency setup | `pnpm install` | repository root | Verified (pnpm lockfile v9) |
| Browser app dev | `pnpm dev` | repository root | Current: `apps/docs` (TanStack Start) |
| Monorepo tests | `pnpm test` | repository root | Verified (CLI, MCP, foundation checks pass) |
| ND workflow diagnosis | `pnpm nd:doctor` | repository root | Verified (`packages/nd-workflow/bin/nd.mjs doctor .`) |
| ND workflow verification | `pnpm nd:check` | repository root | Verified (`packages/nd-workflow/bin/nd.mjs check .`) |
| Workflow consistency | `pnpm workflow:check` | repository root | Verified (~757 tokens) |
| Documentation check | `pnpm docs:check` | repository root | Verified |
| Production build | `pnpm build:web` | repository root | Current: TanStack Start + isolated framework previews |

## Operations and ownership
- Deployable service/persistent data? Browser docs/Kitchen site plus client libraries and CLI tools; the docs demo stores todos in local storage.
- Responsible team/role: repository maintainers.
- Public vulnerability policy: see repository security policy if present.

## Agent adoption
- Tool/version: Mavis / MiniMax Code / Claude Code compatible.
- Canonical skills: `.agents/skills/` (ND skills + Universal UI skills).
- Skill selection: `.agents/skill-selection.json`.
- Instruction loading: root `AGENTS.md` and `CLAUDE.md`.
- Workspace boundary: this repository's root directory (`universal-apps` checkout); writes stay inside the project.

## Durable knowledge and open risks
- Retained package `packages/nd-workflow`: contains package-internal instructions and tests; root instructions govern the monorepo.
- Case sensitivity: Windows NTFS requires consistent uppercase `.agents/docs/ARCHITECTURE.md` across scripts.
- Durable docs: all workflow docs live under `.agents/docs/`; root `docs/` is not created.
