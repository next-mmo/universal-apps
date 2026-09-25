# Project Orientation

Populated from adoption decisions on 2026-09-26. The application itself is not scaffolded yet; unknowns are explicit with next actions, not guesses.

## Purpose and entry points
- Name / purpose / supported users: `browser-files-viewer` — a read-only web app for browsing and viewing local files (tree + per-type viewers). Not an IDE: no editing, no saving. Single-owner tool for now.
- Main entry points and source links: `src/main.tsx` (providers: TanStack Query + Router) → `src/App.tsx` (shell). Starter generated from the tauri-universal source CLI: `universal-cli create <name> --framework react` (React + Vite + Tailwind v4 + TypeScript, no `--tauri`); components under `src/lib/universal/` tracked by `universal.lock.json`.
- Runtime/version pins, package manager/lockfile, required OS/services: no manifest yet. Observed host tooling: Node v24.16.0, pnpm 10.32.1, Python 3.11.13 (ND workflow launcher). Planned package manager: pnpm.
- [Architecture](ARCHITECTURE.md): planned stack and viewer map; adoption status = planning, no application source verified yet.
- Canonical current behavior/API docs: none yet; README lands with the starter.

## Reproduce development
| Action | Exact command | Working directory/source | Last observed result |
|---|---|---|---|
| Approved dependency setup | `pnpm install` | project root | OK — 2026-09-26 |
| Configuration and service startup | `pnpm dev` | project root | Not run (preview used instead) |
| Safe test data/seed and migrations | N/A — no backend, no database | — | — |
| Development entry point | `pnpm dev` (Vite) / `pnpm preview` after build | project root | preview served on http://localhost:4173 |
| Targeted tests/type checks | `pnpm test` (vitest, 26 tests); typecheck runs inside `pnpm build` via `tsc -p tsconfig.json` | project root | OK — 2026-09-26 |
| CI-equivalent checks | `pnpm lint` (oxlint; 0 errors) + `pnpm test` + `pnpm build` | project root | OK — 2026-09-26 |
| Build/package when applicable | `pnpm build` (tsc + vite build → `dist/`) | project root | OK — bundle ≈4 MB (Monaco), chunk-size warning only |

- Required configuration names, safe example-file path, service endpoints/ports: none required; dev server port assigned by Vite. No secrets; the app is client-side only.
- Team-owned access-request route and prerequisite permissions: N/A — single-owner personal project.
- Known setup failures, recovery instructions, and unresolved verification: ND adoption recovery journal at `.nd-workflow-adoption/` (from init apply, 2026-09-26). Host loading of root instructions is UNVERIFIED until a fresh session confirms `AGENTS.md` is applied.

## Operations and ownership
- Deployable service/persistent data? No — static client-side web app; file contents are read locally in the browser and never leave the machine. Runbook N/A.
- Responsible team/role and escalation route: project owner (dila).
- Deployment, monitoring, backup/restore references: none yet; hosting decision deferred.
- Public vulnerability-reporting policy location, if applicable: N/A — not a public service.

## Agent adoption
- Tool/version, instruction loading and selected skill route: ZCode (GLM). Root `AGENTS.md` + `.agents/skills/` are the contract; skills are read explicitly (`.agents/skills/<name>/SKILL.md`) when automatic discovery is absent.
- Observed fresh-session check, date, and unchecked integrations: not yet performed. Next action: confirm in a fresh session that root instructions load.
- Workspace/network/approval boundaries: write only inside this project; no network calls for file data; destructive actions and publishing stay human-approved.

## Durable knowledge and open risks
- Scoped learning: ND Workflow adoption ran from the local source package `tauri-universal/packages/nd-workflow` via `python scripts/nd.py init` (preview → reviewed plan → apply), not from a published tarball. Verified for this revision only.
- Keep this overview short; link topic-specific details instead of accumulating a transcript.
- Open risk / impact / owner / next action: nothing blocking. Deferred: hosting/deployment decision, in-tree markdown link resolution, media codec coverage outside Chromium. Owner: dila.
