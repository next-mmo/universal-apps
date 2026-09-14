---
id: "0004"
title: "Large-project retrieval speed and token efficiency"
status: approved
last-audit: 2026-09-11
---

# Change Proposal: Find correct project evidence with less repeated work

Approved scope v0.1; planning only. Approval metadata reconciled 2026-09-11 without changing LP-001–LP-008. This is a separate performance extension, not a replacement for approved portable-context PRD-0003. Implementation remains unauthorized.

## Problem and scope
- User: developers using multiple agents on large local projects. Repeated broad scans, duplicated document reads and stale results waste time/context and risk incorrect implementation.
- Outcome: faster evidence discovery with lower total read/model cost, while preserving policy, requirements, approval, provenance and feature/doc consistency.
- Selected direction: same-folder/same-machine, four hosts from PRD-0003; local-first, dependency-light, source remains truth. Reuse one future index contract across hosts. Save/park PRD-0003, draft this scope separately.
- In scope: incremental inventory/index updates, bounded retrieval and output expansion, explicit source relationships, measurement and safe fallback. Index code text, tests and current docs; do not claim AST understanding without supported parsers.
- Non-goals: custom graph database or language parser suite; embeddings/model calls in core; mandatory server/daemon; external uploads; replacing IDE indexes; cloud synchronization; automatic task archive moves; installing Graphify/Meilisearch/LlamaIndex; claiming top 1 or 9.7 without tests.
- Open inputs: representative project path/corpus, size/languages, hardware and user-important latency/memory limits. Do not scan outside current workspace without authorization. Draft permits disposable future fixtures; no real project benchmark authorized yet. Absolute SLOs remain unset until baseline and user agreement.

## Approval record
- Scope approval: approved v0.1, LP-001–LP-008; reviewed requirements unchanged.
- Approver/date: user, 2026-09-11, explicit scope-approval questionnaire ask_7d1216a9667b262bf6f2549a (submittedAt 1789066575370).
- Evidence: "Approve PRD-0004 v0.1 scope; planning only, no implementation" selected after presentation of exact requirement IDs, candidate backend and exclusions.
- Approved exclusions: custom graph engines, model calls in core, mandatory services, uploads and automatic archiving. SQLite FTS5 remains an evaluation candidate. Real-project inputs and performance budgets remain to be agreed before experiments.
- Execution authorization: further planning only. No coding, installation, benchmark execution, changes to agent rules or live indexing authorized; separate explicit start instruction required. Material scope changes require renewed approval.
- PRD-0003 v0.2 approval remains separate. Changes affecting PC requirements return those affected changes for renewed approval; this draft cannot silently weaken them.

## Canonical targets and baseline
- New implementation baseline: none. Existing scripts/nd.py provides tooling but no proposed context/index commands; portable-context cache and handover tests remain planned.
- Recorded project baseline: ec5db2a3208e1e02101ca50ca1534992dcf69f7e plus existing dirty state, revalidate before implementation.
- Related contracts: PRD-0003 PC-002/003/004/007/008/009/010 cover classification, lookup, freshness, explicit evidence links, evaluation and history. This PRD specifies performance constraints and engine-selection gates, not another ownership model.
- Intended consumers: scripts/nd.py, scripts/workflow_doctor.py, future shared retrieval module/tests, docs/README.md, docs/HANDOVER.md, and nd-doc-lookup routing. Exact new module paths finalized only after approval.
- INDEXING-BENHMARK.md is source-backed comparison and proposed protocol, not an approved executable test suite or measured performance evidence.
- Integration owner: root mvs_448dca7eb404481d83851b9e2888d65b. Prior task: docs/tasks/task-0007-portable-context-spec.md. New task: docs/tasks/task-0008-large-project-retrieval-spec.md.

## Requirement changes

### ADDED
- **LP-001 — One incremental inventory.** Index only allowed source roots. Track paths, document class, headings/identifiers, content fingerprints and schema/generation. Initial inventory may scan allowed corpus; repeat lookups must not silently parse or hash every unchanged file. On verified single-file changes update affected entries, deletes and derived links without full content rebuild. Measure directory enumeration/Git status work too; do not hide it outside timings. Explain full invalidation/rebuild when required by version/branch/ignore changes. No duplicate per-host ND caches.
- **LP-002 — Truthful freshness.** Distinguish candidate-source freshness from whole-corpus completeness. Revalidate returned excerpts against live source; size/mtime alone cannot prove unchanged content. Added/untracked files or unreliable change signals must not cause a false "no result/current complete" claim. Return freshness/completeness state and scoped fallback/reconciliation route. Exercise same-size timestamp-preserving edits, branch switches, races between lookup/read, renames/deletes and offline cache corruption. A full reconciliation may cost more and must be explicit; no impossible promise of global freshness with zero observation.
- **LP-003 — Bounded evidence, not missing requirements.** Default response proposes at most five routes with short excerpts, identifiers and provenance; expose truncation, filters and explicit expansion/paging. Aggregate snippets and avoid duplicate overlapping chunks. Safety, current scope and required dependencies cannot be silently omitted to fit budget. History defaults out unless requested or a current source explicitly requires historical evidence; never remove current requirements solely due age. A later unchanged generation/query may reuse routing, not assume another host remembers prior output or skip live evidence checks.
- **LP-004 — Small optional relationship table.** Store only source-backed explicit requirement/code/test/doc links with origin, type and freshness. Traverse under a bound with cycle detection; show missing links and conflicts. Do not infer undocumented approval or semantic truth from an edge. Regex/symbol-name coincidence is not a proven call graph. AST extraction or semantic inference would need separately approved scope. Broken relationship routes trigger inspection, not automatic doc rewrites.
- **LP-005 — Backend choice by evidence.** Evaluate existing scoped search and compact-index baseline before selecting a store. SQLite FTS5 through available Python sqlite3 is a candidate, not installed dependency or selected design. Verify packaged runtime capability, tokenizer behavior and memory/query characteristics. If FTS5 absent, use supported bounded source fallback or explicitly unavailable optional index; never auto-install. Keep storage hidden behind shared PC interface, no compulsory external service. Choose backend only when correctness is non-inferior and measured performance/maintenance warrants it.
- **LP-006 — Shared-cache integrity.** Separate index writer lock from task ownership. Multiple readers may coexist, but no overlapping live application writers authorized. Cache generations, atomic publish/transaction and consistent excerpts prevent mixed snapshots. Timeout/lock contention returns explicit busy/fallback. Cache corruption/schema migration recovers by replacing only owned derived artifacts; source facts and unrelated files remain untouched. Exclude secrets, ignored dependency/generated trees, symlink/reparse escapes and file paths outside approved roots. Existing policy overrides requested indexing scope.
- **LP-007 — Measured efficiency with correctness gates.** Frozen queries/golds and paired runs measure full request latency, cold setup/build, update-to-correct-result time, file/content bytes read, output bytes/tokenizer counts, peak process memory and index size. Actual host input/output/cache/retry usage reported separately; chars/4 is only labeled estimate. Unknown usage stays unknown. Improvement must not increase missed mandatory facts, safety violations, stale-current answers or semantic doc drift. No token saving claimed from discarded requirements, test omissions or unavailable hosts.
- **LP-008 — Adopt or retain baseline.** After approval, use at least 30 fixed questions across small/medium/large allowed-text fixtures and three paired repetitions with recorded cache policy/hardware. Proposed tiers from comparison: 100/1,000/10,000 files up to 5/50/500 MiB; these are test suggestions, not approved real-project limits or SLOs. Collect at least 100 lookups per tier/repetition for descriptive p50/p95; report variability, failure cases and paired effects, not only averages. Require no mandatory-correctness regression and observed reduction in read volume/latency or total model usage on targeted workload before default cutover. If added complexity fails to pay off, keep simpler search. Actual threshold and representative corpus fixed before measured experiments, not tuned afterward.

### MODIFIED / REMOVED
None to approved PC-001–PC-010. Implementation must reconcile shared commands, cache schema, docs and tests rather than maintain a competing engine. Requirement conflict blocks cutover until resolved and approved.

## Design impact and decisions
- Proposed sequence: workload contract; existing-search baseline; incremental shared inventory; FTS5 versus bounded baseline decision; bounded retrieval and explicit links; failure tests; measured cutover. See draft plan-0004.
- Source facts stay canonical. Cache/index is disposable, ignored and model-free; location remains shared with PRD-0003. Proposed command names in prior PRD remain proposals, not executable documentation.
- No custom graph now. A small relationship table addresses known requirement/doc routes without parser/model platform costs. Existing graph tools can be evaluated later only if multi-hop failures justify them.
- No mandatory extra documentation per task. Reuse existing IDs/checkpoint fields; generated route metadata must be derivable or explicitly sourced. Missing labels cannot hide active tasks with filenames other than wip-*.
- Same-folder multi-host access does not guarantee native tool discovery. Host acceptance remains PRD-0003's responsibility; this extension must not count adapter mocks as real transfer passes.

## Acceptance and delivery
- [ ] LP-001/002: changed-content reads bounded to affected sources on verified single-file update; trace proves no hidden full reparse. Same-size preserved-mtime mutation still detected before evidence labeled current; uncertain global inventory reported honestly.
- [ ] LP-003/004: query returns bounded attributable evidence; expansion reaches all required facts. Historical conflict, duplicate route, cycle, dangling link and unknown answer handled without false authority.
- [ ] LP-005: source-search baseline and optional backend compared on same corpus; FTS5 absence tested without installation. Storage unavailable never means project has no evidence.
- [ ] LP-006: concurrent readers/writer, lock timeout, interruption, corrupted DB, symlink escape, ignore changes and schema migration use only owned cache artifacts; source bytes unchanged.
- [ ] LP-007/008: fixed experiment settings/golds before measurement, independent critical-case review, paired raw logs with source hashes; no unsupported total score or savings. Explicit actual-vs-estimated token accounting.
- [ ] Combined PC regression: preserve all prior approval/ownership/source/host requirements. Cross-host tests not duplicated; reuse fresh relevant evidence or run affected PC cases. Missing evidence remains blocked/unverified.
- Risk: high shared retrieval and data-integrity boundary. Independent review before default cutover. No release without execution authorization and successful required gates.
- Rollback: switch to canonical source search; preserve failed cache evidence in approved local backup if needed, rebuild derived store later. Never roll back project content to match old cache.
- Reconciliation: compare shared PC baseline and current files, update canonical behavior docs and package closure only after implementation. Draft/planning completion does not mean integrated or deployed.
