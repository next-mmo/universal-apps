# Task: Guided onboarding and migration

## Goal and scope
- Approved: user said "build it" after onboarding audit, 2026-09-10.
- Deliver setup-project and workflow-doctor skills, safe adoption CLI, Superpowers migration procedure, onboarding docs, packaging and tests.
- Exclude publishing, global host configuration edits, automatic dependency installation, upgrade/uninstall engine and automatic semantic merging.
- Risk: high (project instruction/data preservation); require stale-state and path-safety tests, recovery evidence and acceptance verification.

## Ownership and integration
- Task: docs/tasks/task-0006-guided-onboarding.md; owner Mavis root session mvs_99a1e0fa9c1a42568cbec0884ea49f08.
- Existing workspace has 55 modified and 7 untracked entries reported before implementation. Preserve this baseline; no reset, commit, or branch changes.
- Workers for scripts/tests and skills both failed before output with Token Plan usage limit (2067). Parent owns all implementation now.
- Canonical targets: START-HERE.md, docs/PLUGINS.md, README.md, skill bodies, scripts/setup_project.py and scripts/workflow_doctor.py.

## Plan and acceptance
- [ ] Fresh/existing/migration guided flows with separate installation, adoption, host-loading and app-baseline states.
- [ ] Preview has no project writes; reviewed apply preserves unrelated files, rejects conflicts/stale plans/unsafe paths and journals changes.
- [ ] Doctor reads only scoped files, runs no app commands, reports unknown host state honestly.
- [ ] Source and extracted bundles contain seven skills and migration resources; packaging remains deterministic.
- [ ] Regression suite, skill lint and acceptance check pass; model-based evaluations recorded honestly if billing blocks them.

## Resume State
- Implementation started 2026-09-10. Next: write scripts and skills, integrate packaging, run tests.
- Model delegation blocked by plan balance; local tools remain available.
- Recovery: no automatic rollback/deletion. Apply journal stores before/after bytes and records intent before live changes; inspect and manually restore only unchanged applied files under approval.

## Verification and closure
- Implemented/integrated locally; not deployed, installed, committed or released. Version unchanged.
- 2026-09-10: python scripts/validate.py PASS (71 files, 7 skill headers, 403 root instruction words).
- python -m unittest discover -s tests -p 'test_*.py' -q: 97 tests PASS, including source/extracted-plugin preview and live apply, stale plans, malformed paths, exact merge backups, interrupted application, read-only doctor and deterministic six-target packaging.
- Both new skills pass skill-creator Node lint after trigger wording correction.
- Environment: Windows, Python 3.11.13, Node v24.16.0; base revision 4aeb0edce60a64f1e12e963268367bde7b643cd4 plus existing dirty workspace and this task's changes. Artifact SHA-256 and manifest file fingerprints recorded with deliverable.
- Acceptance: file safety, local integration and packaging PASS. Fresh/existing/migration procedures inspected by parent; no model behavior claim.
- BLOCKED: with-skill and baseline evaluation calls both failed with Token Plan limit 2067; independent model verification unavailable. Requested alternative model was absent from catalog. No comparative evaluation output exists; cannot establish better/not-worse verdict or token comparison. Resume these checks after billing is resolved.
- Live host install/discovery and actual Superpowers cutover remain UNVERIFIED; no user/global settings changed. Automated rollback/upgrade/uninstall remains out of scope.
- Recovery protocol documented in docs/ONBOARDING.md and interruption regression passes. Concurrent malicious filesystem mutation is outside script's security guarantees.
- Current docs reconciled: README, START-HERE, plugin guide/catalog, onboarding architecture and skills. Templates remain reusable, not replaced with this repo's facts.
- Compound: no-op; resource-export boundary already documented, avoid duplicate memory.
- Status: blocked on behavioral/independent acceptance; local implementation and automated checks complete. Next action: rerun isolated with-skill/baseline eval and independent verification, then human host smoke checks.
