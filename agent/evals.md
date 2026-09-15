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
- Output tokens reported by the agent host; report unavailable counters as unavailable
- Shell/tool calls
- Repository files opened before the first edit
- Repeated reads of unchanged material, with reasons when freshness was required
- Attempts before the first successful verification
- Elapsed time to a green check

## Workflow guidance comparison

Compare baseline and revised guidance on the same starting product commit, exact prompt, acceptance criteria, model/settings, tools, and permissions. Use separate fresh sessions and isolated checkouts; vary only the guidance. Record the model, guidance revisions, cache usage when exposed, run count, and failures. Compare medians across repeated runs without discarding unsuccessful attempts.

| Scenario | Acceptance gate |
| --- | --- |
| Existing-component reuse | Compose a requested page from cataloged components; preserve shared tokens, accessibility, and platform contracts; pass the relevant consumer check. |
| Small defect fix | Reproduce a specific defect, apply a bounded fix, and verify its regression without unrelated cleanup. |
| Security-sensitive change | Exercise allowed and denied behavior at the affected trust boundary; preserve validation, authorization, and required human approvals. |

Select and freeze each concrete defect or feature and its acceptance checks before either run. Compare token/call savings only alongside task completion, first-pass verification, and retained requirements; an incomplete or unsafe result is not a saving. Do not execute destructive or external scenarios without their required authorization.

Measure standing instructions and skill entry points separately using normalized LF text length divided by four, rounded up per file. Report heuristic text size separately from host token usage, output size, and task cost. Instruction shrinkage or fewer generated lines does not establish behavioral token savings; those require agent runs. Keep results in the owning task evidence rather than claiming an unmeasured percentage.

Deterministic release gates are checked by `pnpm agent budget --check`. The React CRUD proof baseline was 108 nonblank lines / about 835 estimated tokens; the gate is 43 lines / 334 tokens.

Targets after the token-first rollout:

- At least 60% fewer discovery calls and retrieved-text tokens
- No more than two files opened before editing a cataloged component
- First-pass compilation for all complete recipes
- One verification command selected without searching package scripts

## Tooling measurements

- ND `context locate` (nd-doc-lookup) vs plain keyword search, 2026-09-15: ~5.2× fewer retrieved bytes (bounded ≤5 ranked routes vs 77–192 raw matches per query) at ~0.9 s/call versus millisecond-scale raw scan. Method, numbers, and limits: [docs/evidence/locate-vs-search-benchmark.md](../docs/evidence/locate-vs-search-benchmark.md).
- Coding round, ND flow vs baseline (Alert component, 2026-09-15, n=1): −20% calls, −42% files opened, −37% transcript bytes at equal outcome. Method and limits: [docs/evidence/coding-round-alert-nd-vs-baseline.md](../docs/evidence/coding-round-alert-nd-vs-baseline.md).
