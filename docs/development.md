# Development and Workflow Setup

## Prerequisites

- Node.js compatible with the workspace toolchain
- pnpm 10
- Git
- Rust and Tauri prerequisites only when working on a separate native app

Use the committed `pnpm-lock.yaml`; install with `pnpm install --frozen-lockfile`.

## Setup modes

In an agent session, run the baseline checks below before starting. Skill adapters are generated and validated with `bash .agents/scripts/skill.sh init` and `check` (see below).

Required baseline:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test:coverage
pnpm test
pnpm build
pnpm workflow:check --strict-budget
pnpm docs:check
bash .agents/scripts/skill.sh check
```

`pnpm lint` and `pnpm test:coverage` are gates, not reports. Lint correctness diagnostics are errors,
so `oxlint` exits non-zero on a defect; the `perf` and `jsx-a11y` rules stay advisory and are printed
on every run. `test:coverage` fails the run when coverage drops below the floors in
`vitest.config.ts` (statements 94, branches 87, functions 93, lines 96). Raise a floor when coverage
improves; never lower one to land a change. The measured file list in that config is explicit, so a
module in scope with no tests reports 0% rather than disappearing from the report; modules still
outside that list are named in a comment there and are not yet measured.

`pnpm test:unit` runs the same suite without coverage when you only want the fast signal.

The source distribution has its own pair of checks. `pnpm source:smoke` proves the packed CLI
generates the right files; `pnpm source:compile` proves a generated consumer then installs and
compiles, one framework at a time, with a probe import so the bundler reaches generated code. It
prints every framework on every run. Only the frameworks named in the `verified` list in
`scripts/check-source-compilation.mjs` can fail it; a framework outside that list is reported as
UNVERIFIED and is not evidence that it works. Add a framework to that list once it compiles, and
never remove one to land a change. Both are slower than the unit suite because they install real
dependencies, so run them when a change touches `packages/**` or the source CLI.

Full repository-local setup adds:

```bash
bash .agents/scripts/skill.sh init all
bash .agents/scripts/skill.sh check all
```

Run the shell commands from Git Bash on Windows.

## Run the product

```bash
pnpm dev
```

This starts the browser-first Kitchen and documentation app. Framework previews build as separate same-origin bundles and load after selection. There is no Tauri desktop app in this repository; a future one will be its own project with its own development command.

## Context and lookup

Retrieve bounded context and document routes through ND:

```bash
pnpm nd context locate "<topic>"
pnpm nd task "<desc>"
```

Current code, tasks, PRDs, tests, and human decisions remain authoritative in their respective roles.

## Branching and landing

`main` is the landing branch. Branch per change so review and rollback stay bounded:

```bash
git switch -c feat/<slug>   # fix/<slug>, docs/<slug>, chore/<slug>
```

Trivial scoped edits — prose corrections and single-file fixes with no behavior change — may land
directly on `main`.

Land a branch by merging it into `main`. Commit subjects use `type(scope): summary`; no hook
enforces the prefix, so it holds only when followed by hand. Do not rewrite published history.

## Scope and verification

Verify the live PR base or stack parent; never infer it from a branch name:

```bash
pnpm change:scope --base <verified-ref>
```

ND Workflow artifacts belong under `.agents/docs/`. Application documentation is under `apps/docs/content/docs/`.
