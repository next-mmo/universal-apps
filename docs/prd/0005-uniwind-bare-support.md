---
id: "0005"
title: "Uniwind Bare React Native Support"
status: approved
last-audit: 2026-09-18
---

# Change Proposal: Support Bare React Native with Uniwind

Use only for unresolved product scope. Local delta convention, not an OpenSpec CLI schema. Lifecycle: draft, approved, in-progress, shipped, archived.

## Problem and scope

- **User / problem / desired outcome:** Consumers building mobile applications on React Native without Expo or React Native Web (i.e. "Bare" React Native using the Metro bundler and running directly on Android and iOS runtimes) currently have no first-class starter template, verified Metro configuration, or platform documentation for using Uniwind and the `@package/ui-native` design system. The existing native support is restricted to React Native Web (RNW) bundled with Vite (`apps/native-playground`, `vite-plugin-rnw`). Desired outcome: provide verified Bare React Native support with Uniwind, including a CLI starter generator (`universal create <name> --framework uniwind-bare`), standard Metro bundler wiring (`withUniwindConfig`), design system compatibility, and canonical platform documentation.
- **In scope:**
  - Scaffolding a bare React Native project via CLI (`universal create <name> --framework uniwind-bare` and alias `--framework native-bare`).
  - Metro bundler integration with `uniwind/metro` (`withUniwindConfig`) compiling Tailwind CSS v4 classes for native Android/iOS targets.
  - Verification that `@package/ui-native` components and source-distributed UI components compile and render under Metro without `react-native-web` dependencies.
  - Unified token styling support via CSS entry point (`@import "tailwindcss"; @import "uniwind";` + design system tokens) and runtime dark mode toggle via `Uniwind.setTheme`.
  - Canonical platform documentation at `apps/tauri-app/content/docs/platforms/uniwind-bare.mdx`.
- **Non-goals:**
  - Generating complete platform-specific binary build directories (`android/` and `ios/` folders) directly inside the starter template; native folders are generated/managed via standard React Native tooling (`npx @react-native-community/cli init` / React Native project roots).
  - Expo integration (Expo uses `@expo/metro-config` and Expo router; this PRD addresses bare React Native).
  - Re-introducing NativeWind v2/v4 or Gluestack; Uniwind is the repository's native Tailwind engine.
  - Adding Rust or Tauri mobile bindings to the React Native bare starter.
- **Selected requirements / open questions:**
  - UWB-01 through UWB-05 below.
  - Open Question 1: Canonical framework flag is `uniwind-bare`, with `native-bare` as alias.
  - Open Question 2: Testing relies on CLI-generated smoke fixtures in this increment.

## Approval record

- **Scope approval:** approved (2026-09-18).
- **Approver / decision date:** repository user / 2026-09-18.
- **Exact approved requirement IDs, exclusions and document revision or content hash:** UWB-01 through UWB-05. Excluded: binary `android/` and `ios/` project files.
- **Approval evidence:** User review policy approval of implementation plan.
- **Execution authorization:** Authorized for implementation of UWB-01 through UWB-05.
- **Scope changes since approval / renewed decision needed:** none.

## Canonical targets and baseline

- **Current feature/API/spec documents:**
  - `apps/tauri-app/content/docs/platforms/react-native-web.mdx` (describes existing React Native Web + Uniwind architecture).
  - `packages/cli/source/README.md` and `packages/cli/source/templates/native.mjs` (existing React Native Web starter generator).
  - `packages/ui-native/src/index.ts` (React Native component library and Metro-style single barrel).
  - `packages/ui-native/src/uniwind-env.d.ts` (Uniwind type augmentation).
- **Source baseline revision:** current workspace HEAD.
- **New capability:** intended current-doc target `apps/tauri-app/content/docs/platforms/uniwind-bare.mdx`. Explicitly state: no baseline exists for bare React Native Metro starter generation or documentation.
- **Integration owner / related concurrent changes:** repository maintainers; coordinated with `packages/cli` starter generators and `packages/ui-native`.

## Requirement changes

### ADDED

**UWB-01 — CLI starter for Bare React Native (`uniwind-bare`).**
The `universal create <name> --framework uniwind-bare` (and alias `--framework native-bare`) command scaffolds a complete, runnable bare React Native project substrate. The generated project includes:
- `package.json` specifying `react-native`, `react`, `uniwind`, `tailwindcss` v4, `@react-native/metro-config`, `@react-native/babel-preset`, and TypeScript.
- `metro.config.js` configuring Metro via `withUniwindConfig(config, { cssEntryFile: './src/index.css' })`.
- `babel.config.js` with `presets: ['module:@react-native/babel-preset']`.
- `src/index.css` importing `tailwindcss`, `uniwind`, and the design system tokens.
- `src/App.tsx` and `index.js` registering the root component via `AppRegistry.registerComponent`.
- `app.json` and TypeScript configuration (`tsconfig.json` extending `@react-native/typescript-config`).
*Scenario:* Given a developer executing `universal create my-mobile --framework uniwind-bare --no-install`, the command creates the project directory containing valid `metro.config.js`, `babel.config.js`, `index.js`, `src/App.tsx`, and `src/index.css` without throwing errors.

**UWB-02 — Metro bundler compilation with Uniwind.**
The bare React Native project integrates `uniwind/metro` using `withUniwindConfig` to compile Tailwind v4 styles at bundle time into React Native style representations.
- Supports CSS entry file declaration pointing to the Tailwind/token stylesheet.
- Generates or links TypeScript type definitions for `className` on React Native primitives (`View`, `Text`, `Pressable`, etc.).
- Does not require Vite, `vite-plugin-rnw`, or DOM shims.
*Scenario:* When Metro builds the JavaScript bundle for Android or iOS, Uniwind parses utility classes on JSX elements and compiles them into runtime stylesheet objects without bundling Vite or Web-only plugins.

**UWB-03 — Component parity on Bare React Native runtime.**
All 18 `@package/ui-native` primitives and source-distributed native components (Button, Badge, Card, Dialog, DropdownMenu, Input, Switch, etc.) must compile and function cleanly on bare React Native.
- All overlay primitives (Dialog, DropdownMenu, Popover, Select) render via React Native `Modal` with dimmed backdrop, requiring no DOM portals.
- Icons use text glyphs (✓, ⌄, ×) rather than DOM SVGs to eliminate hard dependencies on `react-native-svg`.
- Animated components (e.g. Skeleton) use React Native `Animated` rather than CSS keyframes.
- Zero imports from `react-native-web` or browser-only APIs in the native component chain.
*Scenario:* In a bare React Native app importing `Button` or adding it via `universal add button`, the component mounts and responds to `onPress` using React Native's `Pressable` with proper Uniwind-compiled visual styling.

**UWB-04 — Token and theme synchronization.**
Design tokens defined in the shared design system (colors, borders, shadows) resolve in bare React Native through Uniwind's CSS variable evaluation.
- Dark mode transitions switch dynamically via `Uniwind.setTheme('dark' | 'light')`.
- Color utilities (`bg-primary`, `text-muted-foreground`, `dark:bg-card`) resolve correctly in native rendering trees.
*Scenario:* Calling `Uniwind.setTheme('dark')` immediately re-renders styled native views with the dark palette tokens without restarting the Metro server.

**UWB-05 — Canonical platform documentation.**
A dedicated documentation page is added at `apps/tauri-app/content/docs/platforms/uniwind-bare.mdx` (and registered in `meta.json`).
- Explains the architectural differences between React Native Web (`apps/native-playground`) and Bare React Native.
- Details the Metro configuration, Babel preset, CSS entry structure, and token import patterns.
- Documents the CLI command `universal create <name> --framework uniwind-bare`.
*Scenario:* A developer consulting the documentation site sees "Bare React Native" listed under Platforms, with copy-pasteable Metro and CSS setup instructions.

## Design impact and decisions

- **Components and contracts touched:**
  - `packages/cli/source/templates/native-bare.mjs` [NEW]: starter file map for Metro-based React Native.
  - `packages/cli/source/templates.mjs` [MODIFY]: route `uniwind-bare` and `native-bare` to the new template generator.
  - `packages/cli/source/cli.mjs` [MODIFY]: expand `--framework` validation to include `uniwind-bare` and `native-bare`.
  - `packages/cli/source/install.mjs` [MODIFY]: recognize `uniwind-bare` during `createProject` and `initialize`.
  - `apps/tauri-app/content/docs/platforms/uniwind-bare.mdx` [NEW]: documentation.
  - `apps/tauri-app/content/docs/platforms/meta.json` [MODIFY]: add `uniwind-bare` to page order.
- **Selected approach vs alternatives:**
  - *Selected:* Provide a focused bare React Native starter template and Metro configuration, maintaining parity with `@package/ui-native`.
  - *Rejected alternative:* Expo-managed starter. Rejected because the requirement specifies bare workflow, and Expo introduces its own router, config plugins, and bundler wrapping.
  - *Rejected alternative:* NativeWind v4. Rejected because this repository standardized on Uniwind (`1.11.0`) for all React Native styling.
- **Consequences:**
  - Clear separation of concerns: `native` remains the Vite + RNW web playground/starter; `uniwind-bare` becomes the dedicated Metro/mobile target.
  - Source-distributed `@package/ui-native` components gain verified utility for both web and true native mobile apps.

## Acceptance and delivery

- [ ] `universal create test-bare --framework uniwind-bare --no-install --dry-run` outputs the complete bare React Native file plan.
- [ ] Created project contains valid `metro.config.js` referencing `withUniwindConfig` and `cssEntryFile`.
- [ ] Created project contains valid `babel.config.js`, `src/index.css`, `src/App.tsx`, and `index.js`.
- [ ] `universal init --framework native` and `universal add button` succeed in the created bare project.
- [ ] Documentation page `apps/tauri-app/content/docs/platforms/uniwind-bare.mdx` exists and passes doc verification (`pnpm agent:docs:check`).
- [ ] Source CLI tests (`pnpm source:test`) pass with new framework coverage.
- **Risk / required approvals:** Low-risk additive template and docs. Owner approval of this PRD is required before implementation begins.
- **Current-doc reconciliation plan:** Update `docs/prd/0000-prd-index.md` and `apps/tauri-app/content/docs/platforms/meta.json`.
