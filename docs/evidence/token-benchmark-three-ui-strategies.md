# Evidence: agent-token benchmark, three UI strategies (round 1)

> Status: measured — n=1 per arm, provisional ordering
> Round: 1 (smoke) · Executed: 2026-09-17 · PRD: [`0004-agent-token-benchmark.md`](../prd/0004-agent-token-benchmark.md)
> Task: [`blocked-0006-agent-token-benchmark-round-1.md`](../tasks/blocked-0006-agent-token-benchmark-round-1.md)

Three matched arms built the same frozen todo-app workload, differing only in UI strategy. Every
figure below is host-reported usage summed from each run's `messages.jsonl`; none is a character
heuristic.

## Result

| Arm | Strategy | Turns | fresh input+output | totalTokens | cache reads | cacheRead share |
| :-- | :-- | --: | --: | --: | --: | --: |
| our | shared `@package/pro` CRUD block | 46 | **1,276,014** | **2,914,030** | 1,638,016 | 56.2% |
| tailwind | plain HTML + Tailwind utilities | 9 | **41,590** | **169,590** | 128,000 | 75.5% |
| shadcn | vendored local shadcn-style primitives | 16 | **65,520** | **385,904** | 320,384 | 83.0% |

`fresh input+output` is the work the arm actually performed; `totalTokens` is cache-dominated
context volume. Both are quoted because either alone misleads. Relative to tailwind, shadcn cost
+57.5% fresh and +127.6% total; the Our arm cost +2,968.1% fresh and +1,618.3% total, a magnitude
that is **not** usable as a strategy cost — see the cache artifact below.

## Per-run detail

| Arm | Session | Session directory | Turns | input | output | cacheRead | totalTokens | fresh |
| :-- | :-- | :-- | --: | --: | --: | --: | --: | --: |
| our | `mvs_27404a51ddde4683bb519b509e5d27b2` | `2026/09/17/10-04-31-255-session_bXZzXzI3NDA0YTUxZGRkZTQ2ODNiYjUxOWI1MDllNWQyN2Iy` | 46 | 1,225,736 | 50,278 | 1,638,016 | 2,914,030 | 1,276,014 |
| tailwind | `mvs_71e9b1ededcf4391bb7c5074ac7b3e81` | `2026/09/17/10-33-09-265-session_bXZzXzcxZTliMWVkZWRjZjQzOTFiYjdjNTA3NGFjN2IzZTgx` | 9 | 37,363 | 4,227 | 128,000 | 169,590 | 41,590 |
| shadcn | `mvs_cc5d2c69932341cca9f59fa24791b577` | `2026/09/17/10-34-36-875-session_bXZzX2NjNWQyYzY5OTMyMzQxY2NhOWY1OWZhMjQ3OTFiNTc3` | 16 | 59,361 | 6,159 | 320,384 | 385,904 | 65,520 |

Session directories are relative to `<activeDataDir>/v2/sessions/`. All arithmetic satisfies
`total = input + cacheRead + output`.

## Provenance

- Model pin, verified from the records rather than from the host: every captured turn in all three
  arms reports `model: ocg/deepseek-v4.1-flash` and `provider: custom_provider:9route`, matching the
  pinned `custom_provider:9route/ocg/deepseek-v4.1-flash`. The host reported `model_verdict: missing`
  for each delegated run, so the records are the stronger evidence.
- Reasoning effort off; agent `worker`; one fresh session per arm; arms run sequentially so builds
  did not contend.
- Every recovered `cost` object is zero (`anyCostNonZero: false` in all three runs), so this evidence
  supports no monetary claim.

## Equality of outcome

All three arms passed both acceptance commands on the first attempt, with no repair turns, verified
by the orchestrator rather than accepted from the arm's own report:

| Arm | Deliverable | Bytes | `test` | `build` | Modules | JS | CSS |
| :-- | :-- | --: | :-- | :-- | --: | --: | --: |
| our | `src/app.tsx` | 6,966 | exit 0, 4 assertions | exit 0 | 1,919 | 499.48 kB | 39.47 kB |
| tailwind | `src/app.tsx` | 7,477 | exit 0, 4 assertions | exit 0 | 35 | 199.75 kB | 5.41 kB |
| shadcn | `src/components.tsx` + `src/app.tsx` | 3,109 + 9,191 | exit 0, 4 assertions | exit 0 | 36 | 201.56 kB | 5.41 kB |

As a positive control, all three arms also passed `test` and `build` with the original fixture UI
present before that UI was removed (1,919 / 35 / 36 modules; JS 496.77 / 199.62 / 200.08 kB). That
proves the substrate and toolchain work independently of any arm's authored source, and it
reproduces the removed `apps/benchmark.md` bundle figures.

## Measurement artifacts and threats

1. **Provider-cache artifact in the Our arm — magnitude unusable, rank unaffected.** Every arm
   carries one expected cold turn (the warm-up, before a cache exists): turn 2, 15,435 to 16,290
   tokens. The Our arm carries 12 further turns that reported no cache read, spanning turns 24–46, on
   which the entire growing context was re-sent uncached — 1,056,895 tokens, or 86% of that arm's
   uncached input. Its context had grown to roughly 100–118 k tokens, so each miss re-sent all of it.
   The other two arms never lost the cache after warm-up, which rules out a host-wide or
   provider-wide condition in this round. Because the artifact sits in *input*, not output, and
   because the Our arm's remaining 169 k of uncached input still exceeds both other arms, the
   last-place ordering survives while the +2,968% magnitude does not. Reported by
   `capture-tokens.mjs` as `excessColdTurns` / `excessColdInput` / `excessColdShare` so no manual
   side-analysis is needed to see it.
2. **The Our arm's frame cannot compile the utilities its blocks need.** Its `vite.config.ts`
   registers only `@vitejs/plugin-react` and its `package.json` does not depend on
   `@tailwindcss/vite`, yet `packages/pro/src` styles itself with Tailwind utility classes in 37
   places across 8 files. The built stylesheet contains Tailwind's raw `@theme default` variables and
   preflight but no utility rules (`.justify-between`, `.items-center`, `.rounded-md`, `.text-sm` are
   all absent), and its 47-byte-longer sibling stylesheets confirm the asymmetry at the source. The
   Our arm was therefore never visually comparable to the other two, and its agent flagged the
   mismatch while correctly refusing to edit a frame file. The defect is inherited, not introduced:
   the removed round's identical 39.47 kB stylesheet shows it predates this work.
3. **n=1 per arm.** Medians over a single run are not estimates. The ordering is provisional, and no
   percentage from this round should be published as a result.
4. **UI-layer isolation.** Each arm wrote only its UI against byte-identical pre-installed substrate,
   which isolates the strategy signal but omits the substrate cost a consumer also pays. The four
   shared frame files hash identically across all three arms, so the source of each arm's size
   difference is the strategy rather than a template variation.
5. **Requirements are checked by reading source, not by driving the UI.** The acceptance commands
   cover typechecking, the production bundle, and four deterministic domain assertions; R1–R10
   behavioural parity across arms is not machine-verified.

## Instrument validation

Before use, `capture-tokens.mjs` was validated against already-published ground truth: summing the
2026-09-15 Alert sessions reproduced `docs/evidence/coding-round-alert-nd-vs-baseline.md` **exactly**
— ND `turns=16 total=483,386 fresh=85,306 cacheRead=398,080`, baseline `turns=20 total=775,589
fresh=96,037 cacheRead=679,552`. An instrument that reproduces a known figure before measuring an
unknown one is the reason these numbers are trustworthy at this sample size.

## Reproduction

Run from the repository root:

```text
node apps/benchmark/scripts/capture-tokens.mjs --manifest apps/benchmark/results/runs.json \
    --out apps/benchmark/results/tokens-round-1.json
node apps/benchmark/scripts/compare.mjs --in apps/benchmark/results/tokens-round-1.json \
    --out apps/benchmark/results/compare-round-1.md
node apps/benchmark/scripts/breakdown.mjs --session mvs_27404a51ddde4683bb519b509e5d27b2
```

`breakdown.mjs` prints the per-turn series that localizes the cache artifact. Acceptance commands per
arm:

```text
pnpm --filter @benchmark/todo-full-stack-our test
pnpm --filter @benchmark/todo-full-stack-our build
```

The same pair applies to `@benchmark/todo-full-stack-tailwind` and
`@benchmark/todo-full-stack-shadcn`. The workload specification, per-arm briefs, and protocol are in
`apps/benchmark/spec/`.
