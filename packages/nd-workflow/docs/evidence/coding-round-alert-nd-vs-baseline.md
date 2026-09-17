# Coding round — ND flow vs baseline (Alert component)

> Status: evidence · Date: 2026-09-15 · n=1 per arm · Both arms: default worker agent settings
> Host token counters added 2026-09-17 — recovered from the same two sessions, no re-run
> Related: [Agent-efficiency baseline](../../../../agent/evals.md) · [locate vs search benchmark](locate-vs-search-benchmark.md)

## Question

Does working through the ND workflow (index + `context locate` + bounded reads + context pack) reduce agent cost versus plain search on a real small coding task, at equal outcome?

## Method

- Two throwaway `git worktree` checkouts of the same HEAD + working tree (`.eval-wt/nd`, `.eval-wt/naive`, gitignored, removed or inspected on request). No `pnpm install` in either — symmetric.
- Same task both arms: add an `Alert` primitive to `packages/ui` + subpath export; verify with `pnpm workflow:check --strict-budget` and `pnpm docs:check`.
- Only difference: discovery protocol. ND arm: `nd index build`, `nd context locate`, one `pnpm context` pack, bounded reads. Baseline arm: plain search/read tools only; no ND commands, no context pack.
- Metrics: tool results and assistant turns counted from each session's `messages.jsonl`; session transcript bytes used as the token-cost proxy; wall clock from session dir timestamps; outcome re-verified by the orchestrator running both checks independently.
- Counter correction (2026-09-17): the recorder stated at run time that host token counters were unavailable. That was a misread of the record shape, not a missing feature. The same two sessions persist one `usage` record per assistant turn; see [Host token counters](#host-token-counters-recovered-2026-09-17) below.

## Results

| Metric | ND arm | Baseline | Delta |
| :--- | ---: | ---: | ---: |
| Outcome | done, both checks exit 0 | done, both checks exit 0 | tie |
| Tool results | 35 | 44 | −20% |
| Assistant turns | 16 | 20 | −20% |
| Files opened for reading | 11 | 19 | −42% |
| Transcript size (proxy) | 152,055 B | 242,193 B | −37% (~22.5k est. tokens @ bytes/4) |
| Wall clock | 4m07s | 6m00s | −31% |
| Rework | 1 wrong-path read | 1 export-order fix, corrected | both minor |

Artifacts: near-identical components. ND: `alert.tsx` 1,087 B, five variants (`default` neutral, info/success/warning/destructive), `[&>svg]` handling. Baseline: 1,054 B, four variants (`default` = info). Both registered `"./alert"` in `packages/ui/package.json`, used `@package/ui/cn`, token-only utility classes, `role='alert'`, `data-slot='alert'`.

## Host token counters (recovered 2026-09-17)

Each session stores one `usage` object per assistant turn — `{input, output, cacheRead, cacheWrite, totalTokens, cost{input, output, cacheRead, cacheWrite, total}}` — and `totalTokens = input + cacheRead + output` holds for every record. Summing every turn of each arm:

| Counter | ND arm | Baseline | Delta |
| :--- | ---: | ---: | ---: |
| Turns carrying usage | 16 | 20 | −20% |
| input | 73,929 | 79,740 | −7.3% |
| output | 11,377 | 16,297 | −30.2% |
| cacheRead | 398,080 | 679,552 | −41.4% |
| **totalTokens** | **483,386** | **775,589** | **−37.7%** |
| fresh input + output | 85,306 | 96,037 | **−11.2%** |
| cacheRead share of total | 82.4% | 87.6% | — |

Sessions (sessions root `<data dir>/v2/sessions`):

- ND arm — `2026/09/15/10-28-49-047-session_bXZzX2YzYTY3Nzk2OWMxMzRkZTM4NTYzNGJkNWUxYTBmYjFm`
- Baseline — `2026/09/15/10-28-50-620-session_bXZzXzk2M2QzZWE4ZGMwYTRjMzdhZjE3MjFjNTM1MDhjOWQw`

The recovered turn counts (16 and 20) equal the independently recorded assistant turns in the table above, which is the check that these are the two arms of this run.

`cost` is present but zero in every record, so this evidence supports token deltas only. It cannot support a currency or "money saved" claim.

## Findings

1. Direction confirmed: ND arm used ~20% fewer calls, ~42% fewer file reads, and a ~37% smaller transcript for the same outcome on this task.
2. Host counters confirm the direction at −37.7% total tokens (483,386 vs 775,589).
3. The baseline is capable — plain search found the shipped `packages/cli/templates/ui/alert.tsx`, the styling skills, and token docs too. ND's gain here is efficiency, not capability.
4. Most of ND's advantage came from routed discovery (`locate` → exact skill/token pointers) versus the baseline's broader reads of neighboring components.
5. The transcript-byte proxy was directionally accurate but would have overstated the result if reused as billing evidence: fresh, non-cached work fell only −11.2%, and cache reads — priced differently from fresh input — account for 82% of the ND arm's total.

## Limits

- n=1 per arm — a single run cannot establish medians; repeat runs before adopting percentages as policy (per `agent/evals.md`).
- The −37.7% figure is a total-token delta dominated by cache reads. Quote the −11.2% fresh input+output delta beside it, or quote neither.
- Counters were recovered after the fact from persisted records rather than captured live, and the sessions were not re-run: this corrects available data, it is not a repeated measurement.
- Both recovered figures are specific to one task, one model, and one revision. They do not transfer to a different task shape, such as building a whole app from scratch.
- Same machine; no `pnpm install`; verification limited to the two scripted checks (no typecheck/lint available).
- Both task briefs named the `cn` import path and the variant set; the comparison covers the remaining discovery surface only.
