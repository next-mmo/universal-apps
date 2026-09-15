# Development and Workflow Setup

## Prerequisites

- Node.js compatible with the workspace toolchain
- pnpm 10
- Git
- Rust and Tauri prerequisites when changing or running the native shell

Use the committed `pnpm-lock.yaml`; install with `pnpm install --frozen-lockfile`.

## Setup modes

In an agent session, `/kb:setup` verifies Node.js, pnpm, Git, locked dependencies, and required checks. `/kb:full-setup` additionally generates and validates Claude/Cursor adapters. Neither mode installs Graphify, OpenViking, remote services, Rust, or platform SDKs.

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

## Smart context

```bash
pnpm context "change table sorting"
pnpm context "change table sorting" --level 1
pnpm context "review table sorting" --base origin/main --level 1
```

Default L0 output is approximately 1,500 heuristic tokens. Current code, tasks, PRDs, tests, and human decisions remain authoritative in their respective roles.

Graphify can be selected when a current local graph exists. OpenViking is read-only, explicit-only, and optional:

```bash
pnpm context "component impact" --provider graphify --level 1
pnpm context "prior architecture decision" --provider openviking
```

## Scope and verification

Verify the live PR base or stack parent; never infer it from a branch name:

```bash
pnpm change:scope --base <verified-ref>
pnpm verify:plan --base <verified-ref>
```

Use `pnpm workflow:report` for an ignored local HTML/JSON snapshot.

ND Workflow artifacts belong under `.agents/docs/`. Existing application documentation remains under `apps/tauri-app/content/docs/`.
