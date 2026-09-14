# Task: ND QA status and developer handoff

## Goal and scope
- Mode: implementation.
- Outcome: refine nd-user-testing with safe QA rounds, local status events, durable reports, and ND bug/task/PRD routing.
- Requirement / approval / execution: user request 2026-09-10, "update it adapt our nd workflow and event status and if found bug crate prd or task ... so dev just check that". Direct scoped implementation authorized; no new PRD needed.
- Non-goals: product fixes, live application testing, external issue publication, host installation, event services.
- Risk: medium shared workflow; contract tests, packaging checks and independent scenario review required.

## Ownership and integration
- Exact task path: docs/tasks/done/done-0010-qa-developer-handoff.md
- Owner: root maintainer, session mvs_34ac063e331b48b5800d949e2469969a.
- Baseline: current dirty workspace from prior nd-* migration and nd-user-testing creation; preserve those changes.
- Owned paths: .agents/skills/nd-user-testing/, docs/README.md, docs/PLUGINS.md, docs/tasks/README.md, package-files.json, tests/test_user_testing.py, this task.
- Dependencies: existing ND TASK/PRD templates and spec approval rules. No other writers.

## Plan and acceptance
- [x] Skill preserves test-data safety, chosen interaction mode, complete coverage and honest outcomes.
- [x] Reference defines report, status events, deduplication, task/PRD routing, developer handoff and retest closure.
- [x] Source and all six plugin providers include reference; catalogs expose route.
- [x] Contract tests and independent scenario review pass; limitations recorded.

## Resume State
- Updated: 2026-09-10 / root maintainer.
- Complete: skill safeguards, QA handoff reference, catalogs, package manifest and six static/integration tests. Full suite: 110 run, 105 passed, 5 skipped. Validation PASS; six provider ZIP builds PASS.
- Next action: supervised live QA pilot on a user-selected application if requested; no implementation work remains in this task.
- Independent verifier: bg_532f12dc-f8bc-4ca8-98d2-e79e1a690c65 finished, eight scenario decisions PASS. No blocking findings. Minor usability suggestions require no contract change. Parent reviewed source and corrected the interpretation: report-only can still save a report when authorized; only read-only-document scope forbids writes. A blocker may coexist with a recorded bug, and draft checkpoint filenames follow actual ND lifecycle.
- Decision: events are local report rows, not hooks or background monitoring. App bugs go to tasks; unresolved scope goes to draft PRD. Recording never authorizes fixes.
- Evidence: prior review identified missing safety, interaction, completion and routing contracts; current files confirm gaps.

## Verification and closure
- Static contracts and provider integration: 6 tests PASS. Full suite: 110 run, 105 passed, 5 skipped, no failures (37.507 seconds).
- `python scripts/validate.py`: PASS; 80 manifest files; zero link/frontmatter errors; AGENTS.md 448/450 words.
- Six provider ZIP builds PASS: claude-code, cursor, codex, chatgpt, windsurf, continue. Output: artifacts/qa-handoff-20260910-121359/.
- Tested-file SHA256 values and check summary: artifacts/qa-handoff-20260910-121359/verification.json. Windows PowerShell / Python standard-library validation in existing dirty workspace.
- Independent read-only scenario review: PASS for known bug, new scope, unavailable browser, duplicate issue, shared-data delete, unverified fix claim, partial coverage and fail-plus-blocker. This is instruction interpretation, not a live agent/UI evaluation.
- Current docs reconciled: skill/reference, docs catalog, task catalog, plugin guide and manifest. Durable learning: no-op; rules already captured in QA contract.
- Delivery state: implemented and locally integrated; not committed, installed, deployed or published. Host loading and live UI remain UNVERIFIED. Existing doctor ATTENTION from UNSET starter templates remains unrelated and unchanged.
- Status: done for requested skill-refinement scope; no product fixes or QA runs performed.
