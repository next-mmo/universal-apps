# Task 0024: Re-review TanStack Form v2 when it reaches stable

> **Status:** blocked  
> **Type:** maintenance  
> **Created:** 2026-10-07  
> **Risk:** Medium  
> **PRD:** `docs/prd/0017-tanstack-form-v2-migration.md`  
> **Branch:** TBD (branch per change when unblocked)

Carry the follow-up recorded in `docs/tasks/done/done-0023-tanstack-form-v2-migration.md`:
the workspace pinned `@tanstack/react-form` to `2.0.0-alpha.2` by owner decision, and the
alpha line can shift before stable — the alpha release notes list PR titles only, so the real
contract is a fresh typecheck plus the test suite, not the changelog.

## Blocker

TanStack Form v2 has no stable release yet (npm `latest` is `1.33.5`; v2 exists only as
`2.0.0-alpha.0`–`2.0.0-alpha.2`, August 2026) and no official migration guide is published.
Nothing is actionable until upstream cuts a stable v2.

## Goal

When `2.0.0` (or a later stable) is published with a migration guide: re-review the release
notes against our single consumer (`packages/pro/src/form/pro-form.tsx`), bump the pin off the
alpha, and prove behavior parity with the existing gates — so the stable-v2 landing is a
version bump, not a surprise migration.

## Acceptance Criteria

- [ ] Release notes for every v2 pre-release after `2.0.0-alpha.2` reviewed against our usage
      (`useForm`, `form.Field`, validator array, `api.value`/`api.errors`, `handleChange`,
      `handleSubmit`); any new break adapted in `pro-form.tsx`
- [ ] Pin moved from `2.0.0-alpha.2` to the stable version in `packages/pro` and
      `apps/admin-dashboard`, single resolution in `pnpm-lock.yaml`
- [ ] `pnpm test:typecheck` clean; `packages/pro` form/step-form tests pass unmodified;
      `pnpm test:unit` green; `pnpm lint` zero errors
- [ ] `docs:check` and `agent check --changed` pass; increment recorded in `docs/tasks/done/`

## Checkpoint

- Decisions: owner directed tracking on 2026-10-07 after PRD 0017 shipped; the record stays
  `blocked` until upstream publishes stable v2.
- Context: PRD 0017 closure (why the alpha pin exists), done-0023 evidence ledger (what the
  alpha migration changed and how it was proven).
- Blockers / next action: upstream stable v2 + migration guide; then execute the acceptance
  criteria on a fresh `feat/*` branch.
