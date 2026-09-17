# Arm brief — Plain Tailwind

> Status: round brief · Arm: `todo-full-stack-tailwind` · Strategy: plain semantic HTML + Tailwind utility classes
> Canonical copy of the prompt handed to this arm's session. [Workload](workload.md) · [protocol](protocol.md)

## Objective

Implement the matched workload — a React todo administration UI — in
`C:\Users\MT-Staff\Documents\GitHub\universal-apps\apps\benchmark\todo-full-stack-tailwind`.

Your arm's strategy is direct composition: semantic HTML elements styled with Tailwind utility
classes, and all interaction UI written out in the page itself. No component library, no local
primitive module.

## Requirements

| ID | Requirement |
| :-- | :-- |
| R1 | Create a task. Text input plus a submit control, calling `add` from `useBenchmarkTodos()`. Empty or whitespace-only text must be rejected through `validateTodoText`, and the returned message must be displayed. |
| R2 | Edit an existing task's text through `update`. The same validation rule applies. |
| R3 | Toggle a task's done state through `toggle`. |
| R4 | Delete a task through `remove`. |
| R5 | Clear completed tasks through `clearDone`. |
| R6 | Search and filter. A search input (case-insensitive substring on task text) and All / Active / Done controls. Visible rows must come from `selectTodos(todos, filter, search)`. |
| R7 | Loading state. While `ready` is false, render a loading indication carrying `aria-busy`. |
| R8 | Error state. When `error` is set, render it in a `role="alert"` region together with a control that calls `clearError`. |
| R9 | Empty state. When there are no visible rows, render an empty-state message. |
| R10 | Persistence goes only through `useBenchmarkTodos()`. No second store, no direct `localStorage`, `fetch`, or `getTodoStore()` call. |

## Frame you start from

Already present in the arm directory and not yours to change:

- `src/domain.ts` — `Todo`, `validateTodoText`, `selectTodos`
- `src/domain.test.ts` — four deterministic domain assertions
- `src/model.ts` — `useBenchmarkTodos()` plus re-exports
- `src/main.tsx` — imports `./styles.css` and `{ App } from './app'`
- `src/styles.css`, `index.html`, `tsconfig.json`, `vite.config.ts`, `package.json`

`src/main.tsx` is fixed, so `App` must be a **named export** of `src/app.tsx`.

## Discovery

Available to you: `Read`, `Grep`, `Glob`, and the repository's capability CLI (`pnpm agent find`,
`pnpm agent inspect`, `pnpm agent recipe`). `llms.txt` is the documentation map.

No repository block or component library applies to this arm. `tailwindcss` and
`@tailwindcss/vite` are already installed and wired in `vite.config.ts` and `src/styles.css`; the
`@source './'` directive already scans this arm's `src/`, so utility classes you write are picked up
without further configuration. Do not add anything.

## Files you write

- `src/app.tsx` — named export `App`.

Nothing else.

## Acceptance

Run from the repository root:

```text
pnpm --filter @benchmark/todo-full-stack-tailwind test
pnpm --filter @benchmark/todo-full-stack-tailwind build
```

`test` must print `domain acceptance: 4 assertions passed` and exit 0. `build` must exit 0; it runs
`tsc --noEmit && vite build`, so it covers typechecking and the production bundle.

## Constraints

- Create only `src/app.tsx`. Do not modify any other file.
- Do not add, remove, or change any dependency in `package.json`.
- Do not create files outside this arm directory, and do not read or modify the other arm
  directories.
- If you believe a frame file must change, stop and report instead of changing it.

## Report when done

State, in this order:

1. Whether both acceptance commands passed, with their exit codes.
2. The files you created, with byte sizes.
3. The exact commands you ran.
4. Any requirement you could not satisfy, and any deviation from this brief.
