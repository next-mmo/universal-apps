# Agent contract

These rules are mandatory unless the user explicitly overrides them.

## Priorities

Resolve conflicts in this order: safety and workspace boundaries; the approved plan; business value; correctness and maintainability; efficiency.

## Before writing

- Before changing code, files, dependencies, or generated artifacts, present an implementation plan, tasks, and key assumptions or concerns. Wait for explicit approval.
- Clarify objectives that materially change the solution before presenting the plan.
- Follow the approved plan. Pause for renewed approval if findings require a material change.

## Workspace and permissions

- Write only inside this project workspace. Never change system files, OS settings, shell profiles, or files outside it. Read external files only when necessary.
- Never run a command that could modify outside the workspace.
- If a necessary in-scope command is blocked by sandbox permissions, immediately request the required escalation. Do not invent a workaround unless escalation is refused.

## Engineering judgment

- Surface flawed premises, material risks, assumptions, and trade-offs.
- Favor clear, correct, maintainable solutions and required checks; avoid speculative complexity. Use [reuse-first delivery](.agents/skills/agent-workflow-scrum/references/delivery.md).

## Agent fast paths

- Discover capabilities: `pnpm agent find <query> --framework <name>`.
- Inspect one API: `pnpm agent inspect <id-or-symbol> --framework <name>`; add `--detail api` for its public contract.
- Find a proven composition: `pnpm agent recipe <id> --framework <name>`.
- Verify work concisely: `pnpm agent check --changed`; use `--base <verified-ref>` for committed branch changes and `--plan` to inspect coverage.
- For non-CRUD composition, consult [application foundation](agent/app-foundation.md) only when relevant; reuse router-neutral layout and task lifecycles.
- Read `llms.txt` as the documentation map; retrieve only relevant pages.
- Request `--full` or `--example` only when the compact response is insufficient.

## Package imports

- Do not add package-root `index.ts` re-export barrels unless technically necessary.
- Use declared stable subpath exports such as `@package/ui/button` and `@package/pro/crud`.
- Legacy `@package/*/src/*` imports remain compatibility-only; do not introduce new ones.

## Agent Workflow Scrum

- Humans own outcomes, priority, acceptance, policy, release, and external or destructive authorization; agents never self-approve.
- Start non-trivial work with `pnpm context "<scope>"`. Keep one active task and synchronize product changes with its PRD, tests, and evidence.
- Keep workflow artifacts under `.agents/docs/` and canonical skills under `.agents/skills/`. Graphify and OpenViking remain optional; OpenViking is explicit-only.
- Follow [delivery](.agents/docs/agent-workflow.md), [architecture](.agents/docs/architecture.md), and [development checks](.agents/docs/development.md).
