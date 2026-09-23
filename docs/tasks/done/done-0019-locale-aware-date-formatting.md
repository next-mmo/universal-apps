# Task 0019: Locale-aware date formatting for the date components

> **Status:** done
> **Type:** enhancement
> **Created:** 2026-09-23
> **PRD:** `docs/prd/0013-locale-aware-date-formatting.md`

Replace the hard-coded English date strings in `Calendar`, `DatePicker`, and `DateRangePicker` on both
`@package/ui` and `ui-native` with `Intl.DateTimeFormat` (one shared cached module), and add an
optional `locale` prop to each component. The pure-JS, DST-safe date math landed with task 0013 is kept
unchanged; no date library is added. Executed in an isolated worktree (`.eval-wt/date-locale`) because
another session held the main checkout at start.

## Checkpoint Fields (ND)

- Owner: implementation session agent; acceptance stays with the repository maintainer.
- Scope approval: **approved 2026-09-23** — the recommendation presented in session (keep the pure-JS
  core; format display strings through a shared `Intl` module; add an optional `locale` prop on both
  surfaces) with the exclusions recorded in the PRD. Evidence: the maintainer's "update all what you
  think best" instruction after the build-vs-library discussion, then "approve all this time".
- Execution authorization: granted with the same instruction, scoped to the owned write paths below.
  Publication, push, and any release action remain outside this authorization.
- Exact next action: finish the gate run below, record its output in the Evidence Ledger, close.

## Goal and scope

- Mode: implementation of an approved, decision-complete increment.
- Outcome / why: hosts in any locale get correctly formatted month, weekday, day, and trigger strings
  from the date components without the stack taking on a date dependency.
- In scope: `packages/ui/src/lib/date-format.ts` plus the `./date-format` export; the `locale` prop and
  `Intl` formatting on `Calendar`, `DatePicker`, and `DateRangePicker` in both `packages/ui` and
  `packages/ui-native`; test updates and new pinned-locale cases; coverage include-list widening;
  Localization sections in the three docs pages; catalog keywords; regenerated `llms-full.txt`;
  PRD/task bookkeeping.
- Non-goals (see PRD): a date library; week-start changes (grid stays Sunday-first); parsing,
  serialization, or timezone handling; localizing the "in selected range" screen-reader suffix; the
  `pro`/`pro-vue`/`pro-svelte` table `formatDate` helpers; the hash-pinned `apps/uniwind-bare` vendored
  copy; npm publication.
- Owned write paths: `packages/ui/src/lib/date-format.ts`, `packages/ui/package.json`,
  `packages/ui/src/components/ui/{calendar,date-picker,date-range-picker}.tsx`,
  `packages/ui/test/*`, `packages/ui-native/src/components/ui/{calendar,date-picker,date-range-picker}.tsx`,
  `packages/pro/test/filter-toolbar.test.tsx`, `vitest.config.ts`,
  `apps/docs/content/docs/components/{calendar,date-picker,date-range-picker}.mdx`,
  `agent/catalog.json`, `llms-full.txt`, `docs/prd/0013-locale-aware-date-formatting.md`,
  `docs/prd/0000-prd-index.md`, this file.

## Plan

- [x] Isolated worktree: `git worktree add .eval-wt/date-locale -b feat/date-locale-formatting 72718d0`
      (main checkout was held by another session); `pnpm install --frozen-lockfile` exit 0.
- [x] `packages/ui/src/lib/date-format.ts` — `formatMonthYear`, `formatDayLabel`, `formatDateShort`,
      `weekdayLabels` over `Intl.DateTimeFormat` with a per-locale formatter cache; `./date-format`
      export added to `packages/ui/package.json`. Unit suite `packages/ui/test/date-format.test.tsx`.
- [x] DOM components: constant English tables removed from `calendar.tsx`; heading, weekday headers,
      day labels, and both picker triggers now format through the module; `locale?: string` added to
      all three props interfaces and forwarded to the calendar.
- [x] `ui-native` mirrors the same change over `@package/ui/date-format`.
- [x] Tests: English literals in `packages/ui/test/{calendar,date-range-picker}.test.tsx` and
      `packages/pro/test/filter-toolbar.test.tsx` now derive through `Intl`; pinned-locale `fr-FR`
      cases added per surface; `packages/ui/src/lib/date-format.ts` added to the coverage include-list.
- [x] Docs and catalog: Localization sections in the three component pages; `locale` keyword added to
      the three catalog entries; `pnpm agent:docs` regenerated `llms-full.txt` (50 pages, exit 0).
- [x] Gates: `pnpm lint`, `pnpm docs:check`, `pnpm workflow:check`, `pnpm agent catalog-check`,
      `pnpm agent:docs:check`, `pnpm test:typecheck`, the coverage run, the full `pnpm test`, and
      `pnpm agent check --changed` — all results below.
- [x] Close: PRD acceptance boxes flipped, task record moved to `done/` with the ledger.

## Acceptance Criteria

- [x] A zero-dependency shared formatter module exists, exported as `@package/ui/date-format`, with a
      per-locale `Intl.DateTimeFormat` cache.
      Evidence: `packages/ui/src/lib/date-format.ts`; `packages/ui/package.json` export `./date-format`;
      `packages/ui/test/date-format.test.tsx` (4 cases passing).
- [x] `Calendar`, `DatePicker`, and `DateRangePicker` on both surfaces accept `locale?: string`; the
      pickers forward it to their calendar; omitted means the runtime locale.
      Evidence: `packages/ui/src/components/ui/{calendar,date-picker,date-range-picker}.tsx` and the
      `ui-native` twins; new pinned-locale cases in `packages/ui/test/calendar.test.tsx` (Calendar and
      DatePicker) and `packages/ui/test/date-range-picker.test.tsx` assert `fr-FR` trigger text,
      heading, weekday header, and day label.
- [x] Weekday headers localize while the grid stays Sunday-first (names derive from a Sunday anchor).
      Evidence: `weekdayLabels` anchored at `new Date(2024, 0, 7)`; weekday-header assertion in the
      pinned-locale Calendar case; `data-range`/`aria-pressed` range tests unchanged and passing.
- [x] Existing behavior is unchanged with the prop omitted: the full suite passes with expectations
      derived from the runtime locale, and the pro filter toolbar tests are unchanged in intent.
      Evidence: `npx vitest run` → 17 files, 328 tests passed (targeted ui+pro run).
- [x] Coverage floors hold and the new module is measured.
      Evidence: `pnpm test:coverage` → 26 files, 439 tests passed, exit 0; statements 94.75, branches
      89.74, functions 94.63, lines 96.73 against floors 94/87/93/96; `date-format.ts` reports
      100/100/100/100.
- [x] Docs and catalog move: Localization sections ship, `pnpm agent find locale` (catalog keywords)
      resolves the date components, `llms-full.txt` is regenerated.
      Evidence: `apps/docs/content/docs/components/{calendar,date-picker,date-range-picker}.mdx`;
      `agent/catalog.json` keyword `locale` on `ui.calendar`, `ui.date-picker`,
      `ui.date-range-picker`; `pnpm agent:docs` exit 0 (50 pages).
- [x] Repository gates green: `pnpm lint` (0 errors), `pnpm docs:check`, `pnpm workflow:check`,
      `pnpm agent catalog-check`, `pnpm agent:docs:check`, `pnpm test:typecheck`, full `pnpm test`,
      and `pnpm agent check --changed` (27 checks). Evidence in the ledger below.

## Evidence Ledger

- 2026-09-23 — Scope discussion and approval: the maintainer asked whether to adopt a lightweight date
  library and then approved the response ("update all what you think best", "approve all this time").
  The shared conclusion: the pure-JS math is already DST-safe, so the fix is display formatting via
  `Intl`, not a dependency. Recorded in the PRD approval record.
- 2026-09-23 — Isolation decision: the main checkout was held by another session
  (`fix/docs-drawer-interactive-mdx` with uncommitted edits); the maintainer selected the isolated
  worktree option. `git worktree add .eval-wt/date-locale -b feat/date-locale-formatting 72718d0`
  created the checkout without touching the other session's tree; `pnpm install --frozen-lockfile`
  completed exit 0.
- 2026-09-23 — Scope boundaries recorded before writing: `uniwind-bare`'s vendored `calendar.tsx` is
  hash-pinned in its `universal.lock.json` and updates through the CLI, so it is excluded; the
  `pro`/`pro-vue`/`pro-svelte` table `formatDate` helpers are excluded; the CLI registry picks up
  `date-format.ts` automatically (import-closure walk in `packages/cli/source/graph.mjs`), so no
  registry file lists needed edits.
- 2026-09-23 — Implementation landed on the branch: new `date-format.ts` (zero imports), `locale` props
  on all six component files, English constant tables deleted; `pnpm exec vitest run packages/ui/test
  packages/pro/test` → 17 files, **328 tests passed**.
- 2026-09-23 — Coverage: `pnpm test:coverage` → 26 files, **439 tests passed**, exit 0; statements
  94.75, branches 89.74, functions 94.63, lines 96.73 (floors 94/87/93/96, never lowered);
  `date-format.ts` 100/100/100/100.
- 2026-09-23 — Docs: `pnpm agent:docs` → `PASS agent docs (50 pages)`, exit 0; `llms-full.txt`
  regenerated with the Localization sections.
- 2026-09-23 — Gate run (all in the isolated worktree): `pnpm lint` → **0 errors, 761 warnings**
  (warning baseline band, gate is 0 errors), exit 0; `pnpm test:typecheck` → exit 0;
  `pnpm docs:check` → passed (one pre-existing budget-headroom WARN on `AGENTS.md`);
  `pnpm workflow:check` → `workflow consistency passed` (21 working-tree paths, 15 product paths,
  synchronized to this task and PRD 0013); `pnpm agent catalog-check` → `PASS agent catalog (exports,
  imports, examples, coverage)`; `pnpm agent:docs:check` → `PASS agent docs (50 pages)`.
- 2026-09-23 — Full gate: `pnpm test` → exit 0 (foundation typecheck and tests, vitest, catalog check,
  agent integration, MCP integration, source tests 36 pass / 1 skipped, source registry build:
  **112 items, 103 public entries, 0 runtime dependencies** — one item above the 0013 baseline of
  111/102, which is `date-format` entering the CLI import closure).
- 2026-09-23 — UI validation fast path: `pnpm agent check --changed` → `PASS 27 checks (worktree)`,
  227.6s, exit 0.

## Verification and closure

- Tested state and relevant environment: Windows, Node 24, pnpm workspace; isolated worktree
  `.eval-wt/date-locale` on branch `feat/date-locale-formatting` based on `72718d0`.
- Pre-existing baselines left as recorded, not "fixed": ~700+ lint warnings, docs dev-server hydration
  warnings on localhost:1430, and the failing `pnpm nd:doctor` skill-selection check.
- Failed / skipped / unverified checks and reasons: no browser check intended for this increment — the
  change is prop-level formatting with DOM assertions in jsdom covering trigger, heading, weekday
  header, and day labels; `ui-native` parity remains code mirroring plus typecheck (that package stays
  outside the vitest coverage list by design, as recorded in PRD 0012).
- Implemented / integrated / deployed state and evidence: implemented and integrated with the
  evidence above and merged to `main` 2026-09-23; not deployed (no release action authorized).
- Status: done; all acceptance criteria met and evidenced. Merged to `main` 2026-09-23 by the
  maintainer.
