---
id: "0003"
title: "Portable Context and Freshness-Aware Documentation Retrieval"
status: in-progress
last-audit: 2026-09-11
---

# Change Proposal: Resume across IDEs without replaying project history

Approved scope version: v0.2 (same-folder, same-machine; three host pairs selected). Supersedes v0.1. Saved/parked on 2026-09-11 at user request; implementation started the same day on an explicit start instruction ("ship approved portable-context") from root session mvs_3ff09dcbef3243c5bdd515853158a204. Delivery record: docs/plans/plan-0003-portable-context.md and docs/tasks/wip-0007-portable-context-implementation.md. Status-only reconciliation retains approved PC-001–PC-010 unchanged. New performance proposal: docs/prd/prd-0004-large-project-retrieval-efficiency.md; it does not replace or inherit this approval.

## Problem and scope
- User problem: switching IDEs loses context; agents repeatedly scan docs, miss facts, or rely on stale indexes. Desired outcome: a fresh agent finds current intent, policy, source, decisions and evidence quickly without reading archived work by default.
- In scope: portable task checkpoints; one small canonical catalog; explicit current/active/historical classification; freshness-aware local retrieval; host-loading verification; optional future graph comparison.
- Non-goals: migrate hidden chat/model state, guarantee any IDE loads files, replace IDE code indexes, build a graph database, install Graphify/MCP, upload private repositories, auto-archive/delete files, or certify a 9.7 score.
- Approved design direction: local-first Markdown/source retrieval with a disposable derived cache. No embeddings, model calls, daemon or new runtime dependency in core. Planning authorized; implementation still requires explicit start instruction.
- Selected requirements: questionnaire ask_9900199bb1e58b830d4e48ad, answered 2026-09-11: "a,b,c" interpreted as the first three offered pairs (Cursor/Claude Code, Claude Code/Codex, MiniMax Code/Cursor); topology explicitly same folder on same machine. Four hosts, three pairs, six transfer directions. Host versions and available loading routes must be recorded during later implementation discovery; selection is not proof of compatibility.
- Privacy: ND core performs no external content processing. Existing host/model policies remain separate; no new upload, connector or global configuration authorized. Graphify is outside core implementation scope, so exact candidate selection can wait for an optional experiment.
- Same-folder scope excludes file transfer, clone/worktree synchronization and proprietary chat/index export. Agents switch sequentially, not concurrent writers. A changed checkout, inaccessible work or outstanding owner blocks resume until reconciled.

## Approval record
- Scope approval: approved, draft v0.2, PC-001 through PC-010.
- Approver / date / approved IDs: user via questionnaire ask_805260986ad34321c514253f, 2026-09-11. Approved IDs: PC-001 through PC-010 inclusive.
- Approval evidence: explicit "Approve v0.2 scope; prepare implementation plan only" selection on presented scope summary naming all requirements, host pairs, topology, inclusions and exclusions.
- Execution authorization: planning authorized by the questionnaire answer. Implementation authorized separately by the explicit start instruction "ship approved portable-context" (2026-09-11). The questionnaire answer alone was not a start instruction; this line records that the separate gate has been passed.

## Canonical targets and baseline
- Baseline HEAD: ec5db2a3208e1e02101ca50ca1534992dcf69f7e plus existing dirty working tree; reconcile again before implementation.
- Current routes: docs/README.md, sections Documentation Catalog and Project-specific routes; docs/tasks/README.md for task lifecycle; docs/HANDOVER.md for pause/resume and cold drill.
- Current instruction consumers: AGENTS.md, CLAUDE.md, .agents/skills/nd-doc-lookup/SKILL.md, .agents/skills/nd-task-status/SKILL.md and host export rules in scripts/build_plugins.py.
- Current diagnostic surface: scripts/nd.py and scripts/workflow_doctor.py. Existing token estimates do not measure host loading.
- New capability: deterministic derived retrieval cache/freshness and host-transfer acceptance harness have no established implementation baseline.
- Integration owner: root session mvs_448dca7eb404481d83851b9e2888d65b authored the parked scope. Implementation ownership transferred to root session mvs_3ff09dcbef3243c5bdd515853158a204 (recorded in docs/tasks/wip-0007-portable-context-implementation.md) after a concurrent-writer collision on the same working tree; a single writer owns the implementation. Scope overlaps prior CLI hardening and existing PRD-0002 host/skill work; preserve adopted skill selection and safety gates.

## Requirement changes

### ADDED
- PC-001: Portable resume contract. Given a completed handoff checkpoint, a fresh agent must identify exact active task, approved scope versus draft, owner, revision/dirty-work access, blockers, next action and relevant evidence without earlier chat. Missing or inaccessible work blocks execution; index content never grants approval. Reuse existing TASK Resume State, not a duplicated SESSION.md.
- PC-002: Source-backed catalog. Each indexed entry exposes repo-relative path, heading/stable identifier, document class (current policy, current behavior, active task, draft, historical), related topic/requirement IDs when present, and source fingerprint. Index contains routing metadata, not rewritten project facts. Source contradictions remain visible.
- PC-003: Bounded retrieval. Default lookup ranks current authoritative docs and explicitly selected active task, returns a proposed maximum five routes with bounded excerpts and expansion instructions. Never load full archive or graph automatically. An explicit history lookup may search completed tasks. Missing entries trigger scoped source search; absence from cache never proves absence from repository.
- PC-004: Freshness and recovery. Given file edit, rename, deletion, branch change, changed HEAD or dirty worktree, stale cache cannot silently serve current evidence. Detect mismatches, invalidate affected entries, and return scoped live search or explicit stale status. Cache writes use atomic replacement; interruption leaves prior valid cache or no cache. Exclude secrets, ignored dependency/build trees, external links and reparse escapes. Non-Git projects use content fingerprints.
- PC-005: Host adapter contract. Selected hosts use minimal native entry points pointing to the same canonical policy/catalog; do not duplicate entire policy or change user settings silently. Detect existing custom instructions and preview conflicts. A fresh-session test must demonstrate actual loading by locating task, policy boundary and source evidence; files being present is not success.
- PC-006: Context handoff check. A read-only check reports checkpoint completeness, source accessibility, missing anchors, ambiguous active tasks, stale revision/evidence and unverified host loading separately. Proposed CLI names: nd context check, nd context locate, nd index check/build; final names remain design choices after scope approval.
- PC-007: Dependency/evidence links. Prefer explicit links and requirement IDs for requirement-to-code-to-test-to-doc navigation. If implementation changes a recorded consumer, flag related docs for reconciliation. Hash/link checks cannot prove semantic agreement; require source/test review for behavior changes and retain an UNKNOWN state.
- PC-008: Reproducible local retrieval benchmark. Use fixed project questions and gold source/section sets, correctness checks and fresh host sessions. Compare current catalog+scoped search against derived lexical lookup. Optional Graphify arm only with separate approval and pinned version. Same task, source revision, model settings and budgets; report cold build, warm lookup, update latency, recall@k/MRR@k, correct resume, missed safety/approval constraints, tool/read volume and actual usage when available. Failed runs count as failures; unavailable metrics stay unknown.

### MODIFIED
- PC-009: Full lookup behavior. Begin with applicable policy, exact task checkpoint and matching catalog route; verify current source and expand only as needed. Do not reconstruct current behavior from stacked proposals. Archived work remains historical even if a graph ranks it highly. Safety/context requirements override an excerpt budget; exceeding budget is explicit, not silent truncation.
- PC-010: History eligibility. Done tasks leave the active route when completion is verified. Archive lookup remains opt-in unless directly referenced by current work. Prior suggestion of a 14-day archive interval is not approved automatic scheduling; age alone cannot archive unresolved acceptance, active dependencies or the only copy of current requirements. Moving files and updating links is a separate reviewed scope.

## Design impact and decisions
- Recommend portable truth first, deterministic retrieval second, optional graph last. Reuse docs/README.md and task Resume State; no second hand-maintained catalog or per-task index ceremony.
- Derived cache location/schema to be finalized; suggested ignored .nd-cache/ with documented schema version and fingerprint. Must be rebuildable without model calls; moving IDEs within same checkout must work without transferring proprietary indexes.
- A graph can help multi-hop calls/imports and impact questions. It cannot restore unsaved intent, transport inaccessible uncommitted work or prove host instruction loading. Inferred graph edges remain hypotheses with provenance, never authoritative requirements.
- Separate source transport from context retrieval: separate machines/worktrees require approved file/Git sharing and state reconciliation. No automatic commits or uploads.
- Do not copy DevDex leaderboard into ND score. Its fixed golds, failures-as-misses and citation-ranking measurements are useful methodology; developer web search differs from local handover and implementation acceptance.

## Acceptance and delivery
- [ ] PC-001/005/006: Test Cursor to Claude Code and reverse, Claude Code to Codex and reverse, MiniMax Code to Cursor and reverse. Three fresh-destination-session repetitions per direction (18 handovers), sequentially in the same approved disposable project folder on one machine. Do not relay prior chat. Source host records checkpoint and releases ownership; destination reads canonical policy/task/catalog and verifies revision plus dirty state before acting. Identify exact scope, approval, owner, blocker, next action and source evidence. Zero safety/approval boundary violations. Include draft-only, paused implementation and stale-evidence scenarios. Missing host access is BLOCKED, never simulated success.
- [ ] PC-005: For each of four hosts, record version, native instruction route and observed loading evidence. Preserve custom instructions and disabled skill selection. If native auto-loading cannot be demonstrated, offer an explicit read-entrypoint fallback and label it manual; do not claim automatic portability.
- [ ] PC-001/004: Shared-folder tests deliberately change files between hosts and leave an outstanding writer once. Destination must detect invalidated evidence or ownership conflict, not trust old cache or start overlapping edits.
- [ ] PC-002/003/009: Baseline catalog and new lookup tested on at least 20 fixed questions, including a missed catalog entry, duplicate topic, historical contradiction and unknown answer. Report relevance/correctness and lookup effort, not only speed.
- [ ] PC-004: Inject edit/rename/delete/branch-switch/dirty-state/interrupted-write cases. No stale result labeled current; source search remains usable with cache absent or broken.
- [ ] PC-007/010: Change a feature contract; identify impacted current doc/test routes without promoting a draft or archived decision to truth. Link consistency pass is not semantic parity certification.
- [ ] PC-008: Three paired retrieval repetitions under recorded conditions. Adopt derived lookup only if correctness does not degrade and observed read/latency cost improves; actual token savings remain unclaimed where usage instrumentation is unavailable.
- [ ] Windows packaged-user path, source closure, custom policy preservation and selected-skill compatibility verified. No private data leaves machine; no new background service required.
- Risk: high shared instruction/discovery boundary. Require scope approval, independent review and protected fixture testing before changing default host routing. Cache rollback is discard/rebuild; live facts never overwritten by generated output.
- Reconciliation: update canonical handover/catalog/routing docs only after implementation evidence; preserve PRD as proposal history. No deployment under specification scope.

## Research evidence and limits
- DevDex source at 24e60473887d33960bf155a9e73affcd07d288a3: https://github.com/firecrawl/benchmark-devdex/tree/24e60473887d33960bf155a9e73affcd07d288a3 . README describes repo/docs/issue-PR retrieval, fixed canonical-URL scoring, recall@10/MRR@10, public subset and controls. prompts.py independently confirms tool-based search/citation tasks, not cross-IDE resume or feature completion. Vendor-owned published results, not reproduced here.
- Graphify candidate: https://github.com/Graphify-Labs/graphify/tree/v8 . README describes local tree-sitter code graph and optional model/API semantic document processing; pyproject.toml inspected reports graphifyy 0.9.57, Python >=3.10, networkx/numpy/many parser dependencies and optional MCP/watch/backend extras. Moving branch, not pinned experiment. Claimed platform compatibility and benchmark gains not locally verified.
- Graphify can be optional; not minimal dependency footprint for core ND. Explicit extracted and inferred edges are useful design precedent.
- General web search unavailable due user plan balance; direct GitHub primary sources accessible. No installation, benchmark run, UI test or implementation performed.
