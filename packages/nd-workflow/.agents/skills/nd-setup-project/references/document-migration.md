# Guided document consolidation and workflow migration

Use for existing projects and migrations from any workflow, not only Superpowers. This is an agent-guided checklist, not a new CLI schema. Keep useful canonical paths. Consolidate only after review; never equate fewer files with better documentation.

## 1. Inventory before proposing changes

- Inspect project-local instructions, catalogs, current docs, plans, tasks, QA reports and relevant configuration references. Search narrowly and read relevant sections; do not ingest every archived file or search global settings/secrets.
- Record current branch/dirty state and active owners. Separate current behavior, approved requirements, draft proposals, historical evidence, generated files, duplicates and unknowns. Age or filename alone does not prove obsolescence.
- Identify competing workflow triggers and who owns planning, execution, verification and QA. Preserve security constraints. Detected plugin names do not prove active host loading.
- Map existing artifacts to ND roles: project facts, architecture, delivery policy, requirements, task state, QA evidence and operations when relevant. Existing equivalents are preferred to new template copies.
- Keep active work IDs, approvals, ownership, dependencies, open questions and historical test provenance. Do not mark unfinished work completed or turn old prose into an approved PRD.

Use one migration checkpoint following the existing TASK convention, not a parallel documentation system. Before review, write only authorized planning artifacts; no canonical-document or workflow edits. A review-only request may require presenting the map in chat instead.

| Source path / section | Role / current owner | Current, draft, history or unknown | Canonical path / section | Proposed action | Facts and links to preserve | Conflict / decision | Evidence / status |
|---|---|---|---|---|---|---|---|

Actions: KEEP, MERGE, LINK, ARCHIVE, SKIP, ADD. KEEP useful canonical content in place; LINK related history without copying it. MERGE only true overlaps with preserved unique facts. ARCHIVE only superseded material with reviewed destination. ADD only a missing needed role, not every bundled template. Unknowns remain unresolved, not automatically archived. List excluded paths and reasons so scope is bounded.

## 2. Review gate A: ownership and document map

Present inventory summary, proposed canonical paths, duplicates, semantic conflicts and unresolved work. Ask only user-owned decisions, grouped in a concise questionnaire using host's structured question tool when available:

- Replace old delivery routing with ND, or coexist with explicit ownership per phase?
- Which document is authoritative when sources disagree on current requirements or policy?
- Approve proposed reuse/consolidation map, or retain specified documents separately?

Do not ask discoverable facts or repeat prior answers. Show recommended choices with consequences and exact affected paths. Gate A approves direction only, not writes. Wait for actual response and record decision/date/scope. Fresh projects still review proposed minimal map; omit irrelevant conflict questions.

## 3. Prepare complete reviewed change set

- Read full affected sections and relevant inbound links before merging. Preserve unique requirements, rationale, API contracts, commands, owners and evidence. Mark unresolved conflicts explicitly; never resolve product truth by choosing newest timestamp.
- Prefer existing canonical orientation/architecture docs; route project instructions and catalog to them. Do not copy the same policy into AGENTS.md, CLAUDE.md, README and multiple workflow files. Preserve required host entry points, with short links where supported.
- Keep historical reports and approved decisions as history. Archive does not mean delete. Do not merge all PRDs or QA rounds into a giant file. Leave active tasks at canonical paths unless exact relocation is approved and coordinated.
- Complete ND routing: project orientation; risk and approval gates; task ownership/resume; evidence-based verification; QA-to-task/PRD handoff when applicable; operations only when needed. Record each capability as REUSED, ADDED, NOT_APPLICABLE with reason, or BLOCKED. Missing optional templates are not a reason to create empty docs.
- Generate setup_project.py preview using installed help. Use existing add/reuse/skip/merge actions only. Skip redundant bundled docs. CLI does not remap paths or archive files; retain complete inventory/hashes and do not invent move/delete fields.
- Existing canonical edits, link rewrites and archival moves outside CLI plan form a separately reviewed operation list: exact source/destination, before hash, proposed content/diff, backup location, ordering and recovery. CLI journal covers only CLI writes, not these separate edits.
- Check closure after skipped additions: every live link and required policy must resolve to retained canonical content. A nonstandard canonical layout can produce doctor warnings; explain actual equivalents rather than add duplicate files to make doctor green.

## 4. Review gate B: exact changes and recovery

Present final content/diffs, every add/merge/link/archive/skip, workflow triggers proposed for retirement, retained exceptions, backups, recovery scope and unresolved blockers. Ask explicit authorization for this exact plan. Gate A or general setup intent does not count as Gate B. Use host confirmation UI when available and wait for response. No automatic destructive operations, global uninstall, commits or publication.

Before applying, coordinate writers and recheck source/target hashes. Changed content invalidates affected approval; regenerate and re-review. Refuse collisions and unsafe/symlink paths. Preserve UTF-8 and existing line endings. Secure local backups may contain private project text; do not publish them.

Apply only approved operations. Validate merged destination before archiving superseded source; preserve original bytes in reviewed backup and update inbound links/anchors. External links that cannot be updated need an approved compatibility pointer or an explicit unresolved break; never silently remove their target. On failure stop, retain operation status and backups, and review recovery rather than rerunning blindly. Never delete user history or overwrite unrelated later edits.

## 5. Completion checklist and handoff

- [ ] Gate A decisions recorded; each mapped file has a disposition and unresolved conflicts are visible.
- [ ] Gate B authorizes exact operations; backups and before/after state are available.
- [ ] Unique facts, requirements, approvals and active tasks preserved; no competing mandatory routing remains without explicit coexistence ownership.
- [ ] One canonical location per current concern; catalogs and retained entry points link correctly; no unnecessary template copies or empty status boards.
- [ ] Changed links/anchors and archived paths verified; unknown external references remain explicit.
- [ ] Applicable ND capabilities are mapped to actual files; inactive/optional roles documented without scaffolding unrelated features.
- [ ] Doctor findings interpreted against canonical equivalents; application checks run only when authorized; pre-existing failures stay separate.
- [ ] Host instruction loading verified through available evidence or UNVERIFIED with next owner/action; file presence is not proof.
- [ ] First approved task and QA route identified, or unresolved scope routed to nd-spec-feature. No new implementation authorized by migration.

Checkpoint states: INVENTORIED, AWAITING_MAP_REVIEW, PLANNED, AWAITING_APPLY_APPROVAL, APPLYING, BLOCKED, VERIFIED. VERIFIED refers to the documented migration scope only; always report package availability, semantic project adoption, host instruction loading and development baseline separately. Outstanding required consolidation checks prevent semantic adoption completion. No claim of complete onboarding while required evidence is absent.

Final report: approved map and decisions, changed/retained/archived/skipped paths, unresolved conflicts, backup/journal paths, preserved active work, checklist evidence and one next action. Reuse existing catalog/checkpoint instead of creating extra summary documents.

## Maintainer scenarios

- Existing architecture.md already covers project design: KEEP it; skip duplicate template and update routing after Gate B.
- Two conflicting specs: ask authority at Gate A; do not mechanically merge or self-approve requirements.
- Completed plan with open dependency: preserve dependency/history; do not archive based on filename alone.
- User approves map but not exact diff: remain AWAITING_APPLY_APPROVAL, no live edits.
- Source changed after approval: re-preview/re-review affected operations; no stale apply.
- Old linked doc superseded: validate replacement, preserve backup and reviewed compatibility route before archival.
- Coexisting workflow required: record phase ownership; do not stack conflicting mandatory triggers.

These scenarios are instruction contracts, not an automated migration engine or live-project migration evidence.
