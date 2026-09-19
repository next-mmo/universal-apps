# Task 0009: Universal Animation System - Native Springs, Reanimated Gestures, and Web Motion

## Goal and scope
- Mode: done
- Outcome / why: Deliver a high-performance 3-tiered animation architecture across Web and Native, providing 60 FPS zero-dependency native thread micro-interactions (Switch spring, Accordion expand), 120 FPS Reanimated interactive gestures (InteractiveDrawer bottom sheet with drag tracking), and Web Motion floating layout animations (AnimatedTabs with layoutId pill indicator).
- Requirement or issue: User request "double check how we can get good animate eg. reanimate react native and other good for our?" followed by "do ti all".
- Scope approval evidence / approver / date: Approved 2026-09-19 by user via review policy auto-approval.
- In scope:
  - `@package/ui-native`: `switch.tsx` (Animated.spring with useNativeDriver), `accordion.tsx` (LayoutAnimation), `button.tsx` (press spring).
  - `@package/ui-native`: `drawer-interactive.tsx` (Reanimated + Gesture Handler bottom sheet with rubber-banding, snap points, flick dismiss).
  - `@package/ui`: `animated-tabs.tsx` (Motion layoutId floating tab indicator).
  - Package manifest exports and optional peer declarations.
  - Showcase integration in `apps/uniwind-bare` and `apps/tauri-app`.
  - Agent catalog, documentation, source registry compilation, and verification.
- Non-goals: Forcing Reanimated as a required dependency on basic primitives.
- Risk and required gates: Medium; requires catalog check, test suite, source CLI tests, and ND checks to pass.

## Ownership and integration
- Exact task path: `docs/tasks/done/done-0009-universal-animation-system.md`
- Owner / team: Antigravity / repository maintainers.
- Branch/worktree: `main` at workspace root.
- Owned write paths:
  - `packages/ui-native/src/components/ui/`
  - `packages/ui/src/components/ui/`
  - `packages/ui-native/package.json`
  - `packages/ui/package.json`
  - `agent/catalog.json`
  - `apps/uniwind-bare/`
  - `apps/tauri-app/`

## Plan and acceptance
- [x] 1. Upgrade `@package/ui-native/src/components/ui/switch.tsx` with `Animated.spring` (`useNativeDriver: true`).
- [x] 2. Upgrade `@package/ui-native/src/components/ui/accordion.tsx` with `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)`.
- [x] 3. Create `@package/ui-native/src/components/ui/drawer-interactive.tsx` with Reanimated & Gesture Handler.
- [x] 4. Create `@package/ui/src/components/ui/animated-tabs.tsx` with sliding pill indicator.
- [x] 5. Update package manifests and subpath exports in `@package/ui` and `@package/ui-native`.
- [x] 6. Configure `apps/uniwind-bare` and showcase animations in `App.tsx`.
- [x] 7. Showcase `AnimatedTabs` in `apps/tauri-app`.
- [x] 8. Update `agent/catalog.json`, generate docs (`pnpm agent:docs`), rebuild source registry (`pnpm source:build`).
- [x] 9. Verify all gates: `pnpm agent catalog-check`, `pnpm test`, `pnpm source:test`, `pnpm nd:check`.

## Evidence
- `pnpm agent catalog-check`: PASS agent catalog (exports, imports, examples, coverage).
- `pnpm agent:docs:check`: PASS (41 doc pages synchronized with `llms-full.txt`).
- `pnpm source:test`: PASS (34/34 tests passed, 1 skipped).
- `pnpm source:build`: 80 public entries, 88 items, 0 runtime external dependencies.
- `pnpm test`: 44/44 unit tests passed, 1 skipped; CLI integration passed; MCP integration passed.
- `pnpm nd:check`: Exit code 0 across entire workspace test and integrity pipeline.
- `pnpm --filter @app/tauri-app exec tsc -p tsconfig.json --noEmit`: 0 errors.
- `pnpm --filter uniwind-bare lint`: 0 errors.

## Resume State
- Updated at: 2026-09-19 / Antigravity
- Completed / partial / not started: Fully completed and verified.
- Status: completed.

