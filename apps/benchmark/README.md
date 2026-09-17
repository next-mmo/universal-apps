# Benchmark arms — agent-token round

> Status: active · Round 1 (smoke), 2026-09-17 · Approved via questionnaire `ask_bfd3c9a7b2bb9dff821a4632`
> Protocol: [spec/protocol.md](spec/protocol.md) · Workload: [spec/workload.md](spec/workload.md) · PRD: [0004](../../docs/prd/0004-agent-token-benchmark.md)

Three implementations of the same todo administration UI, used to measure what each **UI strategy**
costs an agent in host-reported tokens, at equal outcome.

| Arm | Directory | Strategy | Files the arm writes |
| :-- | :-- | :-- | :-- |
| our | `todo-full-stack-our` | shared `@package/pro` CRUD block | `src/app.tsx` |
| tailwind | `todo-full-stack-tailwind` | plain semantic HTML + Tailwind utilities | `src/app.tsx` |
| shadcn | `todo-full-stack-shadcn` | vendored local shadcn-style primitives | `src/components.tsx`, `src/app.tsx` |

This is not a bundle-size or source-size benchmark. The earlier round already recorded those metrics;
this round measures agent cost, which that round could not measure at all.

## Round 1 result (2026-09-17, n=1 per arm)

All three arms passed their acceptance commands on the first attempt, with no repair turns, and the
orchestrator re-ran both commands per arm rather than accepting any arm's self-report. Host-reported
counters:

| Arm | Turns | fresh input+output | totalTokens | cache reads |
| :-- | --: | --: | --: | --: |
| our | 46 | 1,276,014 | 2,914,030 | 1,638,016 |
| tailwind | 9 | 41,590 | 169,590 | 128,000 |
| shadcn | 16 | 65,520 | 385,904 | 320,384 |

Two findings bound this table. Neither belongs in a footnote:

1. **The Our arm's magnitude is artifact-inflated.** Twelve turns beyond the warm-up that every arm
   shares reported no cache read and re-sent a 54–118 k context uncached — 1,056,895 tokens, 86% of
   that arm's uncached input. Its last-place rank survives that; its +2,968% magnitude is a caching
   effect, not a strategy cost.
2. **The Our arm's frame cannot compile the utilities its blocks need.** Its `vite.config.ts` registers
   no Tailwind plugin and its `package.json` omits `@tailwindcss/vite`, so the utility classes
   `packages/pro/src` uses in 37 places generate no CSS. The defect is inherited from the removed
   round; it was never introduced here, and it means that arm was never visually comparable to the
   other two.

Full detail, session paths, and reproduction commands:
[the round-1 evidence](../../docs/evidence/token-benchmark-three-ui-strategies.md).

## How it works

Each arm directory is a workspace package containing only the **shared frame**: domain, model,
domain test, entry point, styles, and build config. The UI layer is deliberately absent — writing it
is the arm's job. Keeping the frame identical and pre-installed removes a ~3 KB constant from every
arm, so the measurement isolates the strategy rather than diluting it.

The arms are tracked **substrate-only**. `.gitignore` excludes `src/app.tsx`, `src/components.tsx`,
and `dist/` under each arm, so a run's produced files never enter the tree on their own. Archive each
run's output under `results/` instead — round 1's is in [`results/round-1/`](results/round-1), which is
why those byte sizes are still checkable after the arms were reset to substrate-only.

## Running a round

1. Reset every arm to substrate-only (see below).
2. Start one fresh session per arm, with the matching file in `spec/` as its first message. Pin the
   same model, reasoning effort, permissions, and agent role for every arm, and run them
   **sequentially** — parallel builds contend for CPU and make elapsed time meaningless.
3. Record each session id in `results/runs.json`.
4. Verify each arm yourself. A session's own claim that it passed is not evidence:

   ```text
   pnpm --filter @benchmark/todo-full-stack-our test
   pnpm --filter @benchmark/todo-full-stack-our build
   ```

5. Capture and compare:

   ```text
   node apps/benchmark/scripts/capture-tokens.mjs
   node apps/benchmark/scripts/compare.mjs
   ```

## Reset

A run only ever adds ignored files, so `git status --short apps/benchmark` shows the drift. To reset:

```text
git checkout -- apps/benchmark
```

plus removing any stray file a run created outside the ignored paths. `dist/` never needs resetting.

## Scripts

| Script | Purpose |
| :-- | :-- |
| `scripts/capture-tokens.mjs` | resolve each run's session directory from `results/runs.json` and sum its per-turn `usage` records |
| `scripts/compare.mjs` | render the compare table with medians, deltas, and the mandatory limits |
| `scripts/breakdown.mjs` | print one session's per-turn counters, to attribute an outlier instead of merely reporting it |

`results/capture-self-test.json` is the capture script's validation fixture. Run against the two
2026-09-15 Alert sessions, the same script must reproduce `totalTokens` 483,386 and 775,589 — figures
recovered and published independently in
[the Alert evidence](../../docs/evidence/coding-round-alert-nd-vs-baseline.md). If it does not, do not
trust a new capture until the record shape has been re-checked.

## What this round cannot say

- No currency or "money saved" figure. Every `cost` object recovered from this repository is zero.
- No counter-app number. That measurement is a separate, unauthorized round.
- No percentage from a single run per arm. Round 1 is a smoke: it validates the harness and exposes
  inter-run spread. Publish orderings as provisional until the repeat runs land.
- No bundle-size conclusion. Those numbers live in the earlier round and in the diagnostics only.
- No magnitude for any arm whose cache misbehaved. Quote the rank, or wait for a re-run — the artifact
  section above says which arm and how much.
- No claim that the three arms render the same UI. They pass the same acceptance commands; the Our arm
  does not generate the CSS its blocks expect, so visual parity was never established.
