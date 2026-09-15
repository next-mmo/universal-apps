# Harden-full-nd examples — minimal, parent-referenced tier

These three projects demonstrate the **minimal ND adoption shape**: a small,
single-module codebase that carries its own project facts
(`.agents/docs/PROJECT.md`, `ARCHITECTURE.md`, `WORKFLOW.md`) and task evidence
(`docs/tasks/done/`) but does **not** vendor its own copy of `.agents/skills/`,
`.agents/templates/`, or `skill-selection.json`.

Instead, each project's `AGENTS.md` points its parent-policy reference at the
ND package's canonical workflow (`../../../.agents/docs/WORKFLOW.md`), so the
workflow and skills are resolved from the surrounding ND installation rather
than duplicated per project.

| Project | Language | Subject |
|---|---|---|
| `js-md-links` | Node.js | Markdown link checker |
| `py-expense-cli` | Python | Expense-tracker CLI |
| `py-logstat` | Python | Streaming log analyzer |

This is a different, deliberately lighter tier than the two
`full-stack-*` examples, which vendor a complete `.agents/skills/` +
`.agents/templates/` + `skill-selection.json` install and are fully
self-contained.
