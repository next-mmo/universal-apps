# Task: 0020 Production readiness: gates, pins, coverage ratchet, vue/svelte compile gate

> **PRD:** `docs/prd/0014-production-readiness-gates-and-pins.md`
- Mode: implemented on a feature branch; not merged to `main`
- Risk / scope approval: High (CI, release path, dependency graph). Approved by the owner in
  session `mvs_99f98c588d57463aa99298184777282f` on 2026-09-27, with three explicit decisions:
  ratchet the coverage gate to the true number now, land the low-risk batch only, and fix the
  vue/svelte type errors then gate them.
- Owner / branch / write scope: mavis / `chore/production-readiness` / repo root
- Goal: Close the gaps that let this repo report green while whole surfaces were unverified.

## Context

A six-way read-only audit of the repo found 16 of 17 declared gates passing, but three
classes of blind spot: a green gate that could not fail, a coverage number measuring a curated
37 files while the true packages-wide figure was 40.55%, and a native surface at 0%.

## Acceptance Criteria

- [x] Repository has a line-ending policy, and `git status` is a usable signal again
- [x] `@tanstack/react-router` resolves to one version instead of two
- [x] No unbounded `>=` range resolves a major upward; `packageManager` pinned
- [x] The PR gate builds the app and proves the published source surface
- [x] Every GitHub Action is pinned to a commit SHA, with dependabot tracking them
- [x] `pnpm change:scope` failure explains itself through the pnpm wrapper
- [x] A release cannot publish a tag that disagrees with the package versions
- [x] Coverage gate reports the true packages-wide number, not a curated slice
- [x] vue and svelte starters compile, and the gate fails if they stop

## What changed and why

**Line endings.** No `.gitattributes` existed while the machine has `core.autocrlf=true`.
Files rewritten as LF by a tool diverged from the stale index stat, so `routeTree.gen.ts` and
`llms-full.txt` reported modified forever with an empty `git diff`. That made `git status`
unusable and made `change:scope` and `agent check --changed` run against changes that did not
exist. Added `* text=auto eol=lf` plus explicit binary rules, then renormalized. Only
`.vscode/settings.json` changed content-wise; both phantom files went clean.

**Dependency pins.** `apps/docs` pinned `@tanstack/react-router` exactly while `packages/pro`
and `apps/admin-dashboard` used `^1.0.0`, so two router instances were installed. Aligned all
three on `^1.170.38`; the lockfile now holds a single version. The unbounded `>=` floors
(`@babel/runtime`, `react-native-gesture-handler`, `react-native-reanimated`) admitted a major
bump that had already happened. The override became an exact pin because an override replaces
the specifier outright and cannot express an upper bound; the dependencies and peer
dependencies became bounded carets, because an exact pin on a peer breaks consumers.

**CI.** The PR gate never ran a build, so a break in `fumadocs-mdx`, the preview bundles,
`vite build`, or the docs tsconfig merged green and failed only at release. Added
`build:web`, `source:smoke`, and `source:compile` to the gate and raised its timeout from 20
to 35 minutes. Pinned every action to a commit SHA resolved through the GitHub API, not
hand-written, and added a dependabot config for npm and github-actions.

**Release.** Nothing compared `github.ref_name` to the versions actually published, so
`v9.9.9` on a tree holding `0.1.0-beta.1` would publish under a tag implying otherwise. Added
that assertion to `verify`, before anything is built. Both publishes now pass
`--provenance`, consuming the `id-token: write` permission that was already granted for it.

**Coverage ratchet.** The gate named 37 files and reported 96.73% while the real
packages-wide number was 40.55% lines and `ui-native` was 0% across 447 lines and 198
functions. The include list is now every package's source and the floors sit just under the
measured 40.16 / 40.19 / 41.79 / 40.55, so an unrelated change cannot silently lower real
coverage. `apps/**` stays out of scope: they are demos with no suite, and including them drops
the floor to 21% for a number that says nothing about the shipped libraries. The known gaps are
written into the config next to the floors so the next person inherits the backlog.

**vue/svelte compile gate.** `source:compile` exited 0 while both frameworks failed with real
type errors, because `verified` listed only `react` and `native`. Three defects: a
`ref<VisibilityState>` initialised with a thunk, so the table received a callback where it
expected a visibility map; a status cell reading `variant` and `label` off an `unknown` value,
now narrowed to `Partial<BadgeTone>` exactly as the React renderer does; and `as never` casts
in the Svelte adapter that were never necessary because the engine helpers are already generic
over the row type, and which erased `T` into an `unknown` in the template. Both frameworks are
now in `verified` and can fail the gate.

## Deliberate deviations from the original plan

- **Exact pins were not applied to peer dependencies.** `ui-native` peers became `^3.3.0` and
  `^4.7.0`. An exact pin on a peer forces consumers to match it exactly and is a known
  anti-pattern. The defect was the unbounded `>=`, not the precision.
- **`--base` was not made optional on `change:scope`.** The author required it deliberately so
  an agent cannot guess a scope and verify the wrong surface. The real defect was that pnpm's
  `ELIFECYCLE` wrapper swallowed the message and left a bare exit 1, so the reason and two real
  invocations are now printed on stdout. The guard is untouched.
- **`source-distribution.yml` was left in place.** Now that the PR gate runs `source:smoke`
  and `source:compile` unconditionally, that workflow is redundant on paths it matches, but
  deleting a workflow is a human call and was not in scope.

## Evidence Ledger

Baseline, recorded before any edit, so every improvement below is attributable: `pnpm test`
passed end to end in 49s (9/9 sub-gates), 16 of 17 declared gates passed, and
`source:compile` exited **0** while vue and svelte did not compile. A read-only audit on
2026-09-27 established the three blind spots this task closes.

- 2026-09-27 — **Line endings.** Before: `git status` reported
  `M apps/docs/src/routeTree.gen.ts` and `M llms-full.txt` with an empty `git diff` and
  matching blob hashes. After `git add --renormalize .`: exactly one file changed
  (`.vscode/settings.json`, 25 insertions / 25 deletions, EOL only) and both phantom paths
  disappeared from `git status`. `git config core.autocrlf` = `true`, no `.gitattributes`
  existed.
- 2026-09-27 — **Router dedupe.** Before: `pnpm-lock.yaml` held both
  `@tanstack/react-router@1.170.32` (L2970) and `1.170.38` (L2977). After: a single
  `@tanstack/react-router@1.170.38` entry. `pnpm install` exit 0 in 1m 10.7s; `pnpm install
  --lockfile-only` exit 0, 1258 packages resolved.
- 2026-09-27 — **Measured coverage before the ratchet.** Curated list (37 files): 96.73% lines.
  All `packages/*/src`: **40.55%** lines. `packages/*` plus `apps/*`: 21.59% lines.
  `packages/ui-native` alone: **0.00%** across 447 lines and 198 functions. After the change:
  40.16% statements / 40.19% branches / 41.79% functions / 40.55% lines against floors
  40 / 39 / 41 / 40, 26 files and 439 tests passing, exit 0.
- 2026-09-27 — **Consumer compile, the load-bearing proof.** First run after adding vue and
  svelte to `verified`, and before rebuilding the registry: **FAIL**, exit 1, reporting the
  same four errors at the same line numbers — the gate now bites. That run also exposed a
  footgun: `cli add --all` generates from `dist/universal-cli/registry/registry.json`, last
  written 17:18, i.e. before the source edits, so a standalone `source:compile` compiles a
  stale snapshot. Added a staleness assertion to the script. After `pnpm source:build`
  (registry rebuilt 18:47:06): **PASS — 4 of 4**, `react: 66`, `vue: 12`, `svelte: 12`,
  `native: 46` generated modules compiled, exit 0.
- 2026-09-27 — **Gates re-run after the edits:** `lint`, `test:typecheck`,
  `foundation:typecheck`, `test:unit`, `foundation:test`, `agent:test`, `mcp:test`, and
  `docs:check` all PASS. `agent catalog-check` PASSES standalone (exit 0); an earlier FAIL(1)
  inside a batch loop was a race with the concurrent `source:compile` rewriting `dist/`, and
  is not reproducible in isolation.
- 2026-09-27 — **Workflow YAML.** All five edited or added files parse: `agent-workflow.yml`,
  `release.yml`, `nd-workflow.yml`, `source-distribution.yml`, `dependabot.yml`.
- 2026-09-27 — **Action pins are resolved, not invented.** Every SHA came from the GitHub API
  `refs/tags -> object` route. `pnpm/action-setup@v6` is an annotated tag and was dereferenced
  to commit `0977fd99` (its tag signature verified as `valid` by the API). No floating
  `uses: owner/action@vN` reference remains.

## Checkpoint

- Decisions: see above. Approved outcomes recorded before implementation; no feature or doc
  consumers changed beyond the surfaces named here.
- Known unfixed, surfaced by this increment:
  - `react-native-reanimated@4.7.0` and `react-native-worklets@0.13.0` declare a peer of
    `react-native@0.86 - 0.88` while the workspace holds `0.81.6`. This pre-existed the pin
    change; the bounded range made it visible. Downgrading a major of an animation library is a
    behavior change that cannot be verified without a device, so it is not done here.
  - `apps/browser-files-viewer` is a nested repo with its own lockfile and 26 tests that no
    script or workflow runs. Whether it is a workspace member, a submodule, or should move out
    of this repo is a human call.
  - The deep work deferred by the owner's "low-risk batch only" scope: a `ui-native` suite and
    a prop-parity test against `packages/ui`, runtime validation at the `tauri-api` invoke
    boundary, and the optimistic-write path in `packages/core/src/use-todos.ts` that reports a
    failed persist as a successful save.
- Status: implemented and verified on `chore/production-readiness`; not merged, not released.
