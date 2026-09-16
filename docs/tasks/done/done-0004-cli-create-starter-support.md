# Task 0004: Universal CLI Create Starter Project Support

> **Status:** done  
> **Type:** feature  
> **Created:** 2026-09-16  
> **PRD:** `docs/prd/0002-source-owned-distribution.md`

## Checkpoint Fields (ND)

- Owner: repository maintainers
- Scope approval: Approved 2026-09-16
- Execution authorization: Approved 2026-09-16
- Exact next action: none. All tests, smoke checks, and documentation verified. Closed to `done/`.

## Outcome

Add a `universal create <project-name>` command to `@next-mmo/universal-cli` enabling developers to scaffold a complete, runnable starter application from scratch supporting React, Vue, Svelte, React Native Web, and Tauri 2.

## Change Contract

- **Human outcome:** External developers can run `npx @next-mmo/universal-cli create <app-name> --framework <react|vue|svelte|native> [--tauri]` and immediately have a working project with Vite, Tailwind CSS v4, initialized `universal.json`, and pre-installed UI starter components.
- **Acceptance evidence:**
  - `packages/cli/source/templates.mjs` provides complete template generation for React, Vue, Svelte, Native, and Tauri.
  - `universal create <app>` runs non-destructively, creates all boilerplate files, initializes `universal.json`, and adds starter components.
  - `pnpm source:test` includes unit tests for `create` with and without `--tauri`.
  - `pnpm source:smoke` validates that the packed CLI successfully executes `create`.
  - `pnpm test`, `pnpm workflow:check`, `pnpm docs:check`, and `pnpm nd:check` pass cleanly.
- **Risk:** Medium (CLI feature addition; backwards compatible with existing `init` and `add`).
- **Baseline:** Commit `04d5c56`.

## Acceptance Criteria

- [x] `packages/cli/source/templates.mjs` defines templates for React, Vue, Svelte, Native, and Tauri.
- [x] `packages/cli/source/install.mjs` and `cli.mjs` support `create <name> [options]`.
- [x] `scripts/build-source-registry.mjs` packages `templates.mjs` into `dist/universal-cli`.
- [x] `packages/cli/test/source.test.mjs` tests `create` scaffolding and `--tauri` desktop option.
- [x] `scripts/check-source-distribution.mjs` smoke tests `create`.
- [x] Documentation updated in `packages/cli/source/README.md`.
- [x] All verification checks pass.

## Evidence Ledger

| Claim | Evidence | Result |
| :--- | :--- | :--- |
| CLI create command | `packages/cli/source/cli.mjs` dispatches `create` | Verified |
| Template generator | `packages/cli/source/templates.mjs` scaffolds clean projects | Verified |
| Automated tests | `source:test` (34 pass, 0 fail) and `source:smoke` verify project generation | Verified |
| Tauri option | `create --tauri` scaffolds valid `src-tauri` and `tauri.conf.json` | Verified |
| Packaging | `scripts/build-source-registry.mjs` packages `templates.mjs` into `dist/` | Verified |
| Smoke check | `pnpm source:smoke` verifies packed CLI execution of `create` | Verified |
