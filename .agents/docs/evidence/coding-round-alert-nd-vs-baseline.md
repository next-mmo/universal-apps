# Coding round — ND flow vs baseline (Alert component)

> Status: evidence · Date: 2026-09-15 · n=1 per arm · Both arms: default worker agent settings
> Related: [Agent-efficiency baseline](../../../agent/evals.md) · [locate vs search benchmark](locate-vs-search-benchmark.md)

## Question

Does working through the ND workflow (index + `context locate` + bounded reads + context pack) reduce agent cost versus plain search on a real small coding task, at equal outcome?

## Method

- Two throwaway `git worktree` checkouts of the same HEAD + working tree (`.eval-wt/nd`, `.eval-wt/naive`, gitignored, removed or inspected on request). No `pnpm install` in either — symmetric.
- Same task both arms: add an `Alert` primitive to `packages/ui` + subpath export; verify with `pnpm workflow:check --strict-budget` and `pnpm docs:check`.
- Only difference: discovery protocol. ND arm: `nd index build`, `nd context locate`, one `pnpm context` pack, bounded reads. Baseline arm: plain search/read tools only; no ND commands, no context pack.
- Metrics: tool results and assistant turns counted from each session's `messages.jsonl`; session transcript bytes used as the token-cost proxy (host token counters unavailable); wall clock from session dir timestamps; outcome re-verified by the orchestrator running both checks independently.

## Results

| Metric | ND arm | Baseline | Delta |
| :--- | ---: | ---: | ---: |
| Outcome | done, both checks exit 0 | done, both checks exit 0 | tie |
| Tool results | 35 | 44 | −20% |
| Assistant turns | 16 | 20 | −20% |
| Files opened for reading | 11 | 19 | −42% |
| Transcript size (token proxy) | 152,055 B | 242,193 B | −37% (~22.5k est. tokens @ bytes/4) |
| Wall clock | 4m07s | 6m00s | −31% |
| Rework | 1 wrong-path read | 1 export-order fix, corrected | both minor |

Artifacts: near-identical components. ND: `alert.tsx` 1,087 B, five variants (`default` neutral, info/success/warning/destructive), `[&>svg]` handling. Baseline: 1,054 B, four variants (`default` = info). Both registered `"./alert"` in `packages/ui/package.json`, used `@package/ui/cn`, token-only utility classes, `role='alert'`, `data-slot='alert'`.

## Findings

1. Direction confirmed: ND arm used ~20% fewer calls, ~42% fewer file reads, and a ~37% smaller transcript for the same outcome on this task.
2. The baseline is capable — plain search found the shipped `packages/cli/templates/ui/alert.tsx`, the styling skills, and token docs too. ND's gain here is efficiency, not capability.
3. Most of ND's advantage came from routed discovery (`locate` → exact skill/token pointers) versus the baseline's broader reads of neighboring components.

## Limits

- n=1 per arm — a single run cannot establish medians; repeat runs before adopting percentages as policy (per `agent/evals.md`).
- Transcript bytes are a serialized-session proxy, not host token counters.
- Same machine; no `pnpm install`; verification limited to the two scripted checks (no typecheck/lint available).
- Both task briefs named the `cn` import path and the variant set; the comparison covers the remaining discovery surface only.
