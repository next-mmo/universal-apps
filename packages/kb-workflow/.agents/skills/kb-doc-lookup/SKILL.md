---
name: kb-doc-lookup
description: Find existing project specifications, architecture, decisions or task records using topic/status filters and bounded reads. Use for documentation lookup or a task-status listing; do not turn a lookup into an implementation audit.
---

# Documentation Lookup

[docs/README.md](../../../docs/README.md) is the single topic catalog. Do not maintain a second routing matrix here. [WORKFLOW.md](../../docs/WORKFLOW.md#documentation-lifecycle) owns document retention and current-state rules.

## Find the right record

1. Start with the known task ID or domain. Search catalog headings or the relevant directory with `rg` (or `git ls-files` + a text search); use `Select-String` on Windows if unavailable. Reuse paths and contents already in context.
2. Filter before paging. Sort paths consistently, show 10 results by default with the total and next offset when more exist, then open only the selected record. Honor a request for all results; use batches rather than silently omitting matches.
3. Search the selected document for the heading/symbol, then read at most 50 lines around it. Continue only when the decision requires the next section. Do not truncate an acceptance criterion midway and assume it passes.
4. Return the answer and its source path/section. Stop once the question is answered. Archived tasks and historical plans require a relevant historical lookup, not routine orientation.

Some repositories add a local documentation index CLI (for example under `.agents/workflow/`). If one exists and is verified, prefer its bounded `find`/`show` commands and treat its reported source-hash freshness as a hint, not proof of semantic correctness. Otherwise, and always as the fallback, use path/text lookup.

## Code-to-document review

For a documentation-sync or drift-repair request, use [kb-sync-docs](../kb-sync-docs/SKILL.md). It owns task-scoped impact review, source-backed edits and post-move consistency checks. A lookup request alone does not trigger that audit or edits. Missing mappings and unchanged hashes do not establish semantic correctness.

## Task status fast path

For "show tickets", default to TODO, WIP and REVIEW; for "active tasks", also include blocked. Honor explicitly requested statuses. REVIEW means awaiting human verification/acceptance, not completed. The filename prefix is status, and task metadata/current summary owns progress, blockers and next action.

PowerShell discovery example:

```powershell
$taskPaths = @(git ls-files --cached --others --exclude-standard -- 'docs/tasks/todo-*.md' 'docs/tasks/wip-*.md' 'docs/tasks/review-*.md' | Sort-Object -Unique)
$offset = 0
$taskPaths | Select-Object -Skip $offset -First 10
"Total: $($taskPaths.Count)"
if ($offset + 10 -lt $taskPaths.Count) { "Next offset: $($offset + 10)" }
```

This is a shell example, not a new `docs-query` command. For another page, increment the offset; for a topic, filter paths or search matching task headings before paging.

Read metadata and the current summary of returned tasks only. Report ID/title, status, progress and blocker/next action; use "Not stated" for missing fields. Do not inspect code, diffs or run tests for a status listing. For prioritization, ownership, board drift or claiming work, use [kb-task-triage](../kb-task-triage/SKILL.md). For an explicit implementation audit, compare acceptance against code and verification evidence.

## Lookup limits

- A broad documentation inventory is appropriate when explicitly requested; it is not the default lookup path.
- If a link is stale, search the exact ID/slug before widening. Check lifecycle/date and code evidence before treating a historical design as current architecture.
- Do not fabricate catalog completeness or infer implementation from a checked box. Return a precise unresolved question when the source is insufficient.
