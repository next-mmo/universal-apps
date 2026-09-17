# Round protocol — agent-token benchmark

> Status: round protocol · Round 1 (smoke) executed 2026-09-17
> Related: [PRD 0004](../../../docs/prd/0004-agent-token-benchmark.md) · [workload](workload.md) · [evidence](../../../docs/evidence/token-benchmark-three-ui-strategies.md)

## Question

At equal outcome, how many host-reported tokens does each UI strategy cost an agent to implement
the same application?

## Design

- Three arms, one UI strategy each, one matched workload ([`workload.md`](workload.md)).
- One fresh agent session per arm. Sessions are never reused, and no arm sees another arm's work.
- Same model, reasoning effort, permissions, agent role, and starting frame for every arm.
- Sequential, not parallel: concurrent builds would contend for CPU and confuse elapsed time.
- Every arm receives the same requirement table, frame, acceptance commands, and constraints. Only
  the strategy section differs.

## Recording

Counters come from each run's own session record — one `usage` object per assistant turn:

```text
<data dir>/v2/sessions/YYYY/MM/DD/<HH-MM-SS>-<session_id>/messages.jsonl
```

Two record shapes have been observed in this repository and both satisfy
`total = input + cacheRead + output`:

- nested — `usage: { input, output, cacheRead, cacheWrite, totalTokens, cost { … } }`
- flat — `input_tokens`, `output_tokens`, `cache_read`, `total_tokens`, `context_window`, `request_duration_ms`

`../scripts/capture-tokens.mjs` reads these records and emits `../results/tokens-<date>.json`;
`../scripts/compare.mjs` turns that file into the compare table. Repair turns and failed acceptance
runs count as cost, never as omitted work.

## Reporting rules

- `totalTokens` is dominated by cache reads. Always quote the fresh `input + output` figure beside it.
- Every `cost` object observed in this repository is zero, so **no currency or "money saved" claim is
  supported at any n**.
- State `n` per arm on every table. One run per arm cannot establish a median.
- Byte or character estimates (`ceil(chars / 4)`) are proxies. They are never the headline and must be
  labelled as estimates wherever they appear.
- Report failures and deviations, not only successful runs.

## Known limits of this round

- No browser interaction check. R1–R9 are verified by reading the produced source, not by driving the
  UI, so two arms can pass the acceptance commands while differing in real behaviour.
- The arms differ in file count by construction — the shadcn arm writes a primitives module plus a
  page, the other two write a page — because that difference *is* the strategy.
- The Our arm has a discovery affordance the other arms have no use for (the block catalog). That is
  part of the strategy's real cost, not an asymmetry to correct.
- Source bytes, bundle size, and build duration are diagnostics. They are not token evidence.
