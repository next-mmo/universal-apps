# Agent Instructions — js-md-links (ND Workflow example)

## Identity

- System: `check-links.mjs`, a deterministic Markdown relative-link checker, kept as the hardened ND Workflow example project.
- Stack: Node.js v24, ESM, built-in modules only (`node:fs/promises`, `node:path`, `node:url`, `node:process`). No dependencies, no `package.json`, no network access.
- Scope: one CLI plus `test/check-links.test.mjs`. Nothing else ships.

## Risk tiers

- Low: report wording, docs, comments. Edit, then run `node --test`.
- Medium: link parsing, slug rules, walk order, exit codes. Adjust a test in the same change.
- High: path policy (`classifyTarget`, `isInsideRoot`, target access), size cap, unreadable-file handling. Preserve the "never touch targets outside the root" property and prove it with the injected-`fs` spy tests.

## Verification commands

- `node --test` — full suite, run from this directory.
- `node check-links.mjs <dir>` — CLI smoke; expect exit 0 clean, 1 problems, 2 usage error.
- `node check-links.mjs .` — self-check; this project's own docs must stay clean.

## Scope limits

- Do not add dependencies, config files, CI pipelines, or network calls.
- Tests must create and write only inside `mkdtemp` temp roots.
- Never weaken a hardening rule to make a fixture pass; fix the fixture.

## Workflow

Adopts ND Workflow risk tiers, checkpoints, and converge-check. See [WORKFLOW.md](.agents/docs/WORKFLOW.md) and the task record in [docs/tasks/done/done-0001-js-md-links.md](docs/tasks/done/done-0001-js-md-links.md).
