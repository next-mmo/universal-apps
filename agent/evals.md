# Agent-efficiency baseline

Use these tasks to compare repository guidance or tooling changes. Start each task in a clean checkout and record the measurements before giving the agent any extra hints.

| Task | Success condition |
| --- | --- |
| Add an alert component | Uses the repository scaffold, adds dependencies/docs, and passes changed-scope checks. |
| Build a React CRUD page | Reuses the table, form dialog, shared schema, and query-key contracts; compiles first try. |
| Port a list view to Vue | Selects the Vue adapter without reading React internals; the Vue playground builds. |
| Add universal platform storage | Keeps raw Tauri calls in `tauri-api`, provides a browser fallback, and builds the React app. |
| Add a native control | Uses shared tokens and native primitives; the native playground builds. |

For each run, record:

- Input tokens reported by the agent host
- Shell/tool calls
- Repository files opened before the first edit
- Attempts before the first successful verification
- Elapsed time to a green check

Targets after the agent tooling rollout:

- At least 50% fewer discovery calls and retrieved-text tokens
- No more than two files opened before editing a cataloged component
- First-pass compilation for all complete recipes
- One verification command selected without searching package scripts
