# Guided onboarding

## Choose a journey

- **Fresh project:** open an existing empty directory, including hidden-file inspection. Ask the agent: "Use nd-setup-project to add ND Workflow here. Set up workflow only; ask before choosing an application stack."
- **Existing project:** "Use nd-setup-project to adopt ND Workflow here. Preserve existing instructions, project facts, docs, code and uncommitted work. Show the adoption plan first."
- **Migration:** "Use nd-setup-project to migrate this project from Superpowers. Inventory unfinished work and ask replacement versus coexistence before changes."
- **Diagnosis only:** "Use nd-workflow-doctor to check this project's ND Workflow setup without changing files or running application commands."

If skills are not discovered, explicitly read `.agents/skills/nd-setup-project/SKILL.md` from this source package, or `skills/nd-setup-project/SKILL.md` from an extracted plugin. Use the selected host's installation instructions in [PLUGINS.md](PLUGINS.md); this does not itself adopt project policy. Do not install both repository and plugin copies unintentionally.

## Existing documents and workflow consolidation

Use [document migration checklist](../.agents/skills/nd-setup-project/references/document-migration.md) for any old workflow or document layout. Keep useful canonical paths; do not blindly add all bundled docs. Inventory current facts, historical evidence, active tasks, duplicates and conflicting policies in one checkpoint. Review gate A confirms workflow ownership and document map; gate B authorizes exact diffs, archival paths, backups and recovery. Preserve unique facts and history, repair links, and verify applicable ND routing before claiming adoption complete. Separate archival/link edits are agent-guided and are not covered by setup_project.py's recovery journal. The CLI is unchanged.

## Preview and reviewed apply

Python 3.10+ standard library; no dependency installation required. Run from this source root or an extracted plugin root. Target must already exist. Paths below are examples to replace with actual paths. Save plan outside target; its parent must exist.

```powershell
python scripts/setup_project.py --help
python scripts/setup_project.py --target 'C:\projects\john-app'
python scripts/setup_project.py --target 'C:\projects\john-app' --plan 'C:\projects\john-adoption.json'
python scripts/setup_project.py --target 'C:\projects\john-app' --apply-plan 'C:\projects\john-adoption.json'
python scripts/workflow_doctor.py --target 'C:\projects\john-app'
```

Preview prints JSON without writing the project. `--plan` exclusively creates the named review file. `--apply-plan` is the live-write operation: review its contents and authorize exact changes first. Source/package files and target hashes must still match. No script installs a host plugin, dependency, hook or global setting.

Plan entries have `path`, `source_sha256`, `before_sha256`, `action`, and `merged_text`. Keep paths/hashes/inventory unchanged. Resolve each conflict deliberately:

- `add`: missing file only; source bytes copied.
- `reuse`: existing bytes already equal source.
- `conflict`: different file; blocks entire apply before live writes.
- `skip`: preserve target as-is, including deliberately omitted additions.
- `merge`: existing file plus full reviewed replacement string in `merged_text`. This is not an automatic semantic merge. Preserve project facts and applicable policies; use JSON escaping for multiline text.

Default end-user profile selects root AGENTS.md/CLAUDE.md and daily development/QA resources. It excludes nd-setup-project, nd-skill-creator, nd-skill-editor, docs/PLUGINS.md and docs/ONBOARDING.md; these stay in the source/plugin package. Generated .agents/skill-selection.json tells doctor which skills are expected. Package-only catalog rows are removed and other links are rendered as package references. Existing installed internal files are NOT automatically removed; inventory and approve cleanup separately.

Keep source outside the target project in a global OS directory (e.g. `~/.nd-workflow` on POSIX or `%USERPROFILE%\.nd-workflow` on Windows), or a sibling directory. Never clone into `<project>/nd-workflow-src`. Running setup from a global location onboards any project via `--target <path>` without polluting project trees with package git metadata or internal tooling. Preview/apply emit REVIEW_REQUIRED on stderr when the actual source is nested; the agent must ask whether to relocate it before adoption. Warning does not itself block direct CLI use. No automatic move or deletion occurs. Source equal to target is rejected.

The profile retains other packaged `.agents/` and `docs/` resources. It excludes app examples and root maintainer README, manifests, scripts, tests and Git settings. Review/skip irrelevant distribution guides and reconcile catalogs to existing project paths: links to excluded maintenance files are rendered as package-reference labels rather than broken project links. Doctor surfaces missing references; application adoption requires that reconciliation, not blind copying. Tool helpers continue to run from source/extracted package, not the adopted app. Existing canonical paths are reused through separately reviewed edits; CLI does not remap destinations.

The original `stage_project.py --apply` remains available: it creates only `.workflow-starter-review/`, not live adoption. Do not confuse the two apply operations.

## Readiness and first task

Report these separately with evidence and next action:

- Package available: files readable or plugin visible; identify exact tool/version and route.
- Project adopted: applicable policies and facts reconciled, no unresolved conflicts, canonical links usable.
- Instructions verified: fresh-session host context/skill discovery observed. Model self-report alone is not proof.
- Development baseline checked: actual approved source-backed commands and results. Existing failures remain separate from adoption regressions; empty projects have no application test baseline.

Doctor reads bounded instruction/orientation/skill files only. It inspects neither user-level installs nor secrets, and runs no project commands. Exit 0 = inspected files present, 2 = attention required, 1 = failed inspection. Neither 0 nor an apply COMPLETE marker proves host loading, semantic policy correctness or passing app checks. Known duplicate copies and Superpowers references are indicators, not confirmed active triggers.

After setup, use the next approved task directly. Invoke spec-feature only if requirements remain unresolved. Record multi-step work in a checkpoint. For an empty app, ask the intended product and constraints before scaffolding.

## Superpowers cutover

Use [migration procedure](../.agents/skills/nd-setup-project/references/superpowers.md). Preserve designs, plans, history and unfinished tasks. Choose replacement or coexistence; define a single workflow owner for each task. Replacement does not authorize global uninstallation. Active host hooks outside project scope can block cutover until separately handled. Verify a fresh-session small task and a critical one-line auth scenario without performing production edits.

## Implementation boundaries

The skill owns scenario selection and semantic reconciliation. `setup_project.py` reads the validated source/core bundle, selects adoption resources, validates the complete plan, writes a recovery journal, then applies files. `workflow_doctor.py` reuses path checks but performs bounded read-only inspection. `build_plugins.py` exports both helpers and skill references for each target. Regression coverage lives in `tests/test_onboarding.py`; packaging and source closure remain covered by `tests/test_plugins.py`.

## Interrupted apply and recovery

Stop concurrent writers before applying or recovering. Path/hash checks reduce accidental corruption; they are not an OS security boundary against malicious concurrent filesystem changes.

Before live writes, `.nd-workflow-adoption/recovery.json` durably records original bytes (Base64), planned bytes and their hashes. Each write has an intent marker before it and a done marker after it. COMPLETE is written only after all planned writes. Journal contents can contain private project text: keep local, do not publish or commit without review. The script does not change `.gitignore`.

If apply fails, preserve journal and partial files. Do not rerun blindly. Existing journal blocks another apply; no implicit cleanup or rollback occurs.

1. Stop affected writers and inspect recovery records plus actual current hashes. An intent without done may still have completed its write.
2. For an originally existing file, restore decoded before bytes only after confirming current bytes equal recorded after hash (or reviewing any later changes). Check decoded bytes against before hash.
3. For an added file, move it to a reviewed backup location only if current bytes still equal recorded after hash. Do not delete or overwrite later user work. Empty directories may remain.
4. Preserve journal by moving it to an approved backup location after recovery or after accepting a successful application. Generate a new preview; do not reuse stale plans.

A journal created before recovery.json exists indicates failure before the live-write loop. Check actual files anyway. This version supplies recovery evidence and manual instructions, not an automated rollback/upgrade/uninstall engine.
