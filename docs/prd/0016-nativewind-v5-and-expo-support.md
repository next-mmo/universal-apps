---
id: "0016"
title: "Nativewind v5 and Expo React Native Support"
status: in-progress
last-audit: 2026-10-01
---

# Change Proposal: Nativewind v5 and Expo React Native Support

## Problem and scope

- **User / problem / desired outcome:** Mobile developers building React Native applications with Expo or Bare React Native need first-class support for both **Uniwind** (`1.11.0`) and **Nativewind v5 RC0** (`nativewind@5.0.0-rc.0` with `react-native-css@3.1.0-rc.0` and Tailwind CSS v4). Neither engine replaces the other; developers can choose Uniwind or Nativewind v5, and the shared `@package/ui-native` design system works seamlessly with both.
- **In scope:**
  - Scaffolding Nativewind v5 projects via CLI: `universal create <name> --framework nativewind` (and aliases `--framework nativewind-expo`, `expo-nativewind`).
  - Scaffolding Expo + Uniwind projects via CLI: `universal create <name> --framework expo-uniwind` (and alias `--framework expo`).
  - Decoupling `@package/ui-native` from hard Uniwind runtime bindings (`input.tsx`, `textarea.tsx`, `package.json`), providing a resilient theme token resolution helper with safe fallbacks.
  - Metro bundler integration (`withNativewind(config)` and `withUniwindConfig(config)`).
  - Pinned engine dependencies and overrides (`lightningcss@1.30.1`).
  - Showcase applications and verification tests.
  - Platform documentation at `apps/docs/content/docs/platforms/nativewind.mdx` and `apps/docs/content/docs/platforms/expo.mdx`.
- **Non-goals:**
  - Replacing Uniwind with Nativewind or deprecating existing Uniwind starters (`uniwind-bare`, `native-playground`).
  - Introducing third-party UI libraries (Gluestack, etc.).
  - Generating binary `android/` and `ios/` folders directly inside the starter templates.

## Approval record

- **Scope approval:** Approved.
- **Approver / decision date:** Repository owner request in conversation, 2026-10-01 ("no replace but new it mean support both unwind and nativewind" and "do it").
- **Approved scope:** Dual-engine architecture supporting both Uniwind and Nativewind v5 alongside Expo, CLI starter scaffolding, engine-agnostic `@package/ui-native`, documentation, and tests.
- **Execution authorization:** Explicit "do it" received 2026-10-01.

## Requirements

- **NW-01 Dual Engine Compatibility:** `@package/ui-native` components render cleanly under both Uniwind and Nativewind v5 without missing runtime module errors.
- **NW-02 CLI Scaffolding:** `universal create <name> --framework nativewind` scaffolds an Expo project configured with Nativewind v5 RC0, Tailwind v4, PostCSS, and pinned `lightningcss@1.30.1`.
- **NW-03 Expo Uniwind Scaffolding:** `universal create <name> --framework expo-uniwind` scaffolds an Expo project configured with Uniwind and Tailwind v4.
- **NW-04 Theme Token Fallbacks:** `useThemeColor` dynamically resolves CSS variable colors when Uniwind is mounted and provides token fallbacks when running under Nativewind.
- **NW-05 Documentation:** Dedicated platform guides in `apps/docs/content/docs/platforms/` and platform index updates.
- **NW-06 Zero Regressions:** Existing `uniwind-bare`, `native-playground`, and all workspace tests remain green.

## Acceptance and delivery

- [ ] `pnpm test`
- [ ] `pnpm source:test`
- [ ] `pnpm source:build`
- [ ] `pnpm source:smoke`
- [ ] `pnpm agent:docs:check`
- [ ] `pnpm workflow:check`
