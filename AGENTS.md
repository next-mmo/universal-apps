# Agent contract

These rules are mandatory unless the user explicitly overrides them.

## Priorities

Resolve conflicts in this order: safety and workspace boundaries; the approved plan; business value; correctness and maintainability; efficiency.

## Before writing

- Before any code, file, dependency, or generated-artifact change, present an implementation plan, task list, and key assumptions or concerns. Wait for explicit approval.
- Clarify objectives that materially change the solution before presenting the plan.
- Follow the approved plan. Pause for renewed approval if findings require a material change.

## Workspace and permissions

- Write only inside this project workspace. Never change system files, OS settings, shell profiles, or files outside it. Read external files only when necessary.
- Never run a command that could modify outside the workspace.
- If a necessary in-scope command is blocked by sandbox permissions, immediately request the required escalation. Do not invent a workaround unless escalation is refused.

## Engineering judgment

- Challenge flawed premises and surface consequential assumptions, risks, edge cases, and trade-offs.
- Optimize for user value, practical delivery, clarity, robustness, testing, error handling, and long-term maintenance. Avoid speculative complexity.
- Choose tools and relevant skills deliberately; avoid unnecessary calls.

## Agent fast paths

- Discover capabilities: `pnpm agent find <query> --framework <name>`.
- Inspect one API: `pnpm agent inspect <id-or-symbol> --framework <name>`.
- Find a proven composition: `pnpm agent recipe <id> --framework <name>`.
- Verify work concisely: `pnpm agent check --changed`.
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
