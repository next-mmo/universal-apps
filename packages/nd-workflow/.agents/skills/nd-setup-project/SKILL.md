---
name: nd-setup-project
description: Guide ND Workflow adoption for fresh or existing projects and migration from another workflow. Use when users request set up ND Workflow, onboard this repo, or migrate from Superpowers. Not for application feature implementation, dependency installation alone, or global agent configuration.
---

# Set Up Project

## Consolidation and user review

For existing docs or any workflow migration, read [document migration checklist](references/document-migration.md) before planning changes. Inventory and map old files to canonical roles; reuse useful paths, merge actual duplicates, and archive superseded files only after review. Avoid redundant templates and mixed mandatory workflows. Gate A reviews workflow ownership and document map; Gate B approves exact diffs, paths, backups and recovery before writes. Direction approval is not apply authorization. Ask unresolved user decisions through structured questions when available; do not ask discoverable facts. Keep one migration checkpoint and update its checklist rather than generating more summary docs.

Document consolidation remains agent-guided: setup_project.py has no destination remapping or archival commands. Separate edits/moves require their own reviewed operation list and backups; the CLI journal does not cover them. Verify preserved facts, active work, links and applicable ND capability routing before claiming semantic adoption.

## Source location and end-user boundary

Keep the package source outside the target project. If actual source is nested (such as <project>/nd-workflow-src), heed REVIEW_REQUIRED and ask the user whether to move it to an exact external location or retain it knowingly before applying. Never auto-move/delete; check dirty source work and collisions before a separately approved relocation, then regenerate preview. Do not treat package instructions or templates inside that clone as target-project facts. Do not clone another copy when an external package is already available.

End-user adoption excludes nd-setup-project, nd-skill-creator, nd-skill-editor and distribution/onboarding guides; use them from the external package when needed. Daily skills and explicit selection metadata remain in the project. Existing internal copies require a reviewed cleanup map, not automatic removal. Confirm final catalog links and report leftover source copies; file adoption alone does not resolve duplicate host discovery.

## Procedure
1. Resolve target directory and actual skill/package location. Inspect project instructions, hidden files, current changes and relevant manifests. Treat any nonempty directory as existing, including an unborn Git repo. Preserve branch state and unrelated work. Ask target or coding tool only if context cannot establish it.
2. Separate harness installation from project adoption. Check available skill routes; use one canonical route unless duplicates are intentional. Installed plugin files do not establish project policy. Read the package's START-HERE.md and its tool-specific docs/PLUGINS.md only as needed; installed-version help and host evidence take precedence over compatibility claims. Missing runtime or install permission is a blocker, not authorization to install.
3. Choose fresh, existing or migration route. Fresh: add workflow only; ask application goal before choosing stack or scaffolding code. Existing: discover commands from manifests/lockfiles, preserve existing docs and facts, reuse approved specs. Migration: read [Superpowers migration](references/superpowers.md) when applicable and resolve replacement versus coexistence before edits.
4. Locate scripts/setup_project.py in source root or extracted plugin root; inspect its help before invoking. Generate preview for target, optionally saving a plan outside target. Review every add, reuse and conflict. Resolve conflicting plan entries with skip (preserve file) or merge plus reviewed full merged_text. Do not convert an existing file to add, erase known facts with template defaults, or mechanically append conflicting policies. If destinations should remain at existing canonical paths, skip the proposed file and review a separate targeted edit; this CLI does not remap paths.
5. Present exact changes and recovery implications. Apply reviewed plan only under user authorization. CLI requires target plus apply-plan; source and destination hashes must still match. Staging helper remains a separate review-copy route, not live adoption. No global configuration, hook removal, commits or publishing follows from project setup authorization.
6. Populate PROJECT.md and ARCHITECTURE.md, or their existing equivalents, from actual source. Record command provenance separately from observed results. Unknowns have owner and next action; empty projects retain honest unknowns. Adopt operations guidance only where deployment or persistent data needs it. Keep a task checkpoint for multi-step adoption.
7. Use workflow-doctor for file diagnosis, then inspect instructions and selected skills in a fresh host session. Model answers alone do not prove automatic loading. Run relevant application checks only with prerequisites and authorization; separate pre-existing failures from adoption regressions. Hand off one concrete first task using existing approved scope, or spec-feature for unresolved product requirements.

## Output contract
Report route, changed/skipped/conflicting paths, recovery journal, and four separate states: package available, project adopted, instructions verified, development baseline checked. Each state includes observed evidence or UNVERIFIED/NOT_RUN plus owner and next action. File application is not onboarding completion. No app test claim for an empty project.

## Failure handling
On stale source/target, regenerate preview and re-review; preserve edited plan as evidence. On partial apply, stop writers and inspect .nd-workflow-adoption/recovery.json and intent/done markers. Preserve journal; restore only under reviewed recovery instructions in docs/ONBOARDING.md. Concurrent writers require coordination; filesystem checks are not an operating-system security boundary.

## Windows (win32) platform notes
Use Python 3.10+ already available in the environment and PowerShell, not shell-specific installers. Quote paths with spaces. Run scripts by their actual package path, not a guessed target-project scripts directory. Keep UTF-8 and existing project line-ending policy for reviewed merges.
