---
name: kb-sync-docs
description: Audit and repair documentation drift after code changes, feature delivery or folder moves. Use for requests to sync docs with code or check documentation consistency; ordinary document lookup belongs to kb-doc-lookup.
---

# Documentation Sync

Use [WORKFLOW.md](../../docs/WORKFLOW.md#documentation-lifecycle) for authority and [folder ownership](../../docs/WORKFLOW.md#folder-ownership) for placement. This skill routes source-backed documentation review; it cannot certify semantic agreement automatically.

## Choose the review scope

Start with the active task and its changed files. In a shared checkout, prefer explicit task-owned paths to the entire dirty tree. For an explicit whole-repository request, inventory relevant domains and cover them in bounded batches; do not silently turn a sample into an all-docs claim. For a review-only request, report findings without editing. For an authorized sync/fix, apply supported documentation repairs directly.

Map each changed source file to the documents that describe it: follow explicit `sources:` frontmatter mappings where the project uses them, then search the catalog and the exact affected symbols/paths for gaps. Unmapped files mean unknown coverage, not "no docs affected." Inspect unsupported or unmapped files manually; supported code extensions typically include `.go`, `.py`, `.rs`, `.ts`, `.tsx`, `.js`, `.svelte`, `.json`, `.toml`, `.sql`.

## Reconcile claims, then repair

- Follow explicit source mappings, then search the catalog and exact affected symbols/paths for gaps. Unmapped files mean unknown coverage, not "no docs affected." Add a `sources:` mapping only after inspecting the relationship; preserve each file format's supported metadata schema, including skill frontmatter.
- Compare implementation claims with current code and existing relevant test evidence. Approved requirements express intended behavior: record a code/requirement mismatch rather than rewriting the requirement to match an implementation bug. An edited date, unchanged hash, linked report or checked box is not verification.
- Update the narrowest canonical document. Product design and architecture remain in `docs/`; agent procedures/tools/research follow folder ownership. Preserve superseded decisions and raw evidence as history. Fix navigational paths after moves without changing historical results or replacing missing evidence with new measurements.
- Reconcile changed commands, relative links, imports, source mappings and catalog/task pointers. Do not mirror documents across folders or create a recap solely to announce synchronization. Surface unavailable legacy sources and unresolved semantic claims in the existing task.

## Refresh and verify

If the repository ships a local documentation index, refresh it once after a folder migration or explicit rebuild request; do not delete caches as routine maintenance. Reindexing updates retrieval, not document accuracy.

Check the changed links and diff, and perform a bounded lookup of the repaired document. If task/board pointers changed, run `python .agents/skills/kb-task-triage/scripts/task_drift.py`. Reuse valid code/test evidence; docs-only repairs do not require product builds. If tooling code changed, run the affected tool tests.

Report the reviewed scope, repaired documents, checks actually run and unresolved coverage/claims. State "reviewed these files" rather than "everything is synced" unless the requested full scope was actually verified. Use the existing closeout learning rule for durable corrections; no separate reindex skill, routine full audit or new memory log is required.
