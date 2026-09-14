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

1. **Check `docs/README.md` first**:
   Read the compact catalog for the target file. If absent or stale, search the relevant docs directory; absence from the index is not proof that no specification exists.
2. **Search before reading**:
   Use the available content-search tool for the keyword, symbol, or endpoint. Adapt syntax to the tool; do not assume a specific `grep` API or shell.
3. **Use bounded reads**:
   Start around matched lines (about 50 lines) and expand when dependencies or safety require context. Avoid loading unrelated documents.
4. **Extract the decision**:
   Cite the specific constraint (`file_path:line_number`) and continue the requested operation. Lookup or review alone does not authorize code edits.
