# Token-efficient application foundation: implementation evidence

Date: 2026-09-14
Base: 45462c4185c0729069019b741545187105793de4
Branch: feat/token-efficient-app-foundation
Status: implementation complete for the scoped foundation; full workspace and human acceptance pending.

## Authorized scope

The owner requested implementation on a new branch after reviewing token-saving
improvements for all application types, not only CRUD. This increment implements
shared discovery/verification infrastructure, router-neutral layout, cancellable
headless tasks, and focused theme corrections. No main-branch merge or release is
authorized or performed.

## Acceptance and evidence

| Requirement | Evidence | Result |
| --- | --- | --- |
| Named/default/type imports use source declarations | Source-contract unit tests, including stale export rejection | Focused tests passed |
| Framework-neutral capabilities remain discoverable | Framework/runtime compatibility and wrong-framework symbol tests | Focused tests passed |
| No React usage is silently returned for native components | Native usage and missing-documentation regressions | Focused tests passed |
| Long-lived discovery sees updated metadata | Manifest/source revision regression | Focused tests passed |
| New/nested projects and dependent consumers receive checks | Workspace planner and package-manager inventory regressions | Focused tests passed |
| Spawn failures/timeouts cannot become green checks | Real subprocess timeout and missing-command regressions | Focused tests passed |
| Non-CRUD async lifecycle handles cancellation and stale completion | Sync/async error, subscription, cancellation, latest-wins, reset tests | Focused tests passed |
| Actual MCP process uses shared contracts | Stdio handshake/tools/usage/errors/stdin-close integration | Focused test passed |
| Router-neutral layout and token-based controls build on every platform | React/native consumer builds and visual checks | Not run locally |

The focused local run reported 27 tests, 27 passed, zero failures. It used Node
22.16.0 with --experimental-strip-types and TypeScript 5.8.3. A separate strict
TypeScript check of the shared catalog/checker, async task, unit tests, and MCP
source passed. This was not the full root `pnpm test` or all consumer builds.

## Local commands executed

```sh
node --experimental-strip-types --test packages/agent-workflow/test/foundation.test.ts packages/mcp/test/foundation.integration.ts
tsc -p tsconfig.foundation.local.json --lib ES2022
```

The temporary TypeScript config selected the focused files, with strict,
noUnusedLocals/noUnusedParameters, moduleResolution bundler, noEmit, and Node
types. It is not a shipped project configuration. The repository uses its existing
agent-workflow tsconfig through `pnpm foundation:typecheck`.

## Required review gates

Run the version-locked workspace install, `pnpm test`, lint, relevant consumer
builds, and visual/keyboard checks for the layout and radius changes. Run the
explicit base-range verification plan rather than treating a clean working tree
as a branch check. Existing GitHub Actions calls the expanded root test script.

Local cloning/dependency installation was unavailable in the execution environment.
Therefore full catalog validation against every upstream source, the original
CLI/MCP suites, real pnpm workspace inventory, web/native production builds,
Windows execution, and Rust/Tauri packaging remain unverified here. Source tree
changes were delivered through the authenticated GitHub connection.

## Limits

No provider-reported token savings were measured. Source/response budgets are not
billing evidence. Dedicated minimal examples for every adapter, complete generated
token parity, optional chat/editor/media packages, and deterministic application
code generators remain separate increments. The existing CRUD-specific error and
server-query extension findings are not represented as fixed by this non-CRUD
foundation change. Human acceptance and release approval remain pending.
