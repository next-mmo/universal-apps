# Technical Plan: Large-project retrieval speed and token cost

## Objective & Context
- Mode: planning only; approved requirements, execution not authorized. Not an executable implementation assignment.
- PRD: docs/prd/prd-0004-large-project-retrieval-efficiency.md, approved v0.1, LP-001–LP-008.
- Approval: user questionnaire ask_7d1216a9667b262bf6f2549a, 2026-09-11: "Approve PRD-0004 v0.1 scope; planning only, no implementation". This records scope approval, not independent approval of a selected backend, performance budgets or executable experiment design.
- Status: six conditional phases retained unchanged; none started. Coding, installations and benchmark execution require separate explicit start instruction.
- Outcome: reduce repeated source reads, latency and real model context costs without losing correctness or safety.
- Dependency: saved approved PRD-0003 v0.2 and plan-0003. Reuse its future interfaces/cache; neither feature is implemented yet. Only overlapping requirements are referenced here, not reapproved.
- Workload: same-folder local projects, existing four-host scope. Representative project, hardware and absolute performance budgets pending; no external scans or benchmark runs authorized.

## Architecture Impact
- Potential integration points: existing nd CLI/doctor, future shared PC retrieval module and tests, doc-lookup behavior, package manifest. Exact module paths decided after approval.
- Candidate backend: SQLite FTS5 if available through runtime; compare against bounded source search/compact index. No selection or installation now. No graph engine, embedding model, external service, daemon or custom parser suite.
- State: one versioned derived cache per project, stable provenance, explicit link table, content checks, generations and writer lock. Cache state never grants task ownership.

## Conditional Execution Phases
Each phase requires approved scope and explicit implementation start; checkboxes indicate future work, not current progress.

### Phase 1: Workload and correctness contract
- Freeze allowed corpus, representative queries/golds, hardware, host instrumentation and acceptance thresholds. Record excluded inputs and unavailable metrics.
- Map LP IDs to PC consumers; preserve current source authority and handover approval gates.
- Gate: reviewed experiment manifest and baseline plan; no promised top-1 score.
- Rollback: revise draft if workload requires new services/privacy scope; do not benchmark unrelated files.

### Phase 2: Incremental inventory and freshness
- Build shared inventory and changed-entry updates; trace bytes read/scanned and generation state. Revalidate candidates against live source; distinguish result freshness from corpus completeness.
- Inject deletion/rename/branch/ignored-file/same-size-mtime races and lock contention.
- Gate: no stale-current claims or source mutation; uncertain signals yield explicit fallback.
- Rollback: disable cache path; use source search. Preserve only owned failure evidence, not stale facts as truth.

### Phase 3: Backend decision
- Check runtime FTS5 capability only after implementation start; baseline comparison includes all validation/setup overhead.
- Prototype one optional local backend behind shared PC contract, not separate IDE caches. Keep no-FTS fallback.
- Gate: correctness parity plus defensible cost improvement; otherwise retain baseline. No dependency install without permission.
- Rollback: retain baseline interface/store, mark optional backend unsupported; no source conversion.

### Phase 4: Bounded lookup and explicit relationships
- Rank current evidence; bounded excerpts, paging/expansion, deduplication, historical opt-in and exact link provenance. Preserve safety-relevant exceptions.
- Add small explicit requirement/code/test/doc link table with cycles/missing targets visible; no inferred call graph.
- Gate: all required facts reachable, draft/history never promoted to authority, output volume traceable.
- Rollback: disable relationship expansion while preserving direct source routes and PC checks.

### Phase 5: Paired performance and failure rounds
- Execute LP-008 fixture tiers and held-out questions, three paired rounds, stable hardware/settings; report cold/warm/update latency, read volume, process memory, index size and actual usage when exposed.
- Count retries and incorrect/blocked runs; compare current source-search baseline. Independent reviewer validates critical correctness and safety cases.
- Gate: no regression in mandatory PC facts and evidence; performance effect large enough to justify maintenance, otherwise no cutover.
- Rollback: retain baseline; publish failed/neutral evidence, not adjusted rubric.

### Phase 6: Reconcile and deliver
- Reconcile all shared PC/LP interfaces and canonical docs; update package closure and exact task checkpoint. Preserve all approved PC requirements.
- Gate: focused and full regression tests, extracted-package checks and applicable real-host PC acceptance. Block unavailable mandatory checks explicitly.
- Rollback: revert only authorized implementation-owned changes through reviewed recovery; no blanket reset of dirty work.

## Verification Strategy
- No new test commands exist yet. Derive exact source-backed commands and fixture paths during authorized implementation; do not run guessed CLI names from this plan.
- Maintain requirement-to-evidence table and revisions/hash fingerprints. File-size estimates and actual usage separate.
- Existing PC host trials remain 18 for that feature; this spec adds retrieval/performance cases, not a duplicate host framework or four-product benchmark mandate.

## Rollback & Safety
- Cache is replaceable; source is not. No automatic deletion, commits, releases, installs or uploads.
- Race/uncertain inventory must trade speed for truthful fallback, never silently relax freshness.
- Outstanding decisions: representative corpus/hardware and quantitative SLOs before experiments; shared schema/backend after comparative evidence. Graph/embedding expansion requires separate approval.
