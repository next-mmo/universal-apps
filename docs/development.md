# Development and Workflow Setup

## Prerequisites

- Node.js compatible with the workspace toolchain
- pnpm 10
- Git
- Rust and Tauri prerequisites when changing or running the native shell

Use the committed `pnpm-lock.yaml`; install with `pnpm install --frozen-lockfile`.

## Setup modes

In an agent session, run the baseline checks below before starting. Skill adapters are generated and validated with `bash .agents/scripts/skill.sh init` and `check` (see below).

Required baseline:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm build
pnpm workflow:check --strict-budget
pnpm docs:check
bash .agents/scripts/skill.sh check
```

Full repository-local setup adds:

```bash
bash .agents/scripts/skill.sh init all
bash .agents/scripts/skill.sh check all
```

Run the shell commands from Git Bash on Windows.

## Run the product

```bash
pnpm dev:web
pnpm tauri dev
```

The first command runs the browser boundary; the second requires a working Rust/Tauri platform toolchain.

## Context and lookup

Retrieve bounded context and document routes through ND:

```bash
pnpm nd context locate "<topic>"
pnpm nd task "<desc>"
```

Current code, tasks, PRDs, tests, and human decisions remain authoritative in their respective roles.

## Scope and verification

Verify the live PR base or stack parent; never infer it from a branch name:

```bash
pnpm change:scope --base <verified-ref>
```

ND Workflow artifacts belong under `.agents/docs/`. Existing application documentation remains under `apps/tauri-app/content/docs/`.
