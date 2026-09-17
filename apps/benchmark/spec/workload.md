# Matched workload — agent-token round

> Status: round protocol · Applies byte-identically to all three arms
> Related: [PRD 0004](../../../docs/prd/0004-agent-token-benchmark.md) · [protocol](protocol.md) · [round README](../README.md)

## Deliverable

One React todo administration UI per arm, written into that arm's own directory. The shared
behavior layer is already installed and is identical across arms; only the UI composition differs.

## Requirements

Each arm implements the same ten requirements. Wording is identical in every arm brief.

| ID | Requirement |
| :-- | :-- |
| R1 | Create a task. Text input plus a submit control, calling `add` from `useBenchmarkTodos()`. Empty or whitespace-only text must be rejected through `validateTodoText` and the returned message displayed. |
| R2 | Edit an existing task's text through `update`. The same validation rule applies. |
| R3 | Toggle a task's done state through `toggle`. |
| R4 | Delete a task through `remove`. |
| R5 | Clear completed tasks through `clearDone`. |
| R6 | Search and filter. A search input (case-insensitive substring on task text) and All / Active / Done controls. Visible rows must come from `selectTodos(todos, filter, search)`. |
| R7 | Loading state. While `ready` is false, render a loading indication carrying `aria-busy`. |
| R8 | Error state. When `error` is set, render it in a `role="alert"` region together with a control that calls `clearError`. |
| R9 | Empty state. When there are no visible rows, render an empty-state message. |
| R10 | Persistence goes only through `useBenchmarkTodos()`. No second store, no direct `localStorage`, `fetch`, or `getTodoStore()` call. |

## Frame every arm starts from

Already present in all three arm directories and identical in behaviour:

- `src/domain.ts` — `Todo`, `validateTodoText`, `selectTodos`
- `src/domain.test.ts` — four deterministic domain assertions
- `src/model.ts` — `useBenchmarkTodos()` plus re-exports
- `src/main.tsx` — imports `./styles.css` and `{ App } from './app'`
- `src/styles.css`, `index.html`, `tsconfig.json`, `vite.config.ts`, `package.json`

`src/main.tsx` is fixed: `App` must be a named export of `src/app.tsx`. This is the only
interface the workload pins, so all three arms are free to structure the UI however the
strategy implies.

## Acceptance

Identical commands, run from the repository root:

```text
pnpm --filter @benchmark/todo-full-stack-our test
pnpm --filter @benchmark/todo-full-stack-our build
pnpm --filter @benchmark/todo-full-stack-tailwind test
pnpm --filter @benchmark/todo-full-stack-tailwind build
pnpm --filter @benchmark/todo-full-stack-shadcn test
pnpm --filter @benchmark/todo-full-stack-shadcn build
```

- `test` must print `domain acceptance: 4 assertions passed` and exit 0.
- `build` must exit 0; it runs `tsc --noEmit && vite build`, so it covers typechecking and the
  production bundle.

R1–R10 are verified by inspection of the produced source against this table, because no browser
interaction check exists in this round. That limitation is recorded in [protocol](protocol.md).

## Constraints common to every arm

- Write only the files your arm brief lists. Do not modify the frame files above.
- Do not add, remove, or change any dependency in `package.json`.
- No new files outside your own arm directory.
