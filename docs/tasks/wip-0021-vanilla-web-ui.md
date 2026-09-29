# Task 0021: Vanilla Web UI source target

> **Status:** wip
> **Type:** feature
> **Created:** 2026-09-29
> **PRD:** `docs/prd/0015-vanilla-web-ui.md`

Implement PRD 0015 as a first-class source-owned vanilla web target.

## Goal and scope

- Outcome: companies can use the same Universal CLI flow with plain web platform UI: `init --framework vanilla`, `add button`, and `create --framework vanilla`.
- Approved scope / execution evidence: six-part vanilla implementation plan approved by the user with "do it" on 2026-09-29.
- Risk: High because this adds a public CLI framework contract and source-distribution package. No auth, payments, security, destructive data, or production deployment.
- Branch: `feat/vanilla-ui`, based on `main`.
- Owned paths: `packages/ui-vanilla/**`, `packages/cli/source/**`, `packages/cli/test/source*.mjs`, `scripts/build-source-registry.mjs`, `scripts/check-source-*.mjs`, source-distribution docs, and PRD/task/index reconciliation.

## Plan

1. Add vanilla to CLI validation, config, list/add selection, create templates, and framework-aware short-name resolution.
2. Add `packages/ui-vanilla` with light-DOM Custom Elements, shared tokens, and counterparts for the current UI primitive catalog.
3. Update registry graph/package inventory so vanilla entries are emitted as framework `vanilla`.
4. Extend packed smoke and compile gates; make the vanilla compile result blocking once green.
5. Update README/source CLI docs and architecture/product maps.
6. Run focused source tests, build, smoke, and vanilla compile; record exact results.

## Acceptance criteria

- `add button` resolves to the correct framework-local implementation for React and vanilla.
- `add --all --framework vanilla` selects vanilla + shared package aggregates only.
- `create --framework vanilla --no-install` writes a plain Vite starter and `universal.json`.
- Generated vanilla source has no framework runtime imports.
- Vanilla smoke and compile gates pass without weakening any existing verified framework.
- No existing framework behavior is intentionally changed.

## Evidence ledger

- 2026-09-29 — repository orientation completed from `AGENTS.md`, `CONTEXT.md`, workflow/architecture docs, PRD 0002, source CLI guide, graph/install code, and source verification scripts.
- 2026-09-29 — implementation authorized; branch `feat/vanilla-ui` created and PR #14 opened for review. No merge, publication, or deployment was authorized.
- 2026-09-29 — double-check found and fixed malformed literal `\\n` sequences in all 29 component entry modules; the original failure was 116 lint errors plus a Vite parser failure.
- 2026-09-29 — double-check reconciled the approved starter contract to Vite + **TypeScript** + Tailwind v4, expanded the stale-registry guard to JavaScript source, and added vanilla JavaScript to the packages-wide coverage surface.
- 2026-09-29 — runtime jsdom coverage added for registration/light DOM, native controls, normalized single events, keyboard tabs/focus, reactive state, overlays, toast visibility, combobox/toggle selection, and company-owned host classes.
- 2026-09-29 — source generation was refactored from one catalog-wide renderer into a small shared base plus focused helpers and per-component renderers. Packed smoke now asserts `ui-vanilla-button` does not pull unrelated component implementations.
- 2026-09-29 — packed CLI coverage includes `--framework vanilla --tauri`; workspace discovery coverage was fixed by giving `@package/ui-vanilla` a focused package-level test command instead of exempting the package.
- 2026-09-29 — **Source distribution run 76 passed** on PR head `0f92aa16f5f28ebc212ffd03985892f6671904d7`: source tests, registry build, packed distribution smoke, and consumer compilation all succeeded. The preceding code-only run 75 also passed with 38 source tests / 0 failures, 134 public entries across 9 runtime packages, and compile PASS for React (66 modules), Vue (12), Svelte (12), Native (46), and Vanilla (48).
- 2026-09-29 — **Agent Workflow run 96 passed** on PR head `0f92aa16f5f28ebc212ffd03985892f6671904d7`: frozen install, lint, packages-wide coverage (including `ui-vanilla` JS), native typecheck, full `pnpm test`, app build, published source surface, consumer compile, PR-range preview, all-workspace verification, strict workflow budget, docs check, and skill check all succeeded. The separate Windows foundation job also succeeded.
- 2026-09-29 — recovery remains branch/PR revert only; no persistent data, deployment, npm publication, or migration was performed.

## Resume state

Implementation is verified on `feat/vanilla-ui` and PR #14. The current PR head is `0f92aa16f5f28ebc212ffd03985892f6671904d7`, with Source distribution run 76 and Agent Workflow run 96 both green; the last product-code commit is `74913cef9c9dcfd8b6bd5d36b1f2216a8be9a48a`. Remaining work is human review/merge/release decision only; keep this task WIP until integration ownership is resolved. Do not publish or merge solely from this task record.
