# Task 0013: Date range picker for `@package/ui` and `ui-native`

> **Status:** todo
> **Type:** feature
> **Created:** 2026-09-20
> **PRD:** none yet — decisions below were made in a design conversation and are the working basis

Add a date range picker: extend the shared zero-dependency `Calendar` with a range mode, add a
`DateRangePicker` wrapper to `@package/ui` (popover) and `ui-native` (modal), and expose it in the
pro filter toolbar as a from/to filter. Single-date `DatePicker` already exists on both surfaces
(`packages/ui/src/components/ui/date-picker.tsx`, `packages/ui-native/src/components/ui/date-picker.tsx`);
no range support exists anywhere (`grep DateRange` is clean).

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

## Non-goals

Time picking, timezone handling (stays plain `Date`), locale/formatting overhaul (the existing
English-only `formatDate` limitation is pre-existing and shared with `DatePicker`), renaming or
breaking the existing single-date `DatePicker` API.

## Acceptance Criteria

- [ ] Shared pure range-selection hook exists with unit tests (anchor/commit/swap, min/max,
      disabled + anchor rules, dismiss behavior), consumed by both surfaces.
- [ ] `@package/ui` `Calendar` supports `mode: 'single' | 'range'` with range styling states;
      `DateRangePicker` wrapper exports at `./date-range-picker` with tuple value.
- [ ] `ui-native` mirrors both with modal trigger and tap-tap selection; parity documented.
- [ ] Pro filter toolbar can express a from/to filter using the new wrapper.
- [ ] Repository UI gates pass (`pnpm agent check --changed` plus the UI validation skill checks:
      tokens, a11y, package boundaries, catalog docs).

## Checkpoint

- Decisions: build-own recorded above; no PRD yet — draft one (or promote this file) when picked up.
- Source-backed verification command / tested inputs / result: not run — not started.
- Blockers / next action on pickup: none. Start from `pnpm nd task` to make this the active WIP
  checkpoint, then extend the DOM `Calendar` first (hover preview is easiest to verify there).
- Status: todo; owner and branch unset.
