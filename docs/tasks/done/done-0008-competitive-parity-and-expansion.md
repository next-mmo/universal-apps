# Task: Competitive Parity and Enterprise Pro Expansion (Phase 1)

Use for multi-step work; skip for genuinely low-risk single-turn changes. Keep this file current before pause, handover, or completion.

## Goal and scope
- Mode: implementation
- Outcome / why: Implement Phase 1 of competitive expansion (Avatar, Toggle, ToggleGroup, Drawer/BottomSheet, and ProDescriptions) across Web (`@package/ui`), Native (`@package/ui-native`), and Pro (`@package/pro`) with 100% cross-platform parity and source distribution.
- Requirement or issue / exact draft or approved PRD path and version: `docs/prd/0006-competitive-parity-and-expansion.md` (v1 approved).
- Scope approval evidence / approver / date / exclusions: Approved 2026-09-19 by user via implementation plan approval.
- Execution authorization: Authorized for implementation of Phase 1 (CPE-01 Avatar, Toggle, ToggleGroup, Drawer; CPE-02 ProDescriptions; catalog & showcase updates).
- In scope:
  - `@package/ui`: `avatar.tsx`, `toggle.tsx`, `toggle-group.tsx`, `drawer.tsx`.
  - `@package/ui-native`: `avatar.tsx`, `toggle.tsx`, `toggle-group.tsx`, `drawer.tsx`.
  - `@package/pro`: `pro-descriptions.tsx`.
  - `agent/catalog.json`: add entries and exports for each component.
  - Rebuild source distribution registry (`pnpm source:build`).
  - Install and showcase in `apps/uniwind-bare` and `apps/tauri-app`.
- Non-goals: Toast/DatePicker/Combobox deferred to Phase 2.
- Risk and required gates: Medium; requires catalog check, test suite, source CLI tests, and ND checks to pass.

## Ownership and integration
- Exact task path: `docs/tasks/wip-0008-competitive-parity-and-expansion.md`
- Owner / team: Antigravity / repository maintainers.
- Branch/worktree and base revision: `main` at workspace HEAD.
- Owned write paths:
  - `packages/ui/src/components/ui/`
  - `packages/ui-native/src/components/ui/`
  - `packages/pro/src/descriptions/`
  - `packages/ui/package.json`
  - `packages/ui-native/package.json`
  - `packages/pro/package.json`
  - `agent/catalog.json`
  - `apps/uniwind-bare/`
  - `apps/tauri-app/`
- Dependencies / outstanding workers: none.
- Integration owner / shared files / merge order: repository maintainers.

## Plan and acceptance
- [x] 1. Create Web primitives in `packages/ui/src/components/ui/` (`avatar.tsx`, `toggle.tsx`, `toggle-group.tsx`, `drawer.tsx`).
- [x] 2. Create Native primitives in `packages/ui-native/src/components/ui/` (`avatar.tsx`, `toggle.tsx`, `toggle-group.tsx`, `drawer.tsx`).
- [x] 3. Create `ProDescriptions` in `packages/pro/src/descriptions/pro-descriptions.tsx`.
- [x] 4. Update package.json subpath exports in `packages/ui`, `packages/ui-native`, and `packages/pro`.
- [x] 5. Synchronize `agent/catalog.json` and generate docs (`pnpm agent:docs`).
- [x] 6. Rebuild distribution registry via `node scripts/build-source-registry.mjs`.
- [x] 7. Update showcases in `apps/uniwind-bare/src/App.tsx` and `apps/tauri-app/src/pages/dashboard-page.tsx`.
- [x] 8. Verify all gates: `pnpm agent catalog-check`, `pnpm test`, `pnpm source:test`, `pnpm nd:check`.

## Evidence
- `pnpm agent catalog-check`: PASS agent catalog (exports, imports, examples, coverage) across all 22 Web/Native components and 8 Pro blocks.
- `pnpm agent:docs:check`: PASS (all 39 docs pages synchronized).
- `pnpm test`: 44/44 unit tests passed, 1 skipped.
- `pnpm source:test`: 34/34 source distribution tests passed, 1 skipped.
- `pnpm source:build`: 78 public entries, 86 source items, 0 runtime external dependencies.
- `pnpm nd:check`: Exit code 0 across entire test & verification pipeline.
- `tsc --noEmit` in `apps/tauri-app`: 0 errors.

## Resume State
- Updated at: 2026-09-19 / Antigravity
- Completed / partial / not started: Phase 1 Completed.
- Exact next action: Ready for user signoff or kickoff of Phase 2 (Toast / DatePicker / Combobox / ProForm).
- Status: completed.

