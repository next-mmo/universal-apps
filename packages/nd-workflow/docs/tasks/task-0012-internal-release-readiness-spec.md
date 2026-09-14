# Task-0012: Correct readiness evidence and deliver local evaluation candidate

## Scope, approval and ownership

- Mode: implementation; local corrections, verification and packaging only.
- Owner: Mavis root `mvs_f324b4c7640d43d4a92ccf6fb15e4dc7`.
- Approved scope: [PRD-0005 v0.1](../prd/prd-0005-internal-release-readiness.md), RR-001–RR-006; unchanged 25/25/20/20/10 rubric. Approval: questionnaire `ask_98ed07f27c44a5b1c8984a87`, user, 2026-09-11. Original approval permitted planning only.
- Later execution evidence: user "do it all", "do it", and current "ship it your best now" after disclosure that certification was false. Authorizes best-effort local correction/verification/delivery; does not manufacture missing humans, approve scope reduction, or authorize an unspecified public destination.
- No commit, tag, push, production deployment or publication in this turn. Exact external release action requires separate confirmation.
- Baseline: main at c7dd5c4ddd3ee455ac058d4da8f0fc718e28c96d, dirty tree preserved. Fresh run manifest records actual input hashes and environment; earlier base is not proof of tested inputs.
- Writer scope: parent owns scorecard, candidate evidence corrections, README/catalog, this checkpoint, PRD status annotations and local evaluation artifacts. Worker owns five readiness helper scripts plus tests/test_readiness_helpers.py. Other source/CI changes remain pre-existing; no overlapping edits authorized.
- Recovery: preserve original records in artifacts/readiness-correction/withdrawn-records-20260911-171433.zip; no deleting old archives, fixtures or logs. New evaluation paths use exclusive creation. Restore owned edits only after review; no blanket reset.

## Execution plan and checks

- [x] Withdraw earned-score/certification claims and distinguish simulation from human evidence.
- [x] Disable unsafe auto-certification/destructive helpers; regression tests verify failure propagation and no overwrite/delete (20 tests PASS in `tests/test_readiness_helpers.py`).
- [x] Create candidate-002 with frozen input hashes, measured local environment, full raw outputs and explicit skipped checks (`docs/evidence/readiness/candidate-002/`).
- [x] Deliver local evaluation package with explicit release blockers recorded.

## PRD convergence: partial (local automated verified; human/platform gates open)

- RR-001: rubric approved; candidate-002 input manifest frozen; readiness score UNASSESSED.
- RR-002/003: candidate-002 ledger bound to measured hashes; raw command logs stored; candidate-001 invalid records withdrawn and archived to `artifacts/readiness-correction/withdrawn-records-20260911-171433.zip`.
- RR-004: local test suites pass (181 unit pass, 7 symlink skips on Windows; 71 hardened example tests pass; 36 full-stack tests pass; deterministic package verified). macOS, Python 3.10, and remote CI runs remain unverified.
- RR-005: fresh real-host drills and human developer onboarding (H4) have not been run on this candidate. BLOCKED.
- RR-006: independent maintainer review (E3) not performed. Token Plan limit prevented subagent review; self-authored check cannot substitute. Scorecard records BLOCKED.
- Score: UNASSESSED. Release gate: BLOCKED.

## Resume State

- Updated: 2026-09-13 (session `mvs_d979509b9ffe42ec927d25e61348faaa`); prior update 2026-09-11.
- Completed: candidate-002 local evaluation package created (`artifacts/readiness-correction/workflow-starter-candidate-002-evaluation.zip`, SHA-256: `38ddc0e4224f47b2803d00016fc170d86f865268d7e2ee3730532a74be4f763b`). Repeat build verified byte-identical.
- Next action: recruit non-author developer for onboarding drill, obtain independent maintainer review, and verify remote CI runs across declared platforms before release.
- Status: local evaluation deliverable ready; production release BLOCKED.
- Human/platform blockers: actual declared CI results, current-host drills, non-author developer, independent rubric reviewer and maintainer signoff. Do not shrink denominator or invent participants.
- Historical observations: 168 unit tests ran with seven skips; package/automated broken-link smoke checks passed after helper fixes. These are not current candidate-bound or human evidence.
- Concurrent ownership: portable-context wip-0007 belongs to another root. Do not infer its approval/closure from READY cache output; revision MISMATCH and historical completion language remain explicit limitations.
- Integration/deployment: current local corrective work only; not shipped. No background monitors or release automation scheduled.

## Verification record

Fresh command results and independent review will be appended after execution. Candidate-001 raw logs stay historical; overwritten attempts cannot be reconstructed as complete raw evidence. Required unmet criteria remain blocked/unverified even if local command checks pass.

## Progress record 2026-09-13

- Session `mvs_d979509b9ffe42ec927d25e61348faaa` was the only active nd-workflow session (single writer). Resolved the stash-restore conflict in `START-HERE.md` by keeping both true statements: twelve bundled `nd-*` names for the source package, `.agents/skill-selection.json` selection check for adopted projects. `python scripts/validate.py` PASS (91 manifest files, 0 errors).
- Diagnosed a real remote failure: CI run `34592135038` for revision `94a4d1c` is RED on both macOS cells (`ValueError: Path contains link/reparse point` from `scripts/stage_project.py` `reject_links` through `setup_project.safe_target`; macOS `/var -> /private/var` is an OS alias). The ubuntu and windows cells pass.
- Fix applied but uncommitted: `top_level_component()` boundary in `reject_links`, plus `tests/test_tooling.py::TestStageLinkBoundary` (3 tests). Local evidence: focused 74 tests OK; full suite 191 tests OK, 0 failures, 0 skips. macOS cells still need a fresh remote run before C4 can be claimed.
- Package re-verified locally: `workflow-starter-candidate-head.zip`, 91 entries, 207,257 bytes, SHA-256 `c46c3fc8d39afc50346d2bbb7cb3fe0ac71c0ce5ea42dd2a91ce40f6cae54896`; extracted verification returned `VERIFICATION_COMPLETE_NO_CERTIFICATION_AWARDED` (doctor exit 1 and context-check exit 2 are the documented ATTENTION states for an unadopted template).
- Fresh-session host drill on MiniMax Code (child session `mvs_af4f20bc8e864afe85e767daaae5889a`): AGENTS.md auto-loaded, twelve `nd-*` skills discoverable, critical risk tier confirmed for a one-line auth fix, checkpoint-only recovery read succeeded, zero writes. Host-loading evidence only, not human onboarding.
- Raw unreviewed observations: `artifacts/readiness-observations/20260913-local/` including `manifest.json`. No score was computed; the scorecard remains UNASSESSED and the release gate BLOCKED.
- Unchanged blockers: macOS remote CI results (needs an authorized push or PR), non-author human onboarding (H4), human timing/help observations (U1-U3), maintainer score reproduction and signoff.

## Progress record 2026-09-14

- The maintainer authorized a full push. Three commits were published to `origin/main` as revision `299237d`: `c362e0d` (reject_links fix plus regression tests), `cab55d6` (candidate-003 evidence and release-doc reconciliation), `299237d` (adoption trees, retrieval drafts, example updates). The two Rust trial fixtures remain untracked because they are embedded Git repositories and need an explicit embed-or-submodule decision.
- CI run `34773737906` for `299237d` passed all six cells: ubuntu, windows and macos at Python 3.10 and 3.11 with Node 20. The macOS cells that were red for `94a4d1c` are green now, so the platform matrix is covered for this revision; the run log is recorded under `docs/evidence/readiness/candidate-003/commands/`.
- Remaining blockers: non-author human onboarding (H4), human timing/help observations (U1-U3), the C2 protected-fixture double run from clean starts, H3 host negative cases, the BENHMARK.md count reconciliation, and the maintainer signoff.
