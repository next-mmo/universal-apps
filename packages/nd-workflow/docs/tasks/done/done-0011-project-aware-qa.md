# Task: Project-aware QA initialization and workflow proposals

## Goal and scope
- Mode: implementation.
- Approval and execution: user requested extending nd-user-testing; questionnaire on 2026-09-10 selected existing skill, project-aware QA plan/ledger initialization, and evidence-backed improvement proposals only.
- Outcome: initialize relevant app/game/CLI/workflow checks and draft workflow improvement tasks without applying changes.
- Non-goals: new skill, app scaffolding, tool installation, live gameplay, ND adoption or automatic workflow edits.
- Risk: medium shared workflow. Preserve prior dirty changes.

## Ownership and integration
- Exact task path: docs/tasks/done/done-0011-project-aware-qa.md
- Owner: root maintainer / mvs_34ac063e331b48b5800d949e2469969a.
- Owned paths: .agents/skills/nd-user-testing/, tests/test_user_testing.py, package-files.json, docs/README.md, this task.
- Dependencies: existing QA handoff and ND TASK/PRD approval rules; no other writers.

## Plan and acceptance
- [x] Project evidence selects app/game/CLI/workflow or mixed/unknown profile; no invented capabilities.
- [x] Init-only creates PLANNED/UNVERIFIED report without starting app or executing tests.
- [x] Workflow improvements have evidence, task route, pending approval and no automatic edits.
- [x] Event fields, reference packaging and regression checks pass.

## Resume State
- Updated 2026-09-10: completed skill extension, project profiles, ledger links, manifest, catalog and static regression checks. Next: supervised project-specific pilot only when requested; no required implementation remains.
- Decisions: profile checklists are candidates, not universal requirements; shared workflow remains unchanged until explicit approval and execution request.

## Verification and closure
- Full suite: 111 tests run, 106 passed, 5 skipped, 0 failures in 37.298 seconds. Final description/table edits followed by all 7 affected QA static/integration tests passing (1.298 seconds).
- Repository validation PASS: 81 manifest files, 0 errors, AGENTS.md 448/450 words. Source package verifies CRC, allowlist and byte equality.
- All six provider collectors include project-profiles.md at both skill and starter locations; static tests verify byte equality. No new host installs or live provider tests.
- Parent reviewed seven maintainer scenarios: game capability filtering, endless runner without win, mixed app/workflow, strict browser-only CLI, proposal gating, execution-error attribution and preserved failure history. This is instruction review, not agent gameplay.
- Artifact: artifacts/nd-project-aware-qa-20260910-final.zip. SHA256 can be calculated from delivered ZIP; prior intermediate ZIP is superseded.
- Implemented and locally integrated in existing dirty workspace; not committed, deployed or published. No live game/app/CLI QA performed. No additional durable learning: canonical profile reference already holds rules.
- Status: completed for requested instruction/packaging scope.
