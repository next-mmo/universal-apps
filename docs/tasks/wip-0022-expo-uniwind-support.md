# Task 0022: Support Nativewind v5 and Expo React Native

> **Status:** wip  
> **Type:** feature  
> **Created:** 2026-10-01  
> **Risk:** High  
> **PRD:** `docs/prd/0016-nativewind-v5-and-expo-support.md`  
> **Branch:** `feat/expo-uniwind`

Add dual React Native engine support for **Uniwind** and **Nativewind v5 RC0** with Tailwind CSS v4 across the CLI starter templates, `@package/ui-native` engine decoupling, showcase apps, and documentation.

## Outcome

External developers can run:
- `npx @next-mmo/universal-cli create <app-name> --framework nativewind` (or `--framework nativewind-expo`) to scaffold a complete project configured with Nativewind v5 RC0 (`nativewind@5.0.0-rc.0`, `react-native-css@3.1.0-rc.0`), Tailwind CSS v4, PostCSS, and pinned `lightningcss@1.30.1`.
- `npx @next-mmo/universal-cli create <app-name> --framework expo-uniwind` (or `--framework expo`) to scaffold an Expo project configured with Uniwind.
- `@package/ui-native` components render seamlessly under both Uniwind and Nativewind v5 environments.

## Acceptance Criteria

- [x] `@package/ui-native` decouples hard dependency on `uniwind` runtime in `input.tsx` and `textarea.tsx`, providing safe fallback styling when running under Nativewind or standard React Native.
- [x] `packages/ui-native/package.json` declares `uniwind` and `nativewind` in `peerDependenciesMeta` as optional peers.
- [x] `packages/cli/source/templates/nativewind.mjs` defines template files for Expo + Metro + Nativewind v5 RC0 + Tailwind v4 + PostCSS.
- [x] `packages/cli/source/templates/expo.mjs` defines template files for Expo + Metro + Uniwind.
- [x] `packages/cli/source/templates.mjs` and `cli.mjs` route `nativewind`, `nativewind-expo`, `expo-nativewind`, `expo-uniwind`, and `expo`.
- [x] `packages/cli/source/install.mjs` normalizes native frameworks to `native` for source catalog component installation.
- [x] `packages/cli/test/source.test.mjs` verifies `universal create` for `nativewind`, `nativewind-expo`, `expo-uniwind`, and `expo`.
- [x] Showcase apps `apps/nativewind-showcase` and `apps/expo-uniwind` demonstrate the setups with `@package/ui-native` components.
- [x] Platform documentation created at `apps/docs/content/docs/platforms/nativewind.mdx` and `apps/docs/content/docs/platforms/expo.mdx` and registered in `meta.json`.
- [x] `pnpm agent:docs` updates docs artifacts and `pnpm agent:docs:check` passes (51 pages green).
- [x] `pnpm source:test`, `pnpm source:build`, and `pnpm source:smoke` pass without regressions.
- [x] `pnpm test:typecheck`, `pnpm foundation:test`, and `pnpm mcp:test` pass without regressions.

## Evidence Ledger

- 2026-10-01 — Implementation approved by user ("no replace but new it mean support both unwind and nativewind" and "do it").
- 2026-10-01 — Engine decoupling completed in `@package/ui-native`: `useThemeColor` helper created, `input.tsx` and `textarea.tsx` updated, `useThemeColor` exported in `index.ts`.
- 2026-10-01 — Nativewind v5 RC0 template created with pinned `nativewind@5.0.0-rc.0`, `react-native-css@3.1.0-rc.0`, and `lightningcss@1.30.1`.
- 2026-10-01 — CLI routing and validation updated in `cli.mjs`, `install.mjs`, and `templates.mjs`.
- 2026-10-01 — Expo + Uniwind template `packages/cli/source/templates/expo.mjs` created and tested in `source.test.mjs`.
- 2026-10-01 — Monorepo showcase app `apps/expo-uniwind` scaffolded, showcasing `@package/ui-native` components with theme toggle; oxlint passes with 0 errors and 0 warnings, tsc passes with 0 errors.
- 2026-10-01 — Expo documentation added at `apps/docs/content/docs/platforms/expo.mdx` and registered in `meta.json`.
- 2026-10-01 — Documentation consistency verified with `pnpm agent:docs:check` (51 pages green).
- 2026-10-01 — Full CLI test suite (`pnpm source:test`), registry build (`pnpm source:build`), and packed distribution smoke (`pnpm source:smoke`) pass without regressions.
