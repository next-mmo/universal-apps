---
id: "0017"
title: "TanStack Form v2 migration for the pro form components"
status: shipped
last-audit: 2026-10-07
---

# Change Proposal: TanStack Form v2 migration for the pro form components

## Problem and scope

- **User / problem / desired outcome:** `@tanstack/react-form` v2 exists as an alpha line
  (`2.0.0-alpha.0`–`2.0.0-alpha.2`, August 2026) while the workspace holds the `1.33.5` stable.
  Carrying the pro form surface onto the v2 API now means the eventual stable-v2 landing is a
  version bump instead of a migration, and the undocumented v1→v2 API drift is discovered while
  the delta is small (one direct consumer).
- **In scope:** repinning `@tanstack/react-form` to `2.0.0-alpha.2` in `packages/pro` and
  `apps/admin-dashboard`; adapting the single direct consumer
  (`packages/pro/src/form/pro-form.tsx`) to the v2 validator and field-state API; behavior
  parity proven by the existing ProForm/ProStepForm suites.
- **Non-goals:** exposing new form features; changing the `ProForm` public props/schema
  contract; migrating other TanStack packages; docs surface changes (the docs describe ProForm
  behaviorally and name no library version).
- **Implementation model:** exact prerelease pin (a caret on an alpha invites silent drift
  between alphas); the v1 `validators={{ onChange: fn }}` object becomes the v2
  `validators={[{ run: fn, triggers: ['change'] }]}` array; field reads move from
  `api.state.value` / `api.state.meta.errors` to `api.value` / `api.errors` where errors are
  `ValidationIssue` objects carrying `.message`. Submit-time validation is preserved by the v2
  default (`runOnSubmit` defaults to true), so required-field blocking on submit keeps working.

## Approval record

- **Scope approval:** approved.
- **Approver / decision date:** repository owner request in the current project conversation,
  2026-10-06.
- **Approved scope:** a deep check of the v2 alpha line (npm dist-tags, alpha.0–alpha.2 release
  notes, GitHub release PR) followed by migration of the two pinned packages and the one
  consumer.
- **Execution authorization:** explicit "yes migrate now" received 2026-10-06.
- **Risk acceptance:** the owner accepts an alpha pin — undocumented type/API changes are
  expected (two were found and fixed in this increment), no upstream support contract exists
  for alphas, and the stable-v2 landing requires re-review of the release notes and a fresh
  typecheck/test pass.

## Requirements

- R1: `@tanstack/react-form` resolves to a single `2.0.0-alpha.2` in `pnpm-lock.yaml` (no
  duplicate form instances across `packages/pro` and `apps/admin-dashboard`).
- R2: ProForm/ProStepForm behavior is unchanged: label/control association, default values,
  submit payloads (number fields submit numbers, emptied number fields submit `undefined`,
  checkbox/switch submit booleans, selects submit the option value), required-field blocking
  with a visible `role=alert`, custom validator messages, caller submit errors, cancel, and
  pending relabeling.
- R3: workspace gates stay green: `test:typecheck`, `lint` (zero errors), `test:unit`,
  `docs:check`, and `agent check --changed`.
- R4: the increment is recorded with a before/after evidence ledger in
  `docs/tasks/done/done-0023-tanstack-form-v2-migration.md`.

## Closure

- **Closure record:** `docs/tasks/done/done-0023-tanstack-form-v2-migration.md` (2026-10-07)
  carries the acceptance checkboxes, the two undocumented v1→v2 API breaks found on the way
  (validator array shape, `FieldApi.state` removal), and the gate run: typecheck, the 39
  form/step-form tests unmodified, the 448-test unit suite, lint, and the docs and workflow
  checks.
- **Delivery state:** merged to `main` 2026-10-07 via PR #17 after all nine PR checks passed
  (`verify`, `windows-foundation`, `source-distribution`, six `standalone` legs, Vercel preview
  comment); any release step remains a maintainer action, outside this authorization.
- **Follow-up:** the stable-v2 re-review is tracked as
  `docs/tasks/blocked-0024-tanstack-form-v2-stable-review.md`.
