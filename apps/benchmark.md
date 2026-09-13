# Todo Full-Stack Benchmark

Date: 2026-09-14

## Executive result

For this matched local benchmark:

- **Lowest consumer/source footprint:** Our blocks.
- **Lowest production bundle footprint:** Plain Tailwind.
- **Best middle ground:** shadcn-style vendored primitives.
- **Actual billed model-token winner:** Not measurable in this run. The host did not expose per-run input/output token counters, and the Token Plan balance was exhausted for delegated model work. No billed-token savings claim is made.
- **Context-router result:** Nearly identical for all three scopes because the repository context command currently selects the same three bounded documents for each fixture. The router saves context relative to the complete tracked repository, but it does not yet distinguish these implementations deeply enough to prove a per-strategy context advantage.

The fixtures are buildable React web apps with browser/Tauri-adapter persistence through `@package/tauri-api`. They are not full Rust/Tauri executable builds. Desktop packaging and Rust command execution remain a separate validation step.

## Matched workload

Each fixture implements the same requirements:

- React web application
- Tailwind CSS styling
- Todo create, edit, toggle, delete, and clear-completed operations
- Search and All/Active/Done filters
- Required task-text validation
- Loading, persistence-error, and empty states
- Local persistence through the same `getTodoStore()` adapter
- TypeScript compilation and Vite production build
- Four deterministic domain assertions covering validation, search, and filters

The only intended implementation differences are UI composition:

| Fixture | UI strategy | Shared application block | Local UI code |
|---|---|---|---|
| `apps/benchmark/todo-full-stack-our` | `@package/pro` resource + CRUD/table/form blocks | Yes | Resource configuration only |
| `apps/benchmark/todo-full-stack-tailwind` | Direct semantic HTML with Tailwind utility classes | No | Full page markup and interaction UI |
| `apps/benchmark/todo-full-stack-shadcn` | Local shadcn-style `Button`, `Input`, `Badge`, and `Card` primitives | No | Primitive wrappers plus page markup |

The domain model and persistence hook are intentionally equivalent in all three fixtures. This isolates the UI strategy from backend/domain differences.

## Build and source comparison

Source metrics count `src/**/*.{ts,tsx,css}`. Estimated source tokens are `source bytes / 4`, a rough text proxy rather than a model tokenizer result.

| Metric | Our blocks | Plain Tailwind | shadcn-style | Interpretation |
|---|---:|---:|---:|---|
| Source files | 6 | 6 | 7 | shadcn-style adds a primitive module |
| Source lines | 135 | 130 | 130 | Similar total fixture size |
| Source bytes | 5,693 | 8,969 | 9,911 | Our is 36.5% below Tailwind and 42.6% below shadcn-style |
| Estimated source tokens | ~1,423 | ~2,242 | ~2,478 | Proxy only; not billed usage |
| Main page bytes | 1,830 | 5,059 | 4,806 | Our is 63.8% below Tailwind and 61.9% below shadcn-style |
| Main page lines | 32 | 25 | 19 | Fewer lines do not imply less total complexity |
| Shared domain/model bytes | 2,934 | 2,934 | 2,934 | Equivalent behavior layer in each fixture |
| Local UI primitive bytes | 0 | 0 | 1,128 | shadcn-style primitive code is vendored locally |

### Production output

Metrics come from the successful Vite builds. Bundle sizes are uncompressed bytes unless marked gzip.

| Metric | Our blocks | Plain Tailwind | shadcn-style | Interpretation |
|---|---:|---:|---:|---|
| Vite modules transformed | 1,919 | 35 | 36 | Our shared pro/UI stack pulls a much larger dependency graph |
| JavaScript | 496.78 kB | 199.62 kB | 200.08 kB | Tailwind is 59.8% below Our; shadcn-style is 59.7% below Our |
| JavaScript gzip | 151.64 kB | 62.92 kB | 63.07 kB | Runtime cost favors the two local strategies |
| CSS | 39.40 kB | 12.56 kB | 13.84 kB | Our token/component stylesheet is larger |
| CSS gzip | 8.50 kB | 3.30 kB | 3.63 kB | Plain Tailwind is smallest |
| Build duration | 7.08 s | 1.42 s | 1.47 s | Local strategies built about 4.8x faster in this run |

Bundle results are fixture-specific and not a universal claim. The Our fixture imports the complete existing pro/table/form dependency path; a production app with multiple shared pages may amortize that cost through shared chunks.

## Verification matrix

| Check | Our blocks | Plain Tailwind | shadcn-style |
|---|---|---|---|
| Domain test | PASS — 4 assertions | PASS — 4 assertions | PASS — 4 assertions |
| TypeScript + Vite production build | PASS | PASS | PASS |
| Local persistence path | Uses same `getTodoStore()` adapter | Uses same `getTodoStore()` adapter | Uses same `getTodoStore()` adapter |
| Browser interaction test | Not run | Not run | Not run |
| Tauri Rust compile/package | Not run | Not run | Not run |
| `pnpm agent check --changed` | Incomplete — process hung without verdict and was canceled | Incomplete — same repository check | Incomplete — same repository check |

Repository-level checks completed during the benchmark:

- `pnpm workflow:check`: PASS before benchmark additions.
- `pnpm agent catalog-check`: PASS before benchmark additions.
- `pnpm docs:check`: PASS before the final report was added, with an existing low-headroom warning.
- React typecheck in the existing application: PASS.

## Context and token-cost evidence

Command:

```text
pnpm context:benchmark <fixture> --provider local --level 0 --budget 1500 --json
```

| Context metric | Our scope | Tailwind scope | shadcn scope |
|---|---:|---:|---:|
| Raw tracked-repository estimate | ~304,979 tokens | ~304,979 tokens | ~304,979 tokens |
| Bounded context estimate | ~575 | ~577 | ~576 |
| Budget | 1,500 | 1,500 | 1,500 |
| Budget exceeded | No | No | No |
| Selected documents | 3 | 3 | 3 |
| Reported savings against raw estimate | ~304,404 / 99.81% | ~304,402 / 99.81% | ~304,403 / 99.81% |

Important qualification: the raw baseline is the complete tracked repository and the bounded result is the local router's estimated context size. These values are useful for retrieval-budget comparison, not proof of provider billing. The three scopes selected nearly the same bounded documents, so this run demonstrates the router's repository-level reduction but not implementation-specific context savings.

No host-reported billed input/output token counters were available. Therefore:

- No actual token burn was recorded for agent generation.
- No cache-read/cache-write usage was recorded.
- No cost-per-run comparison was possible.
- Source bytes, estimated text tokens, context estimates, build time, and bundle size are proxy metrics only.

## Reuse and maintenance interpretation

| Question | Result |
|---|---|
| Does Our reduce the amount of consumer code? | Yes. The page is 1,830 bytes versus 5,059 and 4,806 bytes, because CRUD/table/form behavior is already composed in `@package/pro`. |
| Does Our reduce runtime output in this fixture? | No. The current shared stack produces the largest bundle. |
| Does plain Tailwind reduce implementation dependencies? | Yes. It transforms 35 modules and produces the smallest bundle, but repeats page-level behavior and styling decisions. |
| Does shadcn-style provide a token advantage here? | Not in source or bundle size. It adds local primitive code, but keeps implementation ownership local and familiar. |
| Does indexing alone prove lower agent cost? | No. Current context measurements are almost identical across fixtures. |
| What is the likely long-term advantage of Our? | A second and third resource can reuse tested CRUD/table/form contracts without regenerating the same interaction code. This needs a repeated-resource and change-request benchmark to prove. |

## Required follow-up benchmark for actual agent savings

This run is a build/source benchmark, not a paid-agent benchmark. To measure actual token burn:

1. Give all three strategies the same admin specification and acceptance tests.
2. Use the same model, reasoning effort, permissions, and fresh session for each run.
3. Record provider-reported input, output, cached, and billed tokens for every turn.
4. Add a second resource after the first passes; measure incremental tokens rather than only initial generation.
5. Start a fresh session and request the same change: add a status field, a filter, and a validation-rule change.
6. Count repair turns and failed acceptance checks as cost, not as omitted work.
7. Repeat at least three paired runs and report median plus range.
8. Compare guided discovery against ordinary source search separately so indexing savings are not confused with component-reuse savings.

## Reproducibility

Fixtures:

- `apps/benchmark/todo-full-stack-our`
- `apps/benchmark/todo-full-stack-tailwind`
- `apps/benchmark/todo-full-stack-shadcn`

Equivalent commands:

```text
pnpm --filter @benchmark/todo-full-stack-our test
pnpm --filter @benchmark/todo-full-stack-our build
pnpm --filter @benchmark/todo-full-stack-tailwind test
pnpm --filter @benchmark/todo-full-stack-tailwind build
pnpm --filter @benchmark/todo-full-stack-shadcn test
pnpm --filter @benchmark/todo-full-stack-shadcn build
```

The benchmark packages are included by `apps/benchmark/*` in `pnpm-workspace.yaml`. The lockfile was updated with workspace importer entries; no new dependency versions were introduced.
