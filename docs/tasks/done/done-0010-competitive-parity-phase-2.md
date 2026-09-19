# Task: Competitive Parity Phase 2 - Toast Sonner, Combobox Command, Calendar DatePicker, and DrawerForm

## Goal and scope
- Mode: done
- Outcome / why: Implement Phase 2 of competitive expansion (Toast/Sonner, Command/Combobox, Calendar/DatePicker, and ProFormDrawer) across Web (`@package/ui`), Native (`@package/ui-native`), and Pro (`@package/pro`) with zero external dependencies and 100% cross-platform parity.
- Requirement or issue: `docs/prd/0006-competitive-parity-and-expansion.md` (CPE-01 and CPE-02).
- Scope approval evidence / approver / date: Approved 2026-09-19 by user.
- In scope:
  - `@package/ui`: `toast.tsx`, `command.tsx`, `combobox.tsx`, `calendar.tsx`, `date-picker.tsx`.
  - `@package/ui-native`: `toast.tsx`, `command.tsx`, `combobox.tsx`, `calendar.tsx`, `date-picker.tsx`.
  - `@package/pro`: `pro-form-drawer.tsx`.
  - Package manifest exports and index re-exports.
  - Showcase integration in `apps/uniwind-bare` and `apps/tauri-app`.
  - Documentation, agent catalog sync, source registry build, and verification.
- Non-goals: Adding external date libraries (`date-fns`/`dayjs`/`moment`) or external toast libraries (`sonner`).
- Risk and required gates: Medium; requires catalog check, test suite, source CLI tests, and ND checks to pass.

## Ownership and integration
- Exact task path: `docs/tasks/done/done-0010-competitive-parity-phase-2.md`
- Owner / team: Antigravity / repository maintainers.
- Branch/worktree: `main` at workspace root.
- Owned write paths:
  - `packages/ui/src/components/ui/`
  - `packages/ui-native/src/components/ui/`
  - `packages/pro/src/form/`
  - `packages/ui/package.json`
  - `packages/ui-native/src/index.ts`
  - `packages/pro/package.json`
  - `agent/catalog.json`
  - `apps/uniwind-bare/`
  - `apps/tauri-app/`

## Plan and acceptance
- [x] 1. Create Toast notification system (`toast.tsx`) in `@package/ui` and `@package/ui-native`.
- [x] 2. Create Command & Combobox (`command.tsx`, `combobox.tsx`) in `@package/ui` and `@package/ui-native`.
- [x] 3. Create Calendar & DatePicker (`calendar.tsx`, `date-picker.tsx`) in `@package/ui` and `@package/ui-native`.
- [x] 4. Create `ProFormDrawer` in `@package/pro/src/form/pro-form-drawer.tsx`.
- [x] 5. Update package manifests and subpath exports in `@package/ui`, `@package/ui-native`, and `@package/pro`.
- [x] 6. Create documentation pages and update `components/meta.json` & `blocks/meta.json`.
- [x] 7. Synchronize `agent/catalog.json`, generate docs (`pnpm agent:docs`), and rebuild source registry (`pnpm source:build`).
- [x] 8. Update showcases in `apps/uniwind-bare` and `apps/tauri-app`.
- [x] 9. Verify all gates: `pnpm agent catalog-check`, `pnpm test`, `pnpm source:test`, `pnpm nd:check`.

## Verification evidence
- `pnpm agent catalog-check`: PASS agent catalog (exports, imports, examples, coverage)
- `pnpm agent:docs:check`: PASS agent docs (47 pages)
- `pnpm source:test`: 34 passed, 0 failed, 1 skipped
- `pnpm test`: 44 core passed, all CLI and MCP integration tests passed
- `pnpm --filter @app/tauri-app exec tsc -p tsconfig.json --noEmit`: PASS
- `pnpm --filter uniwind-bare lint`: 0 errors
- `pnpm nd:check`: Exit 0 (all test suites and verification gates pass)
- Source registry: 91 public entries, 99 items, 9 packages, 0 runtime dependencies

## Resume State
- Completed at: 2026-09-19 / Antigravity
- Status: completed.
