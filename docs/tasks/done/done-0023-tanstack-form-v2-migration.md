# Task: 0023 Migrate @tanstack/react-form to v2 alpha

> **PRD:** `docs/prd/0017-tanstack-form-v2-migration.md`
- Mode: shipped on `feat/tanstack-form-v2`; merge to `main` is the owner's call
- Risk / scope approval: Medium (dependency major bump on the pro form surface). Approved by the
  owner in the project conversation on 2026-10-06 with an explicit "yes migrate now" after the
  v2 deep-check assessment was presented.
- Owner / branch / write scope: agent / `feat/tanstack-form-v2` / `packages/pro`,
  `apps/admin-dashboard`, lockfile, this task record, PRD 0017
- Goal: put the pro form surface on the TanStack Form v2 API while the delta is one consumer,
  so the stable-v2 landing is a version bump instead of a migration.

## Context

npm's `latest` dist-tag is `1.33.5`; v2 exists only as alphas `2.0.0-alpha.0` (2026-08-10),
`-alpha.1` (2026-08-13), `-alpha.2` (2026-08-21). The release notes document exactly one
compile-time break through alpha.2: `formOptions.looseSchema`/`strictSchema` now require the
schema as the first argument. No official upgrade guide exists yet. The workspace pinned
`^1.0.0` in `packages/pro` and `apps/admin-dashboard`, with the lockfile already resolving the
latest stable `1.33.5`; the only direct import is `packages/pro/src/form/pro-form.tsx`
(`useForm`, `form.Field`, `api.handleChange`, `form.handleSubmit`), while admin-dashboard
consumes forms only through `ProFormDialog`/`ProFormDrawer`.

## Acceptance Criteria

- [x] `@tanstack/react-form` resolves to a single `2.0.0-alpha.2` in `pnpm-lock.yaml`
- [x] ProForm/ProStepForm behavior unchanged: the 39 existing form/step-form tests pass without
      modification
- [x] Full unit suite stays green (27 files, 448 tests)
- [x] Typecheck, lint (zero errors), docs check, and workflow check pass
- [x] The two undocumented v1→v2 API changes found on the way are recorded here

## What changed and why

**Dependency pins.** `packages/pro/package.json` and `apps/admin-dashboard/package.json` moved
from `^1.0.0` to the exact `2.0.0-alpha.2`. An exact pin is deliberate: a caret on a prerelease
resolves within the same `[major.minor.patch-alpha]` tuple, so a future alpha.3 would land
silently, and mid-alpha drift is exactly what this increment wants to control. Keeping both
packages on the identical exact version also guarantees one form module instance in the
workspace (two versions would duplicate `@tanstack` store contexts).

**pro-form.tsx field API.** Two v2 changes, neither covered by the alpha release notes:

1. Validators are no longer an options object (`{ onChange: fn }`) but a
   `ReadonlyArray<FieldValidator>` of `{ run, triggers, bailIfInvalid?, runOnSubmit?,
   runOnMount?, triggerDebounceMs? }`. The v1 `onChange` semantics map to
   `{ run: fn, triggers: ['change'] }`. Submit-time validation is unchanged because `runOnSubmit`
   defaults to true, which is what keeps the required-field blocks-submission tests passing.
2. The `form.Field` render prop now receives the core `FieldApi` directly: `state` is gone from
   the public type. `api.state.value` → `api.value`, `api.state.meta.errors` → `api.errors`
   (runtime getters that resolve to the same store data). Error entries are normalized to
   `ValidationIssue` objects, so the v1 string-or-object coercion
   (`typeof errors[0] === 'string' ? errors[0] : String(...)`) becomes `api.errors[0]?.message`.

The `name={field.name as never}` / `handleChange(next as never)` erasure casts carried over
unchanged: the schema-driven field names are runtime strings outside TanStack's `DeepKeys`
inference, in both major versions.

## Deliberate deviations from the original plan

- **Alpha adoption itself was the plan's stated risk, not a deviation**, but worth restating:
  the release notes listed one breaking change while the compiler found two API breaks. Alpha
  release notes list PR titles only; anything between stable and stable must be re-proven by
  typecheck + suite, which is what this record does.
- **No `formOptions`/`looseSchema` changes were needed**: the documented alpha.2 break does not
  intersect our usage (no `formOptions` call sites exist in the workspace).

## Evidence Ledger

Baseline, recorded before any edit: `@tanstack/react-form@1.33.5` resolved in `pnpm-lock.yaml`
(L3406), single instance; npm dist-tags `latest: 1.33.5`, `alpha: 2.0.0-alpha.2`.

- 2026-10-06 — **Dependency bump.** Exact `2.0.0-alpha.2` in both package.json files;
  `pnpm install` exit 0 in 54.7s; lockfile now holds exactly one `@tanstack/react-form@2.0.0-alpha.2`
  resolution (L3404) with one peer-resolved instance (L10473). The react-native/expo peer
  warnings during install pre-date this change (reanimated/uniwind streams) and do not involve
  react-form.
- 2026-10-06 — **Undocumented breaks, caught by typecheck.** After the bump, before any source
  edit, `pnpm test:typecheck` FAIL exit 2 with four errors in `pro-form.tsx`:
  `onChange does not exist in type 'readonly FieldValidator<...>[]'` (L222), implicit-any on the
  validator binding (L222), and `Property 'state' does not exist on type 'ReactFieldApi<...>'`
  twice (L235, L242). After the rewrite: `pnpm test:typecheck` PASS.
- 2026-10-06 — **Behavior parity.** `pnpm exec vitest run packages/pro/test/form.test.tsx
  packages/pro/test/step-form.test.tsx`: 2 files, 39 tests, all pass, zero test modifications —
  including required-field submit blocking, custom-validator messages, number/checkbox/switch/
  select submit payloads, and the submit-error boundary ProStepForm relies on.
- 2026-10-06 — **Full suite.** `pnpm test:unit`: 27 files, 448 tests, all pass.
- 2026-10-06 — **Lint.** `pnpm lint`: 0 errors, 793 warnings on 448 files — the advisory
  `perf`/`jsx-a11y` counts documented in `docs/development.md`, unchanged in character by this
  increment (one file touched).
- 2026-10-06 — **Workflow check.** `pnpm agent check --changed` first FAILED with
  "expected at most one in-progress wip task, found 2" (this task's draft scaffold plus the
  expo-uniwind stream's `wip-0022`). Resolved by closing this verified increment into
  `done/` per the board rules, leaving `wip-0022` as the single active task; re-run PASS.

## Checkpoint

- Decisions: exact prerelease pin over a caret range; minimal-diff field API rewrite with the
  erasure casts preserved; docs surface untouched (ProForm is documented behaviorally and the
  public contract did not change).
- Affected docs: PRD 0017 created and indexed; this record.
- Known risks carried forward: the alpha line can shift again before stable (release notes list
  PR titles only — typecheck plus the suite is the real contract); no upstream support for
  alphas; `formOptions.looseSchema/strictSchema` callers would break if introduced later.
- Status: implemented and verified locally on `feat/tanstack-form-v2`. Merge to `main`, PR
  creation, and any release are owner decisions per the ND workflow.
- Follow-up, still open: re-run the release-notes review and a fresh typecheck/test pass when
  TanStack Form v2 goes stable and publishes its migration guide; consider dropping the erasure
  casts if a future alpha widens `DeepKeys` inference for schema-driven names.
