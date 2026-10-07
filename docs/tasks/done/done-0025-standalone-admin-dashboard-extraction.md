# Task: 0025 Standalone admin-dashboard source extraction

- Mode: shipped — merged to `main` via `feat/admin-standalone-extract`
- Risk / scope approval: Low (scoped addition: one build script, one root script entry, task
  records; no product code touched). User requested Option 2 in the project conversation on
  2026-10-07 ("sometimes they don't need the monorepo") and approved finishing the WIP.
- Owner / branch / write scope: agent / `feat/admin-standalone-extract` /
  `scripts/build-admin-standalone.mjs`, root `package.json`, this task record
- Goal: a one-command way to hand a team the admin dashboard as a standalone source project that
  runs and develops without the universal-apps monorepo.

## Context

`apps/admin-dashboard` is a self-contained SPA (no API calls, no env vars, no backend), but in the
monorepo it consumes `@package/ui`, `@package/pro`, and `@package/pro-core` through `workspace:*`
links. The repo already had a committed standalone-consumer precedent — `apps/browser-files-viewer`,
excluded from the workspace, vendoring sources under `src/lib/universal` with its own lockfile —
but no repeatable way to produce one for the dashboard. The packed source CLI
(`@next-mmo/universal-cli`, built by `pnpm source:build` into `dist/universal-cli`) already solves
component vendoring (transitive closure, import rewriting, dependency collection, css linking,
lockfile) and was the reuse-first foundation.

## Acceptance Criteria

- [x] `pnpm admin:standalone` produces `dist/admin-dashboard-standalone/` (plus zip) with zero
      `@package/*` runtime references and no monorepo path dependencies
- [x] The extraction passes `pnpm install --ignore-workspace`, `tsc --noEmit`, and `vite build`
      inside the extracted project with its own lockfile and node_modules
- [x] `universal doctor` on the extraction reports `ok: true` with no problems
- [x] `pnpm lint` stays at 0 errors; the new script file contributes 0 warnings
- [x] `pnpm workflow:check` returns to a single-wip board after this record closes

## What changed and why

**`scripts/build-admin-standalone.mjs` (new).** Ten-step pipeline: rebuild the source registry via
`buildDistribution()` from `scripts/build-source-registry.mjs`; copy the app (`index.html`,
`vite.config.ts`, `src/**`); write an inlined `tsconfig.json` (the app extends
`../../tsconfig.base.json`, which cannot exist standalone) and a `package.json` with workspace
dependencies stripped; resolve the app's 26 `@package/*` imports to registry items through the
package exports maps (most-specific item wins, so `ui/lib/*` helpers that ship inside larger items'
graphs are skipped until actually imported); run the real CLI (`init`, `add` with the resolved
items and `--no-install`); rewrite app imports to `@/lib/universal/*`; repoint the tokens CSS
import and the three Tailwind `@source` directives from monorepo package paths to the vendored
layout; write a consumer README; verify with an isolated install plus typecheck and build; emit a
best-effort zip via `tar` (relative paths only — GNU tar reads a leading `C:` as a remote host).

**Root `package.json`.** Added `admin:standalone` running the script. Nothing else changed.

**Deliberate choices.** Targeted item add (like the browser-files-viewer precedent) instead of
`--all`, so the extraction carries no unrelated catalogs or their dependencies. The registry
rebuild runs inside the script every time: the first session run vendored pre-migration
`pro-form.tsx` from the stale `dist/universal-cli` registry and failed typecheck against
`@tanstack/react-form` `2.0.0-alpha.2` with exactly the v1/v2 errors recorded in done-0023;
rebuilding the registry from current source is the fix, so it is not left as a manual prerequisite.

## Evidence Ledger

- 2026-10-07 — **Stale registry caught.** First extraction failed `tsc` in the vendored
  `pro-form.tsx` (`onChange does not exist in type 'readonly FieldValidator<...>[]'`, `Property
  'state' does not exist on type 'ReactFieldApi<...>'`); installed react-form was the correct
  `2.0.0-alpha.2` while `dist/universal-cli` still carried pre-migration source.
  `pnpm source:build` (145 items, 135 public entries, `runtimeDependencies: 0`) fixed it.
- 2026-10-07 — **Promoted script end-to-end.** `pnpm admin:standalone`: registry rebuild, 26
  imports resolved to registry items, CLI `add` wrote the vendored graph, isolated `pnpm install
  --ignore-workspace` (own lockfile), `tsc --noEmit && vite build` pass (696 kB JS / 212 kB gzip),
  zip emitted (460 KiB, node_modules and build output excluded).
- 2026-10-07 — **Doctor.** `node dist/universal-cli/cli.mjs doctor` on the extraction:
  `{"ok":true,"problems":[]}`.
- 2026-10-07 — **Lint.** `pnpm lint`: 0 errors (796 advisory warnings on 518 files, in line with
  the documented baseline; the new script alone contributes 0 warnings, 0 errors).
- 2026-10-07 — **Workflow check.** `pnpm workflow:check` first FAILED with "expected at most one
  in-progress wip task, found 2" (this task's draft plus `wip-0022`); resolved by closing this
  verified increment into `done/`, re-run PASS with `wip-0022` remaining as the single active task.

## Checkpoint

- Decisions: reuse the source CLI instead of hand-rolled copying; registry rebuild on every run
  (correctness over ~seconds of runtime); verification inside the extraction is part of the script,
  not a separate manual step.
- Affected docs: this record; the generated consumer README inside each extraction.
- Known risks carried forward: the extraction is a fork by design — monorepo component updates do
  not propagate automatically (`universal diff`/lockfile cover vendored items only); the zip step
  is best-effort and skipped with a warning where `tar` is unavailable; Google Fonts (Inter) is a
  runtime network dependency of the app shell.
- Status: shipped. Merged to `main` 2026-10-07. Release/publishing remains a maintainer action.
