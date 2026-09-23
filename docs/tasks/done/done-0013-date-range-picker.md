# Task 0013: Date range picker for `@package/ui` and `ui-native`

> **Status:** done
> **Type:** feature
> **Created:** 2026-09-20
> **PRD:** `docs/prd/0012-date-range-picker.md`

Add a date range picker: extend the shared zero-dependency `Calendar` with a range mode, add a
`DateRangePicker` wrapper to `@package/ui` (popover) and `ui-native` (modal), and expose it in the pro
filter toolbar as a from/to filter. Single-date `DatePicker` already existed on both surfaces
(`packages/ui/src/components/ui/date-picker.tsx`, `packages/ui-native/src/components/ui/date-picker.tsx`);
no range support existed anywhere (`grep DateRange` was clean at the 2026-09-20 baseline).

## Checkpoint Fields (ND)

- Owner: implementation session agent; acceptance stays with the repository maintainer.
- Scope approval: **approved 2026-09-23** — the plan presented in session (shared hook, Calendar range
  mode on both surfaces, `DateRangePicker` wrappers, pro `date-range` field, docs/catalog/kitchen
  updates, tests plus coverage-list widening, task promotion, gates). Evidence: explicit "finish all"
  instruction issued directly after that plan; the 2026-09-20 decision record fixes the design.
- Execution authorization: granted with the same instruction, scoped to the owned write paths below.
  Publication, push, and any release action remain outside this authorization.
- Exact next action: none — this increment is closed; push/merge of `feat/date-range-picker` is the
  maintainer's.

## Goal and scope

- Mode: implementation of an approved, decision-complete feature.
- Outcome / why: consumers filter and pick date spans (pro filter toolbars first) without a library,
  keeping the zero-dependency stance `ui.calendar` was built on and RN parity with the DOM surface.
- In scope: the shared pure range-selection hook; `mode: 'single' | 'range'` on both `Calendar`
  surfaces; `DateRangePicker` wrappers (DOM popover, native modal); pro filter toolbar `date-range`
  field; unit tests for the above; docs pages, agent catalog entry, and the kitchen demo; coverage
  include-list widening for the new modules.
- Non-goals: time picking, timezone handling (stays plain `Date`), locale/formatting overhaul (the
  existing English-only `formatDate` limitation is pre-existing and shared with `DatePicker`),
  renaming or breaking the existing single-date `DatePicker`/`Calendar` API, automated tests for
  `ui-native` (that package is deliberately outside the vitest coverage list — parity there is code
  mirroring plus documentation), npm publication.

## Decision record — build own, port the algorithm (decided 2026-09-20)

- **Rejected: library** (react-day-picker). DOM-only — the native picker must be built anyway, so a
  library means two implementations plus a dependency fighting the token-first styling and the
  zero-dependency stance `ui.calendar` was built on.
- **Rejected: copy a shadcn block.** The shadcn range "block" is a ~10-line Button + Popover wrapper
  around `<Calendar mode="range" />`; the logic lives inside react-day-picker, so the block alone is
  nothing to copy.
- **Chosen: build own**, as a pure shared `useRangeSelection` hook consumed by both packages, with the
  selection semantics ported from react-day-picker (MIT) and prop names kept RDP-compatible (`mode`,
  selected/onSelect-style) so a future library swap is a wrapper change, not an API break.

## Plan

- [x] Promote this task to `wip-` and cut `feat/date-range-picker` (commit `23a7432`).
- [x] Shared hook `packages/ui/src/lib/use-range-selection.ts` + `@package/ui/use-range-selection`
      export; anchor/commit/swap, hover preview, `disabledDate(date, anchor?)`, `min`/`max`,
      `excludeDisabled`, `commitBehavior` dismiss. Unit tests.
- [x] `Calendar` range mode on both surfaces (`mode`, `selected`, `preview`, `anchor`, `onSelect`,
      `onHoverChange`, `disabledDate`) with start/middle/end styling via `data-range`; the existing
      single API stays untouched. Tests extended.
- [x] `DateRangePicker` — DOM popover (`@package/ui/date-range-picker`) and native modal twin; tuple
      `[Date, Date]` at the boundary; in-progress dismiss follows `commitBehavior`. DOM tests.
- [x] Pro filter toolbar `date-range` field type. Test extended.
- [x] Docs (`calendar.mdx` range section, new `date-range-picker.mdx`, nav `meta.json`, block page),
      agent catalog entry `ui.date-range-picker`, regenerated docs mirror, kitchen demo field.
- [x] Gates: `pnpm lint`, `pnpm docs:check`, `pnpm workflow:check`, `pnpm agent catalog-check`,
      `pnpm agent:docs:check`, full `pnpm test` with coverage floors held; browser check of the docs
      kitchen demo.
- [x] Close: evidence ledger, acceptance checkboxes, archive to `docs/tasks/done/`.

## Acceptance Criteria

- [x] Shared pure range-selection hook exists with unit tests (anchor/commit/swap, min/max,
      disabled + anchor rules, dismiss behavior), consumed by both surfaces.
      Evidence: `packages/ui/test/use-range-selection.test.tsx` (29 cases, all passing);
      `packages/ui-native/src/components/ui/date-range-picker.tsx` and the native `Calendar` import
      `useRangeSelection`/`rangeDayState` from `@package/ui/use-range-selection`.
- [x] `@package/ui` `Calendar` supports `mode: 'single' | 'range'` with range styling states;
      `DateRangePicker` wrapper exports at `./date-range-picker` with tuple value.
      Evidence: `packages/ui/src/components/ui/calendar.tsx` (`data-range` start/middle/end, grid
      `data-mode`), `packages/ui/package.json` export `./date-range-picker`,
      `packages/ui/test/{calendar,date-range-picker}.test.tsx`.
- [x] `ui-native` mirrors both with modal trigger and tap-tap selection; parity documented.
      Evidence: `packages/ui-native/src/components/ui/{calendar,date-range-picker}.tsx`,
      `packages/ui-native/src/index.ts` re-exports, `npx tsc -p packages/ui-native/tsconfig.json
      --noEmit` exit 0, parity section in `apps/docs/content/docs/components/date-range-picker.mdx`.
- [x] Pro filter toolbar can express a from/to filter using the new wrapper.
      Evidence: `FilterField.type` gains `'date-range'` with a `[Date, Date]` tuple guard;
      `packages/pro/test/filter-toolbar.test.tsx` (20 cases, including tuple rejection and a picked
      range reaching `onFilter`).
- [x] Repository UI gates pass (`pnpm agent check --changed` plus the UI validation skill checks:
      tokens, a11y, package boundaries, catalog docs).
      Evidence: `pnpm agent check --changed` → PASS 27 checks (worktree, 207.4s); full gate run below.

## Evidence Ledger

- 2026-09-20 — Design decisions recorded in this file after a design conversation (build own, port
  RDP semantics, tuple boundary, anchor-aware `disabledDate`); no code existed at that point.
- 2026-09-23 — Approval and execution authorization recorded (see Checkpoint Fields); plan presented
  in-session before any write.
- 2026-09-23 — Pre-existing baselines confirmed before starting: `pnpm agent find date` resolves
  `ui.calendar`, `ui.date-picker`, and `block.filter-toolbar`; `vitest.config.ts` coverage floors and
  include-list inspected; single-date API must remain untouched.
- 2026-09-23 — Scope repair before implementation: `pnpm workflow:check` failed with "product changes
  must declare a canonical PRD field" for two reasons. Fixed by authoring `docs/prd/0012-date-range-picker.md`
  with its approval record and index row, and by deleting the untracked, stale `apps/tauri-app/` build
  output (pre-rename generated files; 41 phantom product paths) after verifying nothing in it was newer
  than the `apps/docs` rename. Reported to the owner in-session.
- 2026-09-23 — Unit suites: `npx vitest run` → 25 files, **433 tests passed**, including the new
  `use-range-selection` (29), `date-range-picker` (13), range-mode `calendar` cases (8 new, 28 total)
  and the pro `date-range` field cases (3 new, 20 total). `npx vitest run --coverage` →
  statements **94.71**, branches **89.7**, functions **94.58**, lines **96.71** against floors
  94 / 87 / 93 / 96 (never lowered); the two new modules joined the include-list and report
  97.67 / 96.1 / 100 / 97.18 (hook) and 100 / 100 / 100 / 100 (wrapper).
- 2026-09-23 — Lint: first `pnpm lint` run after adding tests reported **29 errors**
  (`vitest(require-mock-type-parameters)` — bare `vi.fn()` calls in the new test files). All were
  typed explicitly; re-run → **0 errors, 758 warnings**, matching the recorded warning baseline
  (the gate is 0 errors).
- 2026-09-23 — Docs and catalog: `pnpm agent:docs` and `pnpm agent:docs:check` → `PASS agent docs
  (50 pages)`; `pnpm agent catalog-check` → `PASS agent catalog (exports, imports, examples,
  coverage)`; `pnpm docs:check` → passed; `pnpm workflow:check` → `workflow consistency passed`;
  `npx tsc -p apps/docs/tsconfig.json --noEmit` → exit 0.
- 2026-09-23 — Full gate: `pnpm test` → exit 0 (foundation typecheck and tests, vitest, catalog
  check, agent integration, MCP integration, source tests, source registry build: 111 items,
  102 public entries, 0 runtime dependencies).
- 2026-09-23 — Browser check of the kitchen demo (`pnpm dev`, `http://localhost:1430/blocks/filter-toolbar`):
  the new "Billing Period" date-range field renders as the third field; opening it shows the
  September 2026 grid in range mode; the first press anchors (day announced `pressed=true`,
  `data-range=start`) and leaves the popover open; the second press commits — the trigger reads
  `Sep 10, 2026 – Sep 20, 2026` and the days between are announced ", in selected range";
  `Search` emits `{"date-range":["2026-09-09T17:00:00.000Z","2026-09-19T17:00:00.000Z"]}` in the demo
  output — the same two local days (Sep 10 and Sep 20) serialized as UTC ISO strings.
- 2026-09-23 — Integration: `feat/date-range-picker` (based on `main` @ `f905871`) carries the promotion
  commit `23a7432` and this implementation/closure commit; push, merge to `main`, and any release step
  are the maintainer's actions.

## Verification and closure

- Tested state and relevant environment: Windows, Node 24, pnpm workspace root; docs dev server
  (`pnpm dev`, port 1430) for the browser check.
- Failed / skipped / unverified checks and reasons:
  - **Hover preview not reproduced in the browser.** The in-app browser reported no attached viewport,
    so pointer actions were unavailable and synthetically dispatched `mouseover` events never reached
    React's enter/leave plugin. The preview path is verified instead by the unit suites, which use
    real `userEvent.hover`/`unhover` synthesis. All other interactions above were driven through real
    DOM events.
  - **Docs pages not opened visually.** Every docs route (including pre-existing pages such as
    `/docs/components/date-picker`) stays at "Loading documentation…" in this browser, with only the
    known pre-existing hydration warnings (the inspecto browser extension rewrites DOM attributes) in
    the console. The new page is therefore evidenced by generation and checks: it is globbed into
    `.source/browser.ts`, counted in the 50 pages reported by `agent:docs`, and `docs:check` passes.
  - **Pre-existing baselines left as recorded, not "fixed":** ~758 lint warnings, docs dev-server
    hydration warnings, and the failing `pnpm nd:doctor` skill-selection check.
  - **Closed popovers linger in the DOM in this environment** (`data-state=closed`, animation never
    runs without a viewport). Observed identically on the pre-existing single `DatePicker`, so it is
    not a regression from this change; unmount is exercised in jsdom by the wrapper tests.
- Current-doc reconciliation result / conflicts resolved: `CONTEXT.md` and the components nav were not
  claimed to already include the range API; the catalog entry, nav entry, and `calendar.mdx` range
  section are part of this change, and `llms-full.txt` was regenerated with them.
- Implemented / integrated / deployed state and evidence: implemented and integrated on the feature
  branch with the evidence above; not deployed (no release action authorized).
- Status: done; all acceptance criteria met and evidenced. Push and merge remain the maintainer's.
