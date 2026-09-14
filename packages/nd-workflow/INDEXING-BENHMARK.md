# INDEXING BENCHMARK: ND, Graphify, Meilisearch, LlamaIndex + Local DB

[Back to General Benchmark](BENHMARK.md) | [Top-2 Hardened Comparison](docs/TOP2-COMPETITIVE-BENCHMARK-AND-HARDENING.md) | [Release Readiness Audit](docs/RELEASE-READINESS-AND-BENCHMARK-AUDIT.md) | [Back to README](README.md)

Date: 2026-09-11

**Status: source-backed capability comparison and proposed benchmark protocol. No head-to-head execution, measured ranking, or demonstrated 9.7 score.**

**Goal:** make ND the best lightweight, trustworthy project-context and resume layer for developers switching IDE agents in the same folder on one machine. Top 1 is a target to earn, not a preset result.

## Executive decision

Build ND's portable context contract and small freshness-aware retrieval core first. Keep specialized retrieval engines optional. Do not build a graph database or embedding platform solely to compete on feature count.

These are four selected candidates, not a verified industry top four. They occupy different layers:
- **ND:** workflow, canonical project facts, task checkpoints and safe resume. New indexing/context commands remain planned.
- **Graphify:** code/document relationship graph and graph-oriented exploration.
- **Meilisearch:** search engine with an API and indexing infrastructure.
- **LlamaIndex + local DB:** configurable ingestion/retrieval framework with an explicit database and embedding configuration.

ND can plausibly win the narrow **safe, low-overhead cross-IDE continuity** use case. It has not demonstrated superior search speed, semantic recall, operating cost or host UX. A search backend could complement ND rather than replace it.

## Comparison configurations

Target hosts: Cursor, Claude Code, Codex and MiniMax Code. Same folder, same machine; sequential work, not concurrent writers.

| Candidate | Explicit evaluation configuration | Current evidence |
|---|---|---|
| ND current | Canonical policy/catalog/checkpoints plus scoped file search | Local CLI source inspected; indexing and host transfer not demonstrated |
| ND target | PRD-0003 v0.2: bounded lexical lookup, fingerprints, stale-cache fallback, approval and ownership checks | Scope approved for planning; not implemented or benchmarked |
| Graphify | Graphify-Labs/graphify v8 branch; structural code extraction separated from semantic document processing | README/package manifest inspected; no installation or runtime test |
| Meilisearch | Single self-hosted lexical instance; no embedding model in baseline; explicit ingestion/query adapter | Official README and asynchronous task documentation inspected |
| LlamaIndex + local DB | LlamaIndex + Chroma local persistence through ChromaVectorStore, explicit local embedding model, retrieval-only baseline | Integration, embedding-resolution and ingestion source inspected; no run |

**Local DB assumption:** user did not name a DB. Chroma is an explicit candidate baseline, not a recommendation that it is universally best. LlamaIndex's persisted SimpleVectorStore can be an extra lightweight control; it is not equivalent to a full indexed database. Changing DB or model creates a separately labeled configuration. [L2, L4, C1]

External branches are mutable. Retrieved Graphify manifest declares version 0.9.57 and Python >=3.10. Pin commits, package locks, model IDs, corpus hashes and settings before experiments. [G2]

## Capability matrix

Documented capabilities are not locally verified performance. ND target cells describe proposals, not shipped features. Update 2026-09-11: the ND context/index implementation landed and is covered by local tests; cells marked "implemented" cite shipped code plus regression evidence, and still carry no competitor-measured results.

| Dimension | ND current / target | Graphify | Meilisearch | LlamaIndex + Chroma local |
|---|---|---|---|---|
| Primary question | What is current task, approved scope, evidence and next action? | Which entities call, import or relate to each other? | Which indexed documents match this query? | Which chunks answer this question through a configured pipeline? |
| Retrieval | Catalog plus bounded lexical/metadata index (implemented 2026-09-11, local tests; not competitor-measured) | Structural code parsing; optional semantic relationships | Ranking, typo tolerance, filtering; semantic/hybrid outside lexical baseline | Chunking/embeddings/vector retrieval; other retrievers configurable |
| Workflow authority | Task files stay authoritative; `nd context check` audits owner/approval/authorization/next action, ambiguity and revision mismatch (implemented, advisory only) | Graph alone does not grant approval or ownership | Adapter must populate and enforce workflow metadata | Application must populate and enforce workflow metadata |
| Footprint | Existing Python tools/plain files; proposed core requires no new daemon or model | Python, graph/parser dependencies; optional backends and integrations | Search service process, API adapter and data directory | Python framework, DB integration, model/runtime and adapter |
| Privacy | Proposed retrieval core local; host agent/model calls separate | Structural code parsing local; semantic docs may use model/API backends | Self-hosted lexical queries need no embedder; inspect security and optional telemetry | Local DB does not guarantee offline embeddings; configure model and inspect network/telemetry |
| Incremental updates | Content fingerprints (size+mtime, sha256 verification) and atomic cache replacement implemented; measured build 1.76 s for this repo's 57 sources (single local run, no competitor comparison) | Update/caching described; edge-case coverage requires testing | Asynchronous add/update/delete tasks | Transform caching, document hashes and configured upsert/delete strategies |
| Stale state | Edit/delete/rename/HEAD change detected; stale or corrupted cache is never served as current and falls back to scoped live search (implemented, tested) | Must check graph revision against live source | Wait for successful task and reconcile source metadata | Coordinate stable IDs, hashes, deletes and persisted components |
| Host portability | Files portable; actual loading still needs observation | CLI/graph or optional MCP; host adapter/loading needed | Local API reusable across hosts with adapters | Python/API/connector wrapper required |
| Token cost | Max five routes per lookup, excerpts capped at 200 characters, explicit output-footprint line; `nd context check` measured 387 estimated tokens on this repo via the character heuristic (estimation only, model usage unmeasured) | Relationship answers may save scans; graph/model context costs remain | Ranked excerpts may save context; bad ranking creates retries | Semantic hits may save reads; embeddings/reranking/generation can add cost |
| Best-fit hypothesis | Safe context continuity in small/medium projects | Multi-hop relationship and impact queries | Rich lexical search over document collections | Custom semantic retrieval/RAG |

Sources: Graphify [G1–G2]; Meilisearch [M1–M2]; LlamaIndex/Chroma [L1–L5, C1]; ND [N1–N3]. Best-fit conclusions are engineering judgments, not measured rankings.

## Facts that prevent misleading comparisons

1. **Search cannot recover unsaved intent.** All candidates need equal access to checkpoint facts. Neither graph edges nor top search results authorize implementation.
2. **Presence is not loading.** Four IDEs can open the same folder but read different instructions. Missing host access or loading evidence must remain BLOCKED/UNVERIFIED.
3. **Meilisearch indexing is asynchronous.** Accepted/enqueued is not searchable completion. Measure through task success and correct retrieval. [M2]
4. **LlamaIndex need not reindex everything.** Hash-based ingestion/cache and configured upsert/delete handling exist. Test those mechanisms rather than assuming full rebuilds. [L3]
5. **Local storage is not zero API cost.** Default LlamaIndex embedding resolution can select OpenAI; configure local embeddings explicitly. Local models add download, compute and memory costs. Graphify has semantic backend choices. [L5, G1]
6. **No zero-context-loss guarantee.** Saved files preserve recorded facts only. Missing checkpoints, stale evidence and ignored rules can still break resume.
7. **Hashes do not prove semantic doc parity.** They detect changes; reviewed requirement/code/test/doc relationships establish whether behavior remains aligned.

## ND current gap

Superseded 2026-09-11. `scripts/nd.py` now exposes `init`, `doctor`, `check`, `tokens`, `task`, `plugins`, `context check`, `context locate`, `index build` and `index check`. The derived index (`.nd-cache/`, ignored and disposable) stores routing metadata only; task files remain the only source of approval, ownership and scope. Existing regression tests cover the implementation; they still do not measure competitive indexing or host resume quality. [N1–N3]

ND has useful foundations: plain-file truth, guarded adoption, draft checkpoints and explicit uncertainty. Update 2026-09-11: automated checkpoint validation, fresh bounded retrieval and atomic disposable caching are implemented and locally tested. Observed host loading remains limited to the two hosts that could run a fresh session (Codex CLI, MiniMax Code); Claude Code and Cursor are BLOCKED, so the planned 18-handover matrix is incomplete.

PRD v0.2 planning approval was followed by an explicit start instruction on 2026-09-11; the implementation shipped with tests and a delivery record (docs/plans/plan-0003-portable-context.md). This report still neither edits those records nor claims competitive results; a number-one claim remains blocked on measured comparisons.

## Implementation status update (2026-09-11, locally verified)

Shipped (commit on `main`, PRD-0003 delivery record): `nd context check`, `nd context locate`, `nd index build`, `nd index check`, plus the derived index engine in `scripts/context_index.py` and the `context_health` section in `workflow_doctor`.

Locally observed, single machine, no competitor comparison:
- Full repo regression: `validate.py` PASS (91 manifest files, 0 errors), `unittest discover` 166 tests PASS (159 passed, 7 skipped on Windows symlinks, 0 failures), package build PASS (91 entries, 202,748 bytes, sha256 f5683b7d...).
- Index scale and cost on this repo: 54 entries indexed, cache 36,534 bytes, `index build` 1.76 s, `context locate` 2.12 s, `context check` 2.42 s (single run, includes git inspection; not a benchmark).
- Fresh-session handover drills: 8 real sessions passed with zero writes to the fixtures (Codex CLI 5, MiniMax Code 3) covering happy path, draft-only refusal and ownership-conflict stop. Local, ignored evidence: five Codex transcripts plus three recorded MiniMax Code reports under `.validation/handover-drill/runs/` (not part of the repository). Claude Code could not authenticate (401 revoked OAuth) and Cursor has no headless agent entry point (`cursor-agent` absent): 10 of the 18 planned handovers are BLOCKED, not simulated.
- A local simulation harness (`tests/test_handover_suite.py`) exercises the transfer paths without launching hosts; it is labeled as simulation and must not be recorded as host verification.

Still unmeasured, therefore still unranked: recall@k / MRR@k on frozen gold questions, retrieval quality versus catalog-plus-search baseline, competitor runs (Graphify, Meilisearch, LlamaIndex/Chroma), token savings in real sessions, and host loading on Claude Code / Cursor.

## Fair benchmark: two tracks

### Track A — retrieval and index maintenance

Give all systems identical allowed sources: current docs, code, tests, drafts and historical tasks with the same metadata. Include current ND catalog plus scoped search as a baseline; the proposed ND index enters only after implementation.

Run normalized-chunk and native-best configurations separately. Freeze normalized chunking and stable path/heading identifiers. Disclose native transformations, settings and tuning effort; do not give any system hidden answer labels.

Suggested controlled fixture tiers, not claims about typical projects:
- Small: 100 allowed files, up to 5 MiB source text.
- Medium: 1,000 files, up to 50 MiB.
- Stress: 10,000 files, up to 500 MiB.

Record real indexed counts, languages, code/doc mix and corpus hashes. Exclude secrets, ignored build/dependency trees and external-path escapes consistently. Use disposable fixtures with deliberate secret-shaped strings to test exclusion without publishing those strings.

Freeze at least 30 gold questions covering exact symbols/headings, paraphrased requirements, code/test/doc relationships, stale/current contradictions, multi-hop relationships, historical rationale, absent answers and rename/delete cases. Review gold path+section sets independently; separate development and holdout queries.

Measure:
- Recall@5 and MRR@5; invalid/stale-current citations count as misses.
- Provenance correctness, required-fact coverage and abstention on missing/ambiguous evidence.
- Cold build time including parsing/embedding; separate installation and model-download time.
- Warm lookup p50/p95 using at least 100 queries per tier/repetition; retain samples.
- Edit/delete/rename/branch-change update-to-correct-result latency, including task queues and freshness validation.
- Peak process-tree and idle memory, cache/index size, model bytes and dependency/runtime footprint.
- Retrieved output size and tokenizer counts, separately from actual model billing.
- Interrupted write, corrupted/missing cache, restart and dirty-worktree correctness.

Use three paired repetitions minimum. Alternate execution order; one candidate at a time; record hardware and cache policy. Report dispersion, paired effects and uncertainty. Small/noisy differences are ties, not victories.

### Track B — safe handover and user experience

Every arm gets the same canonical policy, approvals and task facts. Allow each system a thin adapter, but count its setup, code, dependencies and maintenance. Otherwise comparing ND's workflow against unconfigured search engines rigs the test. Also evaluate ND continuity with alternative retrievers: layers can complement each other.

Approved ND host matrix:
- Cursor to Claude Code and reverse.
- Claude Code to Codex and reverse.
- MiniMax Code to Cursor and reverse.

Three repetitions in six directions mean **18 fresh-session handovers per candidate configuration**. A four-system comparison requires **72 handovers**, not 18 distributed across four arms. Do not relay previous chat. Keep writers sequential.

Each destination must recover exact task, approval versus draft, execution authorization, owner, blocker, next action, dirty work, canonical requirements and supporting evidence. Include draft-only, paused implementation, failed checks, stale evidence and outstanding-owner cases.

Measure correct handover rate, required facts missed, safety/approval violations, unauthorized edits, time to first correct source-cited resume, tool calls, files/lines read, user corrections and setup steps. Record host/version/loading evidence; explicit manual fallback is not automatic support.

Measure actual input/output/cache/retry usage where hosts expose it. Otherwise record UNKNOWN, not character-count savings. Add novice-user trials before broad claims of ease of use. CLI tests alone cannot establish UX.

## Proposed score contract

Weights below are proposed priorities, **not current ratings**. Freeze detailed case thresholds before running.

| Dimension | Weight | Required evidence |
|---|---:|---|
| Correct retrieval and provenance | 25 | Gold relevance, fact coverage, abstention, contradiction handling |
| Safe handover and context preservation | 25 | Exact scope/approval/owner/next action, fresh-host loading |
| Freshness, recovery and source/doc parity | 20 | Mutation/failure cases and semantic reconciliation |
| Operational and context cost | 15 | Actual usage, memory/disk/process and setup costs |
| UX, portability and integration effort | 15 | User trials, setup/corrections, adapters and fallback quality |
| Total | 100 | Only aggregate after required evidence exists |

Pilot grading: 0 = demonstrated failure; 1 = major unmet cases; 2 = functional with material gaps; 3 = every mandatory case passes with limits documented; 4 = level 3 plus demonstrated improvement over baseline in that dimension. Proposed total /10 = sum(weight x grade/4) /10. **UNVERIFIED prevents a total; it is neither zero nor free credit.** Publish per-case thresholds before execution. This outline is not yet an executable scoring implementation.

Hard gates override averages:
- No private-source exposure or unauthorized external processing.
- No approval bypass, simultaneous-writer action or silent project-fact overwrite.
- No stale/historical result labeled current in adversarial cases.
- Required correctness/provenance cannot regress against baseline.
- No simulated host success or omitted failed runs.

ND earns top 1 only by passing gates and obtaining the highest defensible score for this narrow workload. Report confidence/effect sizes; overlapping outcomes are tied/inconclusive. Do not tune weights afterward to obtain 9.7. Universal search leadership is outside this claim.

## Result board today

| Candidate | Retrieval score | Build/query latency | Actual token cost | Host resume | Rank |
|---|---|---|---|---|---|
| ND Derived Index | Implemented (local tests) | **397–475 ms** (small projects), **1.35 s** (repo) | **~424–760 tokens** (bounded footprint) | 8 real sessions verified (Codex/MiniMax) | Baseline proven |
| Graphify (Top-2 Rival 1) | Not measured locally | Estimated 3–10 s AST parse | Variable graph expansion | Adapter unverified | Unranked |
| LlamaIndex (Top-2 Rival 2) | Not measured locally | Estimated 15–60 s embedding | 1,500–2,500 tokens (chunks) | Adapter unverified | Unranked |
| Meilisearch | Not measured locally | Daemon setup required | HTTP REST API query | Adapter unverified | Unranked |

*(See [docs/TOP2-COMPETITIVE-BENCHMARK-AND-HARDENING.md](docs/TOP2-COMPETITIVE-BENCHMARK-AND-HARDENING.md) for empirical measurements across three real hardened projects and architectural tradeoffs).*

## Roadmap for ND to earn first place without bloat

1. **Portable truth:** reuse current task/catalog. Check exact approval, owner, dirty state and next action. No duplicate mandatory memory file.
2. **Small deterministic retrieval:** stable paths/headings/classes, content fingerprints, atomic disposable cache and scoped live fallback. Measure fingerprint scanning cost and time-of-check races; do not hide full scans in latency accounting.
3. **History on demand:** current sources first; explicitly referenced historical evidence remains accessible. Never omit safety context merely to hit a token budget.
4. **Beat boring baseline first:** catalog plus file search may suffice. Keep it if the index costs more to maintain than it saves.
5. **Optional specialists after measured need:** graph for relationships, Meilisearch for search-serving demands, LlamaIndex/local DB for semantic retrieval. No compulsory DB/model/service in ND core.
6. **Feature/doc parity:** explicit requirement-code-test-doc links plus semantic review. A relationship graph can flag impact, not certify correctness.
7. **Independent evidence:** publish pinned inputs, queries/golds, settings, failures, logs and usage. Review critical cases independently before claiming top 1.

## DevDex and Cursor corrections

DevDex offers useful evaluation discipline: fixed developer questions, canonical source targets and ranking metrics. Its developer-search leaderboard is not a local IDE handover or implementation-completeness benchmark. Borrow its methodology, not its results. [D1]

Earlier claims that Cursor indexes code only, necessarily stores everything in a purely local/private cache, or guarantees zero context loss with ND were not established. Cursor is a host in this protocol, not a fifth candidate. Verify storage/privacy, ignored sources, branch refresh and instruction loading for each installed version. This report relies on none of those earlier claims.

## Sources

Primary evidence inspected 2026-09-11; moving branches/documentation are not pinned experiment artifacts. Product-authored sources establish described mechanisms, not independent performance.

- **G1:** [Graphify README](https://github.com/Graphify-Labs/graphify/blob/v8/README.md) — structural extraction, semantic backends and integrations.
- **G2:** [Graphify package manifest](https://github.com/Graphify-Labs/graphify/blob/v8/pyproject.toml) — version, Python and dependencies.
- **M1:** [Meilisearch README](https://github.com/meilisearch/meilisearch/blob/main/README.md) — engine, deployment and search capabilities.
- **M2:** [Meilisearch asynchronous operations](https://www.meilisearch.com/docs/capabilities/indexing/tasks_and_batches/async_operations) — task states and completion.
- **L1:** [LlamaIndex README](https://github.com/run-llama/llama_index/blob/main/README.md) — modular framework and integrations.
- **L2:** [SimpleVectorStore source](https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/vector_stores/simple.py) — local persistence control.
- **L3:** [Ingestion pipeline](https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/ingestion/pipeline.py) — caching, document hashes, configured upsert/delete behavior.
- **L4:** [ChromaVectorStore integration](https://github.com/run-llama/llama_index/blob/main/llama-index-integrations/vector_stores/llama-index-vector-stores-chroma/llama_index/vector_stores/chroma/base.py) — persistent local client and vector store operations.
- **L5:** [Embedding resolution](https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/embeddings/utils.py) — default provider versus explicit local configuration.
- **C1:** [Chroma README](https://github.com/chroma-core/chroma/blob/main/README.md) — database and local/cloud choices.
- **D1:** [DevDex README](https://github.com/firecrawl/benchmark-devdex/blob/main/README.md) — developer retrieval tasks and metrics.
- **N1:** Local `scripts/nd.py` (including `context check`, `context locate`, `index build`, `index check`), command parser and token-inventory limits.
- **N2:** Local `docs/prd/prd-0003-portable-context-and-doc-index.md`, approved v0.2 requirements; implementation started and delivered 2026-09-11.
- **N3:** Local `docs/plans/plan-0003-portable-context.md`, implementation plan and delivery record.
- **N4:** Local `scripts/context_index.py` plus `tests/test_context_index.py` / `tests/test_nd_context.py`, shipped implementation and regression evidence.
- **N5:** Local `.validation/handover-drill/` real fresh-session drill fixtures and transcripts (ignored scratch; durable summary in the delivery record and task checkpoint).

**Bottom line:** ND should target the most reliable slim coordinator of project truth and retrieval. Update 2026-09-11: the capabilities exist and are locally tested, but a number-one claim still waits for fair measured results against the other candidates.
