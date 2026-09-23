---
id: "0013"
title: "Locale-aware date formatting for the date components"
status: in-progress
last-audit: 2026-09-23
---

# Change Proposal: Locale-aware date formatting across the date components

Replace the hard-coded English month, weekday, and day strings in the `@package/ui` and `ui-native`
date components with `Intl.DateTimeFormat`, and add an optional `locale` prop to `Calendar`,
`DatePicker`, and `DateRangePicker` on both surfaces. No date library is added — the pure-JS,
DST-safe date arithmetic that PRD 0012 built stays exactly as it is.

## Problem and scope

- **User / problem / desired outcome:** every visible date string in `Calendar`, `DatePicker`, and
  `DateRangePicker` was hard-coded English ("September 2026", "Sun", "Sep 20, 2026"), so the
  components were unusable as-is in a non-English host even though the date math underneath was
  locale-independent. PRD 0012 recorded this as a deferred non-goal ("the pre-existing English-only
  `formatDate` limitation is shared with `DatePicker`"); this proposal picks that item up.
- **In scope (approved):** DL-01 – DL-06 below — a shared formatting module, `locale` props on the six
  component files across the two surfaces, test updates that derive expectations through `Intl`, the
  new module joining the coverage include-list, docs/catalog updates, and task/PRD bookkeeping.
- **Non-goals:** adopting a date library (the zero-dependency stance stays); week-start or
  first-day-of-week changes (the grid stays Sunday-first); parsing, serialization, or timezone
  handling (`Date` values and the `[Date, Date]` boundary are unchanged); localizing the
  "in selected range" screen-reader suffix; the table-cell `formatDate` helpers in `pro`, `pro-vue`,
  and `pro-svelte` (their own future increment); the CLI-vendored copy inside `apps/uniwind-bare`
  (hash-pinned by `universal.lock.json`; it updates through the CLI, not by hand); npm publication.
- **Open questions:** none blocking.

## Approval record

- **Scope approval:** approved.
- **Approver / decision date:** repository maintainer, 2026-09-23.
- **Exact approved scope:** the recommendation presented in the 2026-09-23 session — keep the pure-JS
  date core, format display strings through `Intl.DateTimeFormat` in one shared cached module, and add
  an optional `locale` prop on both surfaces — with the exclusions above.
- **Exclusions:** the non-goals; any change to date math, week layout, or component APIs beyond the
  additive `locale` prop; publication, push, or release steps.
- **Approval evidence:** the maintainer's "update all what you think best" instruction issued after the
  build-vs-library trade-off discussion, followed by "approve all this time"; the plan named every
  write path before any write.
- **Execution authorization:** granted with the same instruction, limited to the owned write paths in
  the task file.
- **Scope changes since approval / renewed decision needed:** none. Any change to the date-math core
  or the week layout returns this proposal to draft.

## Requirements

- **DL-01 — Shared formatter module.** `packages/ui/src/lib/date-format.ts`, exported as
  `@package/ui/date-format`, provides `formatMonthYear`, `formatDayLabel`, `formatDateShort`, and
  `weekdayLabels` over `Intl.DateTimeFormat`, with a per-locale formatter cache. Zero runtime
  dependencies; a `locale` of `undefined` means the runtime locale.
- **DL-02 — Locale props.** `Calendar`, `DatePicker`, and `DateRangePicker` on both `@package/ui` and
  `ui-native` accept an optional `locale?: string`; each picker forwards it to its calendar so trigger
  text and grid labels agree. Behavior with the prop omitted is identical to today's en-US runtime.
- **DL-03 — Weekday headers localize, week layout does not.** Weekday names derive from a fixed Sunday
  anchor (`new Date(2024, 0, 7)`), matching the existing `getDay()`-indexed, Sunday-first grid.
- **DL-04 — Tests.** English month-name literals in
  `packages/ui/test/{calendar,date-range-picker}.test.tsx` and `packages/pro/test/filter-toolbar.test.tsx`
  derive through `Intl` instead; new pinned-locale cases prove the prop threads through trigger text,
  heading, weekday header, and day labels; `date-format` gets its own unit suite. The new module joins
  the vitest coverage include-list; the global floors (94/87/93/96) are never lowered.
- **DL-05 — Docs and catalog.** Localization sections in `calendar.mdx`, `date-picker.mdx`, and
  `date-range-picker.mdx`; the `ui.calendar`, `ui.date-picker`, and `ui.date-range-picker` catalog
  entries gain the `locale` keyword; `pnpm agent:docs` regenerates `llms-full.txt`.
- **DL-06 — No regression.** `pnpm lint` (0 errors), `pnpm docs:check`, `pnpm workflow:check`,
  `pnpm agent catalog-check`, `pnpm agent:docs:check`, and the vitest suites with coverage floors held
  pass; pre-existing baselines (lint warnings, docs dev-server hydration warnings, `pnpm nd:doctor`)
  are recorded, not "fixed" here.

## Design decisions

- **D1 — Keep the pure-JS core (2026-09-23).** The arithmetic (component-constructor day math,
  start-of-day `Math.round` diffs, `isSameDay` field comparison) is already DST-safe; a library would
  add a dependency without changing behavior. Rejected: date-fns/dayjs (format-level value at the cost
  of a runtime dependency the zero-dependency stance forbids) and a hand-maintained month table (that
  table is the bug).
- **D2 — `Intl.DateTimeFormat` only, cached per locale.** Formatter construction is the expensive
  part, so instances are memoized in a module-level map keyed by style and locale; formatting is cheap.
- **D3 — Locale is a display concern, not a value concern.** Values stay plain `Date`; nothing is
  parsed or serialized differently, so pinning a locale cannot change what a host reads back.
- **D4 — Sunday-first stays.** Changing the first day of the week is a behavior change with layout
  consequences, not a formatting fix; it is documented, not done here.

## Canonical targets and baseline

- **Canonical targets:** `packages/ui/src/lib/date-format.ts`,
  `packages/ui/src/components/ui/{calendar,date-picker,date-range-picker}.tsx`,
  `packages/ui-native/src/components/ui/{calendar,date-picker,date-range-picker}.tsx`, plus the docs
  pages and catalog entries named in DL-05.
- **Baseline revision and file state:** `main` @ `72718d0`; branch `feat/date-locale-formatting` in an
  isolated worktree. Baseline behavior: month/weekday/day strings hard-coded English in both
  `calendar.tsx` files; both picker triggers use a local `formatDate`.
- **Baseline measurement the change must move:** `pnpm agent find locale` resolves the three date
  components, and with `locale="fr-FR"` the heading, weekday header, day labels, and trigger text all
  render in French.

## Acceptance and delivery

- [x] DL-01 – DL-05 evidenced by the unit suites and the built docs/catalog output.
- [x] DL-06 evidenced by the gate run recorded in the task's evidence ledger.
- **Closure record:** `docs/tasks/done/done-0019-locale-aware-date-formatting.md` (2026-09-23) carries
  the acceptance checkboxes, the gate run, and the coverage numbers.
- **Delivery state:** implementation on `feat/date-locale-formatting`, merged to `main` 2026-09-23 by
  the maintainer; any release step remains a maintainer action, outside this authorization.
