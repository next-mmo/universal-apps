# Agent contract

These rules are mandatory unless the user explicitly overrides them.

## Priorities

Resolve conflicts: safety and workspace boundaries; approved plan; business value; correctness and maintainability; efficiency.

## Before writing

- Present an implementation plan, tasks, and key assumptions before changing code, files, dependencies, or generated artifacts. Wait for explicit approval.
- Clarify objectives that materially change the solution before presenting the plan.
- Follow the approved plan. Pause for renewed approval if findings require a material change.

## Workspace and permissions

- Write only inside this project workspace. Never change system files, OS settings, shell profiles, or external files.
- Never run commands modifying outside the workspace.
- Request escalation if a necessary command is blocked by permissions; do not invent unapproved workarounds.

## Engineering judgment

- Surface flawed premises, material risks, assumptions, and trade-offs.
- Favor clear, maintainable solutions and required checks; avoid speculative complexity. Use reuse-first delivery.

## Agent fast paths

- Discover capabilities: `pnpm agent find <query> --framework <name>`.
- Inspect API: `pnpm agent inspect <id-or-symbol> --framework <name>`; add `--detail api` for contract.
- Composition recipes: `pnpm agent recipe <id> --framework <name>`.
- Verify concisely: `pnpm agent check --changed`; use `--base <verified-ref>` for branch changes, `--plan` for coverage.
- Application foundation: consult [application foundation](agent/app-foundation.md) when relevant; reuse router-neutral layout and tasks.
- Read `llms.txt` as documentation map; retrieve only relevant pages.
- Request `--full` or `--example` only when compact response is insufficient.

## Package imports

- Do not add package-root `index.ts` re-export barrels unless technically necessary.
- Use declared stable subpath exports such as `@package/ui/button` and `@package/pro/crud`.
- Legacy `@package/*/src/*` imports remain compatibility-only; do not introduce new ones.

## ND Workflow

- Humans own outcomes, priority, acceptance, policy, release, and external/destructive actions; agents never self-approve.
- Follow ND risk tiers: Low (scoped edit + check), Medium (task + checks), High (plan + proof + recovery), Critical (auth/security/data; positive/negative proof + signoff).
- Start non-trivial work with `pnpm nd task "<desc>"` or `pnpm nd context locate "<topic>"`. Keep one active task under `docs/tasks/`.
- Keep tool-facing contract docs under `.agents/docs/`, canonical skills under `.agents/skills/`, and PRDs, tasks, and evidence under `docs/`.
- Follow [delivery](.agents/docs/WORKFLOW.md), [project facts](.agents/docs/PROJECT.md), [architecture](.agents/docs/ARCHITECTURE.md), and [checks](docs/development.md).
- `packages/nd-workflow` is a retained monorepo package; root instructions and `.agents/skills/` govern monorepo delivery.
