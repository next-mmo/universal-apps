---
id: "0014"
title: "Production readiness: gates that can fail, pins that resolve, coverage that is true"
status: in-progress
last-audit: 2026-09-27
---

# Change Proposal: Production readiness hardening

Make this repository's automated gates mean what they report. Sixteen of seventeen declared
gates pass today, but three classes of blind spot let a green result coexist with an unverified
product: a gate that could not fail, a coverage number measuring a curated slice while calling
itself a floor, and a native surface with no test runner at all.

## Problem and scope

- **User / problem / desired outcome:** a release engineer or a new agent needs to be able to
  read a green CI run and conclude "the shipped surface works." Today they cannot, for reasons
  that are invisible in the logs.
- **In scope (approved):** PR-01 – PR-09 below — a line-ending policy, deterministic dependency
  resolution, a PR gate that builds the app, SHA-pinned actions with dependabot, a release that
  cannot publish a mismatched tag, a coverage gate reporting the true packages-wide number, and
  a consumer-compile gate that can fail for vue and svelte.
- **Non-goals:** the `ui-native` test suite and a DOM/native prop-parity test; runtime validation
  at the `tauri-api` invoke boundary; the optimistic-write path in `packages/core` that reports
  a failed persist as a successful save; any feature work; any change to the published API
  surface; npm publication of a release.

## Requirements

- **PR-01 Line endings.** The repository has no `.gitattributes` while the development machine
  has `core.autocrlf=true`. Files rewritten as LF by a tool diverge from the stale index stat,
  so `git status` reports them modified with an empty `git diff`. Acceptance: a clean
  `git status` on a tree with real work applied, and no binary file normalized.
- **PR-02 One router.** `@tanstack/react-router` is installed at two versions because
  `apps/docs` pinned it exactly while `packages/pro` and `apps/admin-dashboard` used `^1.0.0`.
  Two router instances means two contexts. Acceptance: one version in the lockfile.
- **PR-03 Deterministic resolution.** Four unbounded `>=` ranges admit a major bump, and
  `@babel/runtime` had already resolved across a major. Acceptance: no unbounded range, and a
  `packageManager` field so CI's floating pnpm major is enforced by Corepack.
- **PR-04 The PR gate builds.** `pnpm build` is a required local baseline and no pull-request
  job ran it. Acceptance: `build:web`, `source:smoke`, and `source:compile` run on every PR, so
  a build break cannot merge green and surface only at tag time.
- **PR-05 Pinned supply chain.** Every action is pinned to a commit SHA resolved through the
  GitHub API, and dependabot tracks npm and github-actions. Acceptance: no floating major tag
  remains in `.github/workflows/`.
- **PR-06 A release matches its tag.** Nothing compared `github.ref_name` to the versions
  actually published, so `v9.9.9` on a tree holding `0.1.0-beta.1` would publish under a tag
  implying otherwise. Acceptance: the assertion runs in `verify`, before anything is built.
- **PR-07 True coverage.** The gate named 37 files and reported 96.73% while the real
  packages-wide figure was 40.55% lines and `ui-native` was 0% across 447 lines and 198
  functions. Acceptance: the include list covers every package's source, the floors sit just
  under the measured value, and the remaining gaps are written next to the floors.
- **PR-08 Compilable consumers.** `source:compile` exits 0 while vue and svelte fail with real
  type errors, because `verified` listed only `react` and `native`. Acceptance: both frameworks
  compile, and both are in `verified` so a regression fails the gate.
- **PR-09 An explainable gate.** `pnpm change:scope` failed with a bare exit 1 because pnpm's
  `ELIFECYCLE` wrapper swallowed the message. Acceptance: the reason and two working invocations
  reach stdout. The `--base` requirement itself stays: it exists so an agent cannot guess a
  scope and verify the wrong surface.

## Constraints and risks

- **Ratchet, do not reset.** The coverage floor drops from 96% to 40% in one step. That is the
  point — the old number was never a property of the product — but it must never be raised
  without a measured reason, and never lowered to land a change.
- **`apps/**` stays out of the coverage scope.** The apps are demos and playgrounds with no
  suite; including them drops the floor to 21% for a number that says nothing about the shipped
  libraries. `apps/browser-files-viewer` additionally carries its own vitest install and
  lockfile and is excluded from the pnpm workspace.
- **Peer dependencies get carets, not pins.** An exact pin on a peer forces consumers to match
  it exactly. The defect was the unbounded `>=`, not the precision. Only the pnpm *override* is
  pinned exactly, because an override replaces the specifier outright and cannot express an
  upper bound.
- **Provenance has a precondition.** `--provenance` requires a public repository and an npm
  plan that supports attestations. The permission was already granted for it; a publish that
  fails on a provenance error has that precondition as the first thing to check.
- **A surfaced incompatibility is not fixed here.** Bounding `react-native-reanimated` made an
  unmet peer visible: `4.7.0` wants `react-native@0.86 - 0.88` while the workspace holds
  `0.81.6`. It pre-existed. Downgrading a major of an animation library changes native runtime
  behavior that cannot be verified without a device, so it is a separate decision.

## Out of scope, recorded as debt

- `apps/browser-files-viewer` is a nested repository with its own lockfile, task board, and 26
  tests that no script or workflow runs. Whether it becomes a workspace member, a submodule, or
  moves out is a human call.
- `source-distribution.yml` becomes redundant on paths it matches, now that the PR gate runs
  `source:smoke` and `source:compile` unconditionally. Deleting a workflow was not in scope.
