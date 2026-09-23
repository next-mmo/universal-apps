---
id: "0012"
title: "Date range picker for @package/ui and ui-native"
status: in-progress
last-audit: 2026-09-23
---

# Change Proposal: Zero-dependency date range picker across DOM and native surfaces

Add a date range picker to the shared UI stack: a pure range-selection hook, a `range` mode on the
existing `Calendar` in both `@package/ui` and `ui-native`, a `DateRangePicker` wrapper on each surface,
and a from/to field in the pro filter toolbar. Selection semantics are ported from react-day-picker
(MIT) without taking its dependency; the existing single-date API stays untouched.

## Problem and scope

- **User / problem / desired outcome:** consumers need to pick or filter by a date span (the pro filter
  toolbar is the first concrete consumer). The stack has a single-date `DatePicker` on both surfaces
  but no range support anywhere, and the established `Calendar` is deliberately zero-dependency with
  token-first styling — a DOM-only library would force a second native implementation anyway.
- **In scope (approved):** DRP-01 – DRP-08 below — the shared hook, range mode on both `Calendar`
  surfaces, both `DateRangePicker` wrappers, the pro `date-range` field, unit tests plus coverage
  include-list widening for the new modules, docs/catalog/kitchen updates, and task/PRD bookkeeping.
- **Non-goals:** time picking; timezone handling (values stay plain `Date`); locale or formatting
  overhaul (the pre-existing English-only `formatDate` limitation is shared with `DatePicker`);
  renaming or breaking the single-date API; automated tests for `ui-native` (outside the vitest
  coverage list by design); presets ("Last 7 days") — they belong at a pro wrapper level later;
  npm publication.
- **Open questions:** none blocking. The one accepted trade-off — no automated native tests, so parity
  there is code mirroring plus documentation — is recorded as DRP-08 and in the task's non-goals.

## Approval record

- **Scope approval:** approved.
- **Approver / decision date:** repository maintainer, 2026-09-23.
- **Exact approved scope:** the implementation plan presented in the 2026-09-23 session, matching
  DRP-01 – DRP-08; the 2026-09-20 design conversation (recorded in
  `docs/tasks/wip-0013-date-range-picker.md`) fixes the API decisions.
- **Exclusions:** the non-goals above; any change to the existing single-date behavior; publication,
  push, or release steps.
- **Approval evidence:** the maintainer's explicit "finish all" instruction issued directly after the
  plan presentation and after selecting `todo-0013` as the next task; the plan named every write path
  before any write.
- **Execution authorization:** granted with the same instruction, limited to the owned write paths in
  the task file.
- **Scope changes since approval / renewed decision needed:** none. Any change to the range API shape
  after DRP-01 lands, or any edit outside the owned paths, returns this proposal to draft.

## Requirements

- **DRP-01 — Shared hook.** `packages/ui/src/lib/use-range-selection.ts`, exported as
  `@package/ui/use-range-selection`, is a pure (DOM-free) hook implementing: first press anchors,
  hover previews (DOM input), second press commits with auto-swap when the second date precedes the
  anchor; anchor-aware `disabledDate(date, anchor?)`; `min`/`max` day counts; `excludeDisabled`
  trimming; and `commitBehavior: 'clear' | 'reset' | 'select'` deciding what a mid-selection dismiss
  does. No new runtime dependencies.
- **DRP-02 — Calendar range mode.** Both `Calendar` surfaces accept `mode: 'single' | 'range'` plus
  `selected`, `preview`, `anchor`, `onSelect`, `onHoverChange` (DOM only), and `disabledDate`, render
  `range_start` / `range_middle` / `range_end` states with token classes, and leave the existing
  single-date props (`value`, `onValueChange`, `disabled`) behaviorally unchanged.
- **DRP-03 — Wrappers.** `@package/ui/date-range-picker` (popover) and the `ui-native` modal twin take
  a tuple `[Date, Date]` at the boundary, format the trigger as `Sep 1, 2026 – Sep 20, 2026`, commit
  and close only when both ends exist, and route a mid-selection dismiss through `commitBehavior`
  (default `'reset'` on both surfaces).
- **DRP-04 — Pro filter field.** `FilterField.type` gains `'date-range'`; `ProFilterToolbar` renders
  the DOM wrapper with a tuple guard over `Record<string, unknown>` values.
- **DRP-05 — Tests.** Unit tests cover the hook state machine (anchor/commit/swap, min/max, disabled
  and anchor rules, dismiss), range-mode Calendar rendering and interaction, the DOM wrapper, and the
  pro field. The new modules join the vitest coverage include-list; the global floors (94/87/93/96) are
  never lowered.
- **DRP-06 — Docs and catalog.** `calendar.mdx` gains a range section; a new `date-range-picker.mdx`
  joins the components nav; `agent/catalog.json` gains `ui.date-range-picker` with react and native
  implementations; `apps/docs/public/agent/catalog.json` is regenerated (`pnpm agent:docs`); the
  kitchen filter-toolbar demo shows a range field.
- **DRP-07 — No regression.** `pnpm lint` (0 errors), `pnpm docs:check`, `pnpm workflow:check`,
  `pnpm agent catalog-check`, `pnpm agent:docs:check`, and the full `pnpm test` pass; pre-existing
  baselines (lint warnings, docs dev-server hydration warnings, `pnpm nd:doctor`) are recorded, not
  "fixed" here.
- **DRP-08 — Native parity, honestly scoped.** The native implementation mirrors the DOM behavior
  (tap-tap, modal trigger) and consumes the same hook; parity is verified by typecheck and documented
  in the docs page — there is no automated native test suite, and this limitation is stated rather
  than implied.

## Design decisions

- **D1 — Build own, port the algorithm (2026-09-20).** Rejected react-day-picker (DOM-only, forces two
  implementations) and copying the shadcn range block (the logic lives in the library). Chosen: own
  hook with RDP-ported semantics, prop names kept RDP-compatible (`mode`, selected/onSelect-style) so a
  future library swap is a wrapper change, not an API break.
- **D2 — Layered value shape.** `{ from?, to? }` inside the primitive (it must represent "anchor
  picked, end pending"); tuple `[Date, Date]` at the wrapper/form boundary.
- **D3 — Two callbacks.** Commit plus an in-progress callback carrying `side: 'start' | 'end'` for live
  filtering.
- **D4 — Anchor-aware `disabledDate` from day one**, so range validation rules (e.g. "no pick before
  the anchor") need no retrofit.
- **D5 — Dismiss behavior is explicit.** `commitBehavior` defaults to `'reset'` on both wrappers; the
  hook owns the three semantics so both surfaces behave identically.

## Canonical targets and baseline

- **Canonical targets:** `packages/ui/src/components/ui/{calendar,date-range-picker}.tsx`,
  `packages/ui/src/lib/use-range-selection.ts`, `packages/ui-native/src/components/ui/{calendar,date-range-picker}.tsx`,
  `packages/pro/src/table/pro-filter-toolbar.tsx`, plus the catalog and docs pages named in DRP-06.
- **Baseline revision and file state:** `main` @ `f905871`; branch `feat/date-range-picker`. Baseline
  behavior: `Calendar`/`DatePicker` single-date only; `grep DateRange` clean; `FilterField.type` has
  `text | select | date`.
- **Baseline measurement the change must move:** the docs kitchen filter-toolbar demo gains a from/to
  field; the components nav and catalog gain the new entries.

## Acceptance and delivery

- [x] DRP-01 – DRP-06 evidenced by the unit suites and the built docs/catalog output.
- [x] DRP-07 evidenced by the gate run recorded in the task's evidence ledger.
- [x] DRP-08 evidenced by the documented limitation and mirrored source.
- **Closure record:** `docs/tasks/done/done-0013-date-range-picker.md` (2026-09-23) carries the
  acceptance checkboxes, the gate run, and the browser check of the kitchen demo.
- **Delivery state:** implementation on `feat/date-range-picker`; push, merge to `main`, and any
  release step are the maintainer's actions, not part of this authorization.
