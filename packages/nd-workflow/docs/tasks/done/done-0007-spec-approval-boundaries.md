# Task: Explicit specification approval and durable drafting

## Goal and scope
- Outcome / why: remove ambiguity between requirements answers, saved draft, scope approval, and implementation authorization.
- Approved requirement or issue: user requested "fix it now" after the read-only workflow audit in session mvs_ef946ad4edc148d893a096dffb448b42 on 2026-09-10.
- Mode: implementation of workflow instructions, templates, and tests.
- In scope: root routing, spec-feature source, workflow reference, PRD/TASK templates, handover/proposal/task guidance, regression tests, manifest closure.
- Non-goals: runtime/global skill edits, benchmark app/PRD execution, dependency installations, git commits, external releases.
- Risk: high instruction change affecting execution authorization; verified with focused regressions, package validator, and full test suite.

## Ownership and integration
- Exact task path: docs/tasks/done/done-0007-spec-approval-boundaries.md
- Owner and integration owner: root-session maintainer; sole writer.
- Base revision: a00b26fc0a20abe4029202992629e8369c35667f.
- Owned write paths: AGENTS.md; .agents/docs/WORKFLOW.md; .agents/skills/spec-feature/SKILL.md; .agents/skills/task-status/SKILL.md; .agents/templates/PRD.md; .agents/templates/TASK.md; docs/HANDOVER.md; docs/PLUGINS.md; docs/prd/README.md; docs/tasks/README.md; package-files.json; plugins/plugin-config.json; scripts/validate.py; scripts/workflow_doctor.py; START-HERE.md; tests/test_tooling.py; this task record.
- Dependencies / workers: none.

## Plan and acceptance
1. Record reproducible static policy regressions before updating instructions.
2. Add a spec-only draft/save/present/stop boundary, evidence-backed approval and separate execution authorization; preserve authorized direct fixes.
3. Define pre-approval drafting checkpoints and approval revalidation on resume/scope changes.
4. Add read-only `task-status` skill for task board and WIP inspection.
5. Resolve package-files manifest closure for BENHMARK.md.
6. Run focused regressions, package validator, and full tooling test suite.
- [x] Spec-only request writes draft/checkpoint but cannot begin implementation.
- [x] Questionnaire answers and ambiguous continuation are not approval; approval names exact version and evidence.
- [x] Scope approval alone does not authorize execution; explicit combined approval/start request may satisfy both, subject to other safety gates.
- [x] Drafting checkpoint records open questions and unauthorized implementation; approved direct fixes need no duplicate PRD.
- [x] Dedicated read-only task-status skill added and registered across manifests, scripts, plugins, and docs.
- [x] Links, frontmatter, root word budget (432/450) and full tooling test suite (102/102) pass green.

## Resume State
- Completed: all patches, manifest adjustments, validator checks, and full unittest suite pass.
- State: completed.
- Evidence: `python scripts/validate.py` (PASS, 0 errors); `python -m unittest discover -s tests -p 'test_*.py' -v` (102 tests passed, 0 failures, 0 errors); `git diff --check` (clean).

## Verification and closure
- 2026-09-10: Python 3.11.13, Windows PowerShell.
- Five new TestSpecificationApprovalContract tests pass:
  - `test_approval_provenance_and_execution_are_separate`: PASS
  - `test_drafting_checkpoint_is_not_an_implementation_task`: PASS
  - `test_resume_checks_authorization`: PASS
  - `test_spec_only_persists_draft_and_stops`: PASS
  - `test_workflow_preserves_direct_fixes_and_reapproval`: PASS
- `python scripts/validate.py`: PASS
  - manifest_paths: 0 errors
  - hard_required: 0 errors
  - agents_word_count: 0 errors (words=432 budget=450)
  - utf8_links: 0 errors (files=34 relative_links=77 fences=38)
  - skill_frontmatter: 0 errors
- `python -m unittest discover -s tests -p 'test_*.py' -v`: Ran 102 tests in 49.831s; OK (102 passed, 0 failures, 0 errors).
- `git diff --check`: PASS (clean whitespace).
- Delivery state: implemented and verified in local repository source; no release/deployment requested.
