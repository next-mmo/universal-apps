---
name: nd-doc-lookup
description: Fast documentation and architecture lookup. Use when looking for existing PRDs, design specs, runtime architecture, or prior task records. Prevents token waste by routing directly to the right document and enforcing bounded reads.
---

# Documentation Lookup & Token-Saver Routing

This skill provides fast, targeted routing across `docs/` (PRDs, architecture, design specs, task archives) without flooding context with large files or exploratory globbing.

---

## When to Run This Skill

- When the user asks about an existing feature specification (e.g. *"What was the spec for auth?"*, *"Where is the API PRD?"*).
- When planning work that touches an established architectural boundary or database schema.
- Before creating a new PRD, to verify if prior art or related specifications already exist in `docs/prd/`.

---

## Routing Procedure

1. **Check context index or catalog first**:
   Run `nd context locate "<topic>"` (or inspect `docs/README.md`) for bounded routes (max five) and exact excerpt pointers. If the index is absent, stale or corrupted, fall back to scoped live search; the command does this itself and reports which path answered. Absence from the cache never proves absence from the repository.
2. **Resolve task state from task files**:
   For approval, ownership, blocker or next-action questions run `nd context check` first; it reads task files (not the index) and reports missing checkpoint fields, ambiguous wip tasks, missing catalog anchors, cache freshness and revision mismatch.
3. **Search before reading**:
   Use the available content-search tool for targeted keyword or symbol lookup. Adapt syntax to the tool; do not assume a specific `grep` API or shell.
4. **Use bounded reads**:
   Start around matched lines (about 50 lines) and expand when dependencies or safety require context. Avoid loading unrelated documents.
5. **Extract the decision**:
   Cite the specific constraint (`file_path:line_number`) and continue the requested operation. Lookup or review alone does not authorize code edits.

## Limits

The index is derived routing metadata: a hit is a route, never approval, ownership or proof that docs match current behavior. Completed tasks stay out of results unless `--include-history` is passed explicitly. Rebuild with `nd index build`; the cache directory is ignored and disposable.
