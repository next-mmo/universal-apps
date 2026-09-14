# Task: Harden coding-agent workflow starter

## Context
- Goal: Resolve reviewed adoption, compatibility, verification, risk, and concurrent-task defects without adding workflow ceremony.
- Source: User requested improvements after 2026-09-09 review.

## Ownership & State
- Exact task path: `docs/tasks/done/done-0001-harden-workflow-starter.md`
- Owner: Mavis session `mvs_0c8b76d884eb46f9a6b7b1b8188e023c`
- Workspace: workflow-starter; non-Git directory, no branch/worktree.
- Write scope: Starter Markdown, Claude adapter, task record; local validation and delivery artifacts.
- Concurrent writers: None.

## Scope
- In scope: Five review findings, execution boundaries, evidence freshness, consistent supporting docs.
- Out of scope: Runtime settings, installations, CI deployment, app code, publishing, commits.
- Risk tier: Medium (shared workflow behavior; no security mechanism or auth code changed).
- Rollback: Restore original files from `.validation/before-20260909-130752/`; separately review new files before removal. Backup is local and not included in release archive.

## Execution Record
1. Patched shared policy, safe adoption guide, task/project templates, catalog routing, and four source skills; added plain-text Claude import adapter.
2. Ran docs validation and before/after policy assertions. Reviewed exact changes against original backup; corrected leftover risk shortcuts and release/convergence scope conflicts.
3. Independent review was attempted but canceled without a verdict. Parent completed static acceptance review; no independent signoff claimed.
4. Created and verified reusable ZIP, excluding local backups, validation scratch, and this session-specific task record. Archived completed task.

## Acceptance Criteria & Evidence
- [x] Safe adoption stages before collision merge and preserves facts: `START-HERE.md:15`; static regression checks `stage_before_merge`, `preserve_project_facts` passed.
- [x] Persistent Claude adapter and honest loading routes: `CLAUDE.md:1`, `START-HERE.md:23`; import and tool-adoption checks passed. Client runtime smoke tests remain explicitly unverified.
- [x] Impact-based checks and highest risk: `AGENTS.md:6`, `AGENTS.md:29`, `.agents/docs/WORKFLOW.md:35`; consumer, executable-doc, and risk regression checks passed.
- [x] Exact task ownership and current evidence: `.agents/templates/TASK.md:9`, `.agents/skills/converge-check/SKILL.md:26`; ownership and stale-evidence checks passed.
- [x] Runtime safety boundaries: `AGENTS.md:20`; destructive-action and enforcement-boundary assertions passed.
- [x] Structure and package: 16 Markdown files, 13 relative links, four unchanged skill headers; all 13 policy regression assertions fail on original baseline and pass after patch. ZIP CRC, allowlist, and source-byte comparisons passed for all 16 entries.

## Convergence Record (Verified 2026-09-09)
- Status: Done for documentation/source scope; no runtime compatibility certification.
- Commands: `python .validation/validate_starter.py`; `python .validation/package_starter.py`.
- Environment: Windows PowerShell; Python 3.12.10; Python standard library only.
- Evidence: `.validation/validation-results.json`, `.validation/review.diff`, `.validation/package-results.json`.
- Tested core file-state SHA-256: `8002f582b216050c4c6a97d0b36896f1e66507c2411355c0bd8498312f101aff` (aggregate of per-file SHA-256 map in validation results; excludes task record and scratch).
- Evidence freshness: Package step rechecked all core hashes before archive creation and compared every archived entry with current source bytes. No core edits after final validation.
- Artifact: `artifacts/workflow-starter-improved-2026-09-09.zip`, 20,549 bytes, 16 entries.
- Artifact SHA-256: `a94f3e9077a71e3ddf148e50028ec53f808ff37789138b9feb5d89b6f275cd18`.
- Skipped: App tests/builds (no app code; prose-only changes), installed-client smoke tests, live external-link HTTP checks. Static text assertions do not prove agent compliance or enforce permissions.
- Independent verification: Canceled without output; not counted as passing evidence.
- No dependencies installed, runtime settings changed, commits created, or publication performed.
