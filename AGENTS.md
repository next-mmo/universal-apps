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

- Discover capabilities: `pnpm agent find <query>`.
- Inspect one API: `pnpm agent inspect <id-or-symbol>`.
- Find a proven composition: `pnpm agent recipe [id]`.
- Verify work concisely: `pnpm agent check --changed`.
- Read `llms.txt` as the documentation map; retrieve only relevant pages.

## Package imports

- Do not add package-root `index.ts` re-export barrels unless technically necessary.
- Until stable subpath exports are introduced, import cross-package modules by their full file path, for example `@some/pkg/path/to/file`, to avoid package-root cycles.
