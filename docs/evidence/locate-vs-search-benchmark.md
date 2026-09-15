# ND `context locate` vs plain keyword search — lookup benchmark

> Status: evidence · Date: 2026-09-15 · Host: win32, Node v24.19.0, pnpm 10.32.1 · ND cache FRESH (`.nd-cache/context-index.json`)
> Related: [Agent-efficiency baseline](../../agent/evals.md) · [nd-doc-lookup skill](../../.agents/skills/nd-doc-lookup/SKILL.md)

## Question

Does `/nd-doc-lookup` (`nd context locate`) beat plain recursive keyword search on speed and token cost for documentation lookups?

## Method

- Corpus (identical for both modes — 48 `.md` files, the ND index scope): root `AGENTS.md` + `CLAUDE.md`, `.agents/docs/**`, `.agents/skills/**`, `.agents/templates/**`.
- Mode A: `node packages/nd-workflow/bin/nd.mjs context locate "<query>"` — full process cold start each call.
- Mode B: in-process recursive line scan with a joined-keyword regex — the grep-equivalent behavior without tool-spawn variance.
- 5 representative doc-lookup queries; both modes timed with `process.hrtime`; sizes in UTF-8 bytes; token estimates = bytes / 4 (repo heuristic per `agent/evals.md`).
- "Answer window" = 50 lines around the first route/hit — the bounded read both modes still need.

## Results

| Query | A: locate (ms) | A bytes | A routes | B: scan (ms) | B bytes | B matches |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| UI framework main style tailwind tokens | 855 | 3,359 | 5 | 5 | 24,718 | 136 |
| documentation budget token rules | 779 | 3,125 | 5 | 4 | 19,660 | 111 |
| scope approval gate risk tier | 827 | 3,266 | 5 | 5 | 33,294 | 192 |
| standalone npm tarball packaging | 1,051 | 3,005 | 5 | 5 | 18,179 | 126 |
| source-owned distribution prd | 765 | 2,808 | 5 | 4 | 15,225 | 77 |
| **Total** | **4,277** | **15,563** | **25** | **23** | **111,076** | **642** |

- First-hit answer window: A 8,093 B; B 11,713 B.
- Full lookup cost (search output + one answer window): A 23,656 B (~5.9k est. tokens) vs B 122,789 B (~30.7k est. tokens) → **~5.2× fewer bytes for locate**.
- One-time cache build (`nd index build`): 873 ms (rebuilt at the end of the run).

## Findings

1. **Tokens: locate wins ~7× at search-output level** (2.8–3.4 KB/query, bounded ≤5 ranked routes with 140-char excerpts) vs plain scan (15–33 KB/query, 77–192 raw matches).
2. **Speed: plain scan wins per call** — 4–5 ms in-process vs 0.75–1.05 s for locate (Node+Python cold start per call). A realistic grep tool call (~50–200 ms incl. spawn) is still faster than the locate CLI; locate's value is that one bounded call usually suffices.
3. **Precision: locate pre-ranks, scan does not.** Locate returned 25 routes total vs 642 raw match lines. Locate ranking is not always best-first (e.g., "standalone npm tarball packaging" top route was `nd-bump-version`), so routes still need judgment.
4. **Coverage: locate indexes documentation only** (`.md`), not source code — code-symbol searches still need the plain search tool.

## Limits

- Single machine, warm checkout, 48-file corpus; larger corpora raise scan matches but leave locate output bounded (its build cost grows linearly).
- Token figures are byte/4 heuristics, not host-reported usage; no task-level behavior was measured (per `agent/evals.md`, behavioral savings require paired agent runs).
- Mode B is an idealized in-process scan; real tool calls add spawn overhead (≈50–200 ms) but do not change the byte comparison.
