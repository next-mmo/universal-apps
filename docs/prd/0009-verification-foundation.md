---
id: "0009"
title: "Verification foundation and enforced quality gates"
status: in-progress
last-audit: 2026-09-20
---

# Change Proposal: Verification foundation and enforced quality gates

## Problem and scope

- **User / problem / desired outcome:**
  The product packages carried no behavioral verification while the governance apparatus around them
  grew. Measured before this change: 12 test files existed in the whole repository and none covered
  `packages/ui`, `pro`, `pro-vue`, `pro-svelte`, `ui-native`, or `tauri-api`; roughly 9,800 lines of
  component and data-layer source had no test execution. The gates that did exist could not fail:
  `pnpm lint` reported 596 warnings and zero errors and was absent from every workflow, so an oxlint
  correctness defect could not break a build. Coverage was unmeasured. A corrupted task record
  (`done-0014`, 7,253 NUL bytes) was committed to `main` undetected. `release.yml` ran less
  verification than pull-request CI and reported success while publishing nothing when `NPM_TOKEN`
  was unset. The desired outcome is that a defect in shipped source fails a gate, and that a green
  run means the checks ran.
- **In scope:**
  - **VF-01: Behavioral tests for unverified packages.** Introduce a unit test runner with DOM
    support and add behavioral tests for the framework-neutral core and pro-core contracts and for
    the components whose behavior changed under this PRD.
  - **VF-02: Correctness lint as a blocking gate.** Correctness-category diagnostics are errors, the
    existing 40 are resolved, and `pnpm lint` runs as an explicit step in pull-request and release CI.
  - **VF-03: Enforced coverage floor.** Coverage is measured over an explicit file list and a
    threshold fails the run; the floor only ratchets upward.
  - **VF-04: Executable invariants.** Documented contracts that were previously prose-only gain
    executable checks: latest-invocation-wins and cancellation for async tasks, unique todo ids,
    column read/filter/sort/page behavior, every DataProvider backend, and RBAC fail-closed default.
  - **VF-05: Gates fail loudly.** A missing release credential fails the release instead of printing
    a skip; a threshold breach fails the run with a non-zero exit.
  - **VF-06: Corrupt governance documents are detected.** A guarded Markdown file that is empty or
    contains NUL bytes fails `pnpm docs:check`.
  - **VF-07: The board can represent work while a task is blocked.** A `blocked-*` record no longer
    consumes the single in-progress slot.
- **Non-goals:**
  - Behavioral tests for the remaining component surface (`packages/ui` beyond the two files named
    below, `packages/pro` beyond `access`, `packages/ui-native`, `pro-vue`, `pro-svelte`, and the
    applications). Their coverage remains unmeasured and is listed as carried-forward work.
  - Accessibility remediation for the findings the newly enabled `jsx-a11y` rules report as advisory.
  - The Vue data-table client-mode defect recorded in PRD 0006's scope.
  - Any release, publication, or deployment.
- **Selected requirements / open questions (clarification is not approval):**
  - The test runner is Vitest with V8 coverage, chosen because the workspace already ships Vite and
    the runner needs no separate transpiler configuration for TSX.
  - Open question 1: whether the coverage floor should expand to the whole `packages/*/src` tree in
    one step or package by package. This PRD assumes package by package.
  - Open question 2: whether the advisory `jsx-a11y` findings become blocking before or after the
    Vue/Svelte parity decision in PRD 0006.

## Approval record

- **Scope approval:** approved.
- **Approver / decision date:** user / 2026-09-20.
- **Exact approved requirement IDs, exclusions and document revision or content hash:** VF-01–VF-07
  including the non-goals above.
- **Approval evidence:** the user reviewed a written findings report that ended by recommending
  "Stage 0 plus the Vitest scaffolding in Stage 1" as the first increment, and replied "build it now".
- **Execution authorization:** authorized to implement VF-01–VF-07 inside the repository. No
  release, publication, deployment, or external action is authorized.
- **Scope changes since approval / renewed decision needed:** one requirement was added during
  implementation and needs owner acknowledgement — **VF-08: the test suite is type-checked.** The new
  test files were reachable by no tsconfig, so a type error in a test (for example calling the
  optional `deleteMany` without narrowing) would have been silently transpiled away by the test
  runner. Two such errors were found and fixed when the check was added. This is additive, does not
  weaken any approved requirement, and is recorded here rather than folded silently into VF-01.

## Canonical targets and baseline

- **Current feature/API/spec document(s), exact sections and stable requirement IDs:**
  `docs/development.md` (check matrix), `.agents/docs/ARCHITECTURE.md` "Verification boundaries",
  `docs/prd/0006-competitive-parity-and-expansion.md` (the parity claims these gates do not yet
  verify), and `CONTEXT.md` "Observation evidence".
- **Source baseline revision or file-state reference:** `d1242ed` plus the working-tree state
  described in `docs/tasks/wip-0015-verification-foundation.md`.
- **New capability:** no behavioral-test harness, coverage gate, or blocking lint gate existed at the
  baseline.
- **Integration owner / related concurrent changes:** `blocked-0006` holds the benchmark harness and
  remains blocked on a human decision; it is not part of this increment.

## Requirement changes

### ADDED

**VF-01 — Behavioral tests for unverified packages.** Given the core and pro-core contracts, when a
documented behavior changes, then at least one test fails. Tests live under
`packages/{core,pro-core,ui,pro}/test/` and are collected only by the new runner.
Scenario: `pnpm test:unit` reports 128 passing tests across 11 files at the time of writing.

**VF-02 — Correctness lint is blocking.** Given the lint configuration, when a correctness-category
diagnostic exists, then `pnpm lint` exits non-zero and CI fails. The pre-existing 40 diagnostics are
resolved rather than suppressed; `@agent-quickstart` is declared as a real tag because the
source-distribution scanner depends on it.
Scenario: `pnpm lint` exits 0 with 0 errors, and reverting any resolved defect re-introduces a
failure.

**VF-03 — Coverage floor.** Given a coverage run, when statements, branches, functions, or lines
fall below the configured floor, then the run exits non-zero. The measured files are listed
explicitly so an untested module in scope reports 0% instead of vanishing. The file set only widens,
and each widening carries a raise of the floors with it.
Scenario: an impossible threshold fails the run with
`Coverage for statements (...) does not meet global threshold (...)` and exit code 1. At the time of
writing the measured set is 34 files at 94.37% statements / 88.49% branches / 94.24% functions /
96.60% lines, with floors of 94 / 87 / 93 / 96.

**VF-04 — Executable invariants.** Given the contracts listed in scope, when any of them regresses,
then a named test fails. Each fix made under this PRD ships with a test that fails on the previous
implementation.

**VF-05 — Gates fail loudly.** Given a release tag or a non-dry-run dispatch, when `NPM_TOKEN` is
absent, then the publish step fails with an explanatory error instead of exiting 0.
Scenario: the release workflow's publish steps exit 1 when the token is empty.

**VF-06 — Corrupt governance documents are detected.** Given a guarded Markdown file, when it
contains NUL bytes or is empty, then `pnpm docs:check` fails naming the file.
Scenario: a 256-byte NUL fixture under `docs/` produces
`contains NUL bytes; the file is corrupt and its content is unrecoverable`.

**VF-07 — Blocked work does not consume the in-progress slot.** Given one `blocked-*` record, when a
new `wip-*` record is opened, then `pnpm workflow:check` passes and attributes product changes to the
`wip-*` record. Several `blocked-*` records with no `wip-*` remain ambiguous and are reported.
Scenario: `blocked-0006` and `wip-0015` coexist and `pnpm workflow:check --strict-budget` passes.

**VF-08 — The test suite is type-checked.** Given the test files under `packages/*/test/`, when a test
contains a type error, then `pnpm test:typecheck` exits non-zero. Added during implementation; see the
approval record.
Scenario: `tsc -p tsconfig.vitest.json` exits 0, and an un-narrowed call to the optional `deleteMany`
fails it.

### MODIFIED

**`docs/development.md` and the check matrix** — the documented verification surface gains
`pnpm test:unit`, `pnpm test:coverage`, and the blocking lint gate; the coverage floor is recorded
there so a contributor knows what must not regress.

### REMOVED

**`packages/utils`** — a manifest-only placeholder with no source, no exports, and no consumer. Its
removal drops the source registry from nine runtime packages to eight; the two places that asserted
nine were updated with it.

## Design impact and decisions

- **Components, data ownership, contracts, and trust boundaries touched:** the core todo id sequence
  (now monotonic and reservable across sessions), the `DataProvider` copy semantics for `getList`,
  the RBAC default in `useAccessContext` (now fail-closed), `ToggleGroup`/`Accordion` context
  memoization, and the release workflow's permissions and publish conditions.
- **Selected approach / rejected alternatives / consequences:** a real runner with a coverage floor
  was selected over extending the existing `node:test` scripts, because those scripts cannot render
  components and the untested surface is mostly components and hooks. Untyped `vi.fn()` was rejected
  in favour of typed mocks so a mock's contract is stated where it is declared. Advisory `jsx-a11y`
  rules were kept advisory rather than blocking, because each needs a browser-verified fix.
- **Link significant decision record only when warranted:** not warranted.

## Acceptance and delivery

- [ ] `pnpm lint` exits 0 with zero correctness errors and is an explicit CI step in both the
      pull-request and release workflows. — verified
- [ ] `pnpm test:coverage` passes its thresholds and fails when a threshold is raised. — verified
- [ ] Every defect fixed under VF-04 has a test that fails on the previous implementation. — verified
      for the ToggleGroup stale-handler regression; the remainder are covered by new assertions.
- [ ] `pnpm docs:check` fails on a NUL-byte Markdown file. — verified
- [ ] `blocked-0006` and `wip-0015` coexist with `pnpm workflow:check --strict-budget` passing. — verified
- [ ] `pnpm test` and `pnpm agent check --all` pass. — verified
- Risk / required approvals / rollback constraints: the coverage floor is the only gate that can
  block unrelated work; it is set below the achieved figure and must only be raised. Rollback is
  reverting this increment; no migration or persisted state is involved.
- Current-doc reconciliation plan: `docs/development.md` gains the new commands and the floor;
  `.agents/docs/ARCHITECTURE.md` records the blocked-slot rule; `.agents/docs/PROJECT.md` records the
  `packages/utils` removal and the corrected documentation split.
- Implementation, integration, and deployment gates: implementation and integration are in scope;
  deployment is not applicable and explicitly out of scope.
