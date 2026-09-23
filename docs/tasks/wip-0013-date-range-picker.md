# Task 0013: Date range picker for `@package/ui` and `ui-native`

> **Status:** wip
> **Type:** feature
> **Created:** 2026-09-20
> **PRD:** `docs/prd/0012-date-range-picker.md` — the 2026-09-20 design decisions below are the
> approved working basis and are folded into that PRD.

Add a date range picker: extend the shared zero-dependency `Calendar` with a range mode, add a
`DateRangePicker` wrapper to `@package/ui` (popover) and `ui-native` (modal), and expose it in the
pro filter toolbar as a from/to filter. Single-date `DatePicker` already exists on both surfaces
(`packages/ui/src/components/ui/date-picker.tsx`, `packages/ui-native/src/components/ui/date-picker.tsx`);
no range support exists anywhere (`grep DateRange` is clean at the 2026-09-20 baseline).

## Checkpoint Fields (ND)

- Owner: implementation session agent; acceptance stays with the repository maintainer.
- Scope approval: **approved 2026-09-23** — the plan presented in session (shared hook, Calendar
  range mode on both surfaces, `DateRangePicker` wrappers, pro `date-range` field, docs/catalog/kitchen
  updates, tests plus coverage-list widening, task promotion, gates). Evidence: explicit "finish all"
  instruction issued directly after that plan; the 2026-09-20 decision record fixes the design.
- Execution authorization: granted with the same instruction, scoped to the owned write paths below.
  Publication, push, and any release action remain outside this authorization.
- Exact next action: implement the shared `useRangeSelection` hook, then Calendar range mode, wrappers,
  pro field, docs/catalog, gates.

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
- **Chosen: build own**, as a pure shared `useRangeSelection` hook consumed by both packages
  (`ui-native` already imports `@package/ui/cn`, so the cross-package path exists), with the
  selection semantics ported from react-day-picker (MIT) and prop names kept RDP-compatible
  (`mode`, selected/onSelect-style) so a future library swap is a wrapper change, not an API break.

## Design targets (from rc-picker / shadcn / React Aria research)

- Selection state machine: first click anchors → hover previews the span (DOM only) → second click
  commits → picking an earlier date auto-swaps.
- Value shape: `{ from?: Date; to?: Date }` inside the primitive (must represent "anchor picked, end
  pending"); tuple `[Date, Date]` at the wrapper/form boundary — the antd layering.
- Two callbacks: commit (`onValueChange`-style) plus an in-progress callback carrying
  `side: 'start' | 'end'` (rc-picker's `onCalendarChange` + `info.range` lesson) for live filters.
- `disabledDate(date, anchor?)` anchor-aware from day one (antd's `info.from` semantics) so range
  validation rules are possible without a retrofit.
- `min`/`max` day counts and `excludeDisabled` semantics (react-day-picker), intermediate styling
  states `range_start` / `range_middle` / `range_end`.
- RN parity: no hover — tap-tap; decide dismiss-mid-selection via a `commitBehavior`-style choice
  (React Aria: `'clear' | 'reset' | 'select'`), default reset on native.
- Presets ("Last 7 days") belong at the pro wrapper level as a slot, matching antd's
  `{ label, value: () => [start, end] }`.

## Plan

- [ ] Promote this task to `wip-` and cut `feat/date-range-picker` (this commit).
- [ ] Shared hook `packages/ui/src/lib/use-range-selection.ts` + `@package/ui/use-range-selection`
      export; anchor/commit/swap, hover preview, `disabledDate(date, anchor?)`, `min`/`max`,
      `excludeDisabled`, `commitBehavior` dismiss. Unit tests.
- [ ] `Calendar` range mode on both surfaces (`mode`, `selected`, `preview`, `anchor`, `onSelect`,
      `onHoverChange`, `disabledDate`) with `range_start`/`range_middle`/`range_end` styling; the
      existing single API stays untouched. Tests extended.
- [ ] `DateRangePicker` — DOM popover (`@package/ui/date-range-picker`) and native modal twin; tuple
      `[Date, Date]` at the boundary; in-progress dismiss follows `commitBehavior`. DOM tests.
- [ ] Pro filter toolbar `date-range` field type. Test extended.
- [ ] Docs (`calendar.mdx` range section, new `date-range-picker.mdx`, nav `meta.json`), agent
      catalog entry `ui.date-range-picker`, regenerated docs mirror, kitchen demo field.
- [ ] Gates: `pnpm lint`, `pnpm docs:check`, `pnpm workflow:check`, `pnpm agent catalog-check`,
      `pnpm agent:docs:check`, full `pnpm test` with coverage floors held; browser check of the
      docs kitchen demo.
- [ ] Close: evidence ledger, acceptance checkboxes, archive to `docs/tasks/done/`.

## Acceptance Criteria

- [ ] Shared pure range-selection hook exists with unit tests (anchor/commit/swap, min/max,
      disabled + anchor rules, dismiss behavior), consumed by both surfaces.
- [ ] `@package/ui` `Calendar` supports `mode: 'single' | 'range'` with range styling states;
      `DateRangePicker` wrapper exports at `./date-range-picker` with tuple value.
- [ ] `ui-native` mirrors both with modal trigger and tap-tap selection; parity documented.
- [ ] Pro filter toolbar can express a from/to filter using the new wrapper.
- [ ] Repository UI gates pass (`pnpm agent check --changed` plus the UI validation skill checks:
      tokens, a11y, package boundaries, catalog docs).

## Evidence Ledger

- 2026-09-20 — Design decisions recorded in this file after a design conversation (build own, port
  RDP semantics, tuple boundary, anchor-aware `disabledDate`); no code existed at that point.
- 2026-09-23 — Approval and execution authorization recorded (see Checkpoint Fields); plan presented
  in-session before any write.
- 2026-09-23 — Pre-existing baselines confirmed before starting: `pnpm agent find date` resolves
  `ui.calendar`, `ui.date-picker`, and `block.filter-toolbar`; `vitest.config.ts` coverage floors and
  include-list inspected; single-date API must remain untouched.

## Resume State

- Updated at / author: 2026-09-23, implementation session.
- Completed / partial / not started: promotion done; all implementation not started.
- Branch/worktree and base revision: `feat/date-range-picker`, based on `main` @ `f905871`.
- Exact next action or command and working directory: create
  `packages/ui/src/lib/use-range-selection.ts`; repository root.
- Current hypothesis / blockers / decision needed: none blocking; the open questions of the 2026-09-20
  design (e.g. `commitBehavior` default) are pinned as `'reset'` for both wrappers.
- Owned write paths: `packages/ui/**`, `packages/ui-native/**`, `packages/pro/src/table/**`,
  `packages/pro/test/filter-toolbar.test.tsx`, `vitest.config.ts`, `agent/catalog.json`,
  `apps/docs/content/docs/components/**`, `apps/docs/public/agent/catalog.json`,
  `apps/docs/src/pages/filter-toolbar-page.tsx`, `docs/tasks/wip-0013-date-range-picker.md`.
- Evidence still valid / invalidated and why: the 2026-09-20 `grep DateRange` clean baseline stays
  valid while no range code lands.
- Relevant source, docs, and output paths: `packages/ui/src/components/ui/{calendar,date-picker,popover}.tsx`,
  `packages/ui-native/src/components/ui/{calendar,date-picker}.tsx`,
  `packages/pro/src/table/pro-filter-toolbar.tsx`, `packages/ui/test/calendar.test.tsx`,
  `packages/pro/test/filter-toolbar.test.tsx`, `vitest.config.ts`.

## Verification and closure

- Criterion / command or inspection / result / evidence location: filled in at closure.
- Tested state and relevant environment: Windows, Node 24, pnpm workspace root; docs dev server for
  the browser check.
- Current-doc reconciliation result / conflicts resolved: pending; docs pages and catalog are part of
  the change itself.
- Failed / skipped / unverified checks and reasons: recorded at closure.
- Implemented / integrated / deployed state and evidence: not implemented yet.
- Status: in progress; acceptance criteria above remain unchecked.
