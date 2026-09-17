# Task 0007: Support Bare React Native with Uniwind

> **Status:** done  
> **Type:** feature  
> **Created:** 2026-09-18  
> **PRD:** `docs/prd/0005-uniwind-bare-support.md`

## Checkpoint Fields (ND)

- Owner: repository maintainers / Pair Agent
- Scope approval: Approved 2026-09-18 by user via implementation plan approval.
- Execution authorization: Approved 2026-09-18.
- Exact next action: Completed and verified. Closed to `done/`.

## Outcome

Add official Bare React Native support powered by Uniwind and Tailwind CSS v4, including CLI starter project scaffolding (`universal create <name> --framework uniwind-bare`), standard Metro bundler configuration (`metro.config.js` with `withUniwindConfig`), and canonical platform documentation.

## Change Contract

- **Human outcome:** External developers can run `npx @next-mmo/universal-cli create <app-name> --framework uniwind-bare` (or `--framework native-bare`) to scaffold a complete bare React Native project configured with Metro, Uniwind, and Tailwind CSS v4 without React Native Web or Vite dependencies, and consume `@package/ui-native` components.
- **Acceptance evidence:**
  - `packages/cli/source/templates/native-bare.mjs` generates complete bare React Native starter project files (`metro.config.js`, `babel.config.js`, `tsconfig.json`, `app.json`, `index.js`, `src/index.css`, `src/uniwind-env.d.ts`, `src/App.tsx`).
  - `packages/cli/source/templates.mjs` and `packages/cli/source/cli.mjs` support `--framework uniwind-bare` and `--framework native-bare`.
  - `packages/cli/source/install.mjs` initializes `universal.json` for bare native and assigns native starter components.
  - `packages/cli/test/source.test.mjs` tests `uniwind-bare` and `native-bare` scaffolding and configuration.
  - `apps/tauri-app/content/docs/platforms/uniwind-bare.mdx` provides complete documentation.
  - `pnpm source:test`, `pnpm source:build`, `pnpm source:smoke`, and `pnpm agent:docs:check` pass.
- **Risk:** Low (additive CLI starter template, documentation, and tests).
- **Baseline:** Commit `ec942a5`.

## Acceptance Criteria

- [x] `packages/cli/source/templates/native-bare.mjs` defines template files for bare React Native + Metro + Uniwind.
- [x] `packages/cli/source/templates.mjs` and `cli.mjs` route `uniwind-bare` and `native-bare` to the template.
- [x] `packages/cli/source/install.mjs` normalizes `uniwind-bare` to `native` for source catalog component installation.
- [x] `packages/cli/test/source.test.mjs` verifies `universal create` for `uniwind-bare` and `native-bare`.
- [x] Platform documentation created at `apps/tauri-app/content/docs/platforms/uniwind-bare.mdx` and registered in `meta.json`.
- [x] `llms-full.txt` updated and verified via `pnpm agent:docs:check`.
- [x] `pnpm source:test` (34 pass, 0 fail), `pnpm source:build`, and `pnpm source:smoke` pass.

## Evidence Ledger

| Claim | Evidence | Result |
| :--- | :--- | :--- |
| CLI framework flags | `cli.mjs` and `templates.mjs` recognize `uniwind-bare` and `native-bare` | Verified |
| Metro + Uniwind template | `native-bare.mjs` emits valid `metro.config.js` with `withUniwindConfig` | Verified |
| Automated unit tests | `pnpm source:test` verifies file creation and configuration checks | Verified (34 passed) |
| Registry build | `pnpm source:build` bundles CLI and templates without errors | Verified |
| Distribution smoke | `pnpm source:smoke` verifies packed CLI execution | Verified |
| Docs consistency | `pnpm agent:docs:check` confirms 34 doc pages in sync | Verified |
