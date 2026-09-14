# Task: Implementation of ND Skills Ecosystem, Doctor Token Audit, and Plugin Toggles

Use for multi-step work; skip for genuinely low-risk single-turn changes. Keep this file current before pause, handover, or completion. A session checklist is not a substitute for this durable file.

## Goal and scope
- Mode: implementation.
- Outcome / why: Implement portable `nd-` skill namespacing, Workflow Doctor token-saver vs token-burner analysis, 3 lifecycle skills (`nd-skill-creator`, `nd-skill-editor`, `nd-feedback-collector`), and configurable skill toggles in `plugin-config.json` with CLI `--skills` override.
- Requirement or issue / exact draft or approved PRD path and version: `docs/prd/prd-0002-nd-skills-ecosystem-doctor-token-and-toggles.md` (version: approved, last-audit: 2026-09-10).
- Scope approval evidence / approver / date / exclusions: User questionnaire response and explicit command "build it now" on 2026-09-10.
- Execution authorization: Authorized on 2026-09-10.
- In scope / non-goals:
  - In scope: Doctor token checks, renaming skills to `nd-<skill>`, 3 lifecycle skills, plugin toggles & CLI override, test suite updates, docs reconciliation.
  - Non-goals: Remote skill registry, host IDE hot-reloading without restart.
- Risk and required gates: Medium risk. Requires passing test suite (tooling, plugins, onboarding), validate.py, and deterministic build artifacts.

## Ownership and integration
- Exact task path (update on rename): `docs/tasks/done/done-0009-spec-nd-skills-lifecycle-and-doctor.md`
- Owner / team; optional session ID: root maintainer; session `mvs_34ac063e331b48b5800d949e2469969a`.
- Branch/worktree and base revision (or non-Git/unborn workspace state): `56d1470`.
- Owned write paths: `docs/prd/prd-0002-nd-skills-ecosystem-doctor-token-and-toggles.md`, `docs/tasks/wip-0009-spec-nd-skills-lifecycle-and-doctor.md`, `scripts/workflow_doctor.py`, `scripts/build_plugins.py`, `plugins/plugin-config.json`, `.agents/skills/`.
- Dependencies / outstanding workers: none.
- Integration owner / shared files / merge order: root maintainer.

## Plan and acceptance
- Next steps:
  1. Implement token footprint check in `scripts/workflow_doctor.py`.
  2. Implement skill toggles and CLI override in `scripts/build_plugins.py` and `plugins/plugin-config.json`.
  3. Rename core skills to `nd-<name>` and update frontmatter.
  4. Author 3 lifecycle skills (`nd-skill-creator`, `nd-skill-editor`, `nd-feedback-collector`).
  5. Update test suites and validate.
- [x] Doctor reports `TOKEN_SAVER` / `TOKEN_BURNER` with token footprint breakdown.
- [x] Skills use portable `nd-<name>` in folders and frontmatter.
- [x] 3 lifecycle skills created and conform to ND standards.
- [x] Build script filters skills via config and `--skills` flag.
- [x] All test suites pass.
- Canonical behavior/architecture targets; baseline and requirement IDs:
  - PRD: `docs/prd/prd-0002-nd-skills-ecosystem-doctor-token-and-toggles.md` (REQ-SKILL-001 through REQ-SKILL-008).

## Resume State
- Updated at / author: 2026-09-10 / root maintainer.
- Completed / partial / not started:
  - Completed: All requirements REQ-SKILL-001 through REQ-SKILL-008 implemented and verified.
  - Verification: 104/104 unit tests passed, repository validate.py passed, all platform plugins built.
- Exact next action: Ready for handover and review.

## Verification and closure
- Criterion / command or inspection / result / evidence location:
  - `python scripts/validate.py`: PASS (77 files in manifest, 0 manifest errors, 0 link errors, 0 frontmatter errors).
  - `python scripts/workflow_doctor.py --target .`: PASS (status FILES_PRESENT, token_efficiency TOKEN_SAVER, 0 missing).
  - `python -m unittest discover -s tests -p 'test_*.py'`: PASS (104 tests passed, 5 skipped, 0 failures).
  - `python scripts/build_plugins.py`: PASS for claude-code, cursor, codex, chatgpt, windsurf, continue, and CLI --skills override.
- Status: completed.
