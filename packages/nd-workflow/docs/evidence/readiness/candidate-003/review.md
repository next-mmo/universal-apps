# Independent review record: candidate-003

Status: **IN PROGRESS - no verdict recorded yet.**

## Standard adopted

Maintainer decision (2026-09-13): an automated agent review is acceptable for this internal ledger; a human maintainer still signs off before release. This file records agent-level review only and must not be read as the maintainer signoff, which remains PENDING.

## Reviewer

- Session `mvs_abadf9be11f94d4097c151a9d2297d2a` (verifier agent role, read-only, separate session from the implementing session `mvs_d979509b9ffe42ec927d25e61348faaa`).
- Reviewer was instructed not to edit repository files, not to commit or push, and to write scratch only under the gitignored `.validation/` directory.

## Scope given to the reviewer

1. Compare `git show HEAD:scripts/stage_project.py` with the working-tree `scripts/stage_project.py`: confirm the macOS false positive is removed, that caller-controlled links are still rejected, that the requested path itself is still rejected when it is a link, and that no other behavior changed. Report any case where the new logic is weaker than the old.
2. Independently reproduce, without relying on the new unit tests: a deeper link is still refused, and a temp-directory path is no longer refused. On Windows, use a directory junction if a Python symlink cannot be created. Report the exact pass/fail/skip counts of `TestStageLinkBoundary`.
3. Check raw observation logs under `artifacts/readiness-observations/20260913-local/` against the claims: 188 tests OK, 191 tests OK after the fix, macOS failure present in the CI log.

## Result (agent review, 2026-09-14)

Reviewer verdict: **PARTIAL** - agent-level, Windows host only, no darwin execution.

- Item 1, change review: **PASS.** `git diff` is a single hunk in `scripts/stage_project.py` (+20/-2) around `scripts/stage_project.py:18-38`; `linked`, `unique_object`, `bundle_files`, `stage` and `main` are untouched. The macOS false positive is gone: a POSIX emulation of both loops shows a `/var`-alias-only path raised before and does not raise now, and the real-filesystem Windows analogue `C:\Documents and Settings\...\leaf` (an OS junction with the reparse attribute) raised before and does not raise now. Deep links still raise: link as the requested path, `deep-alias/deep/proj`, `real-root/deep/sub-link/leaf`, directory-symlink ancestors, and `stage(REPO, sub_link)`. The requested path itself still raises even as a filesystem-root child (`reject_links('C:/Documents and Settings')`, POSIX `/var`).
- Item 2, independent reproduction: **PASS.** A fresh gitignored fixture with real directory junctions and a real `os.symlink` (Developer Mode) shows every deep-link probe raising under the changed code. `python -m unittest discover -s tests -p 'test_tooling.py' -v` returned `Ran 74 tests in 40.041s`, `OK`; `TestStageLinkBoundary` ran 3, passed 3, 0 failures, 0 skips. A junction proves directory-reparse detection only, not file symlinks.
- Item 3, claim integrity: **PASS with caveats.** `commands/unit-tests.log` shows `Ran 188 tests` with `OK`; `commands/unit-tests-after-fix.log` shows `Ran 191 tests` with `OK` (191-188 = the 3 new tests); `commands/ci-failed-macos.log` holds exactly two macOS jobs (3.10 and 3.11), each exit 1, with the chain `tests/test_end_user_adoption.py:52 -> scripts/setup_project.py:102 warn_nested_source -> scripts/setup_project.py:23 safe_target -> scripts/stage_project.py:20 reject_links`. Caveats: that gh export does not itself carry run ID 34592135038 (the mapping comes from `gh run view`, saved as `commands/ci-run-summary.log`), step names render as `UNKNOWN STEP` in it, and both unit-test logs carry unrelated session output after the summary line - a parse hazard, not truncation.

## Weaker-than-before case (accepted and documented)

Links that sit at a filesystem-root direct child and are *ancestors* of the requested path are no longer inspected. Executed case: `C:\Documents and Settings\...\leaf` raised before the change and does not raise now; the same is inferred for a hypothetical junction at `D:\projects`. The requested path itself, and every non-top-level ancestor, are still inspected. That tolerance is the deliberate cost of not rejecting macOS `/var -> /private/var`. A maintainer must accept this trade-off before the fix is published; as of 2026-09-13 the fix stays unpublished.

## Known limits of this review

- It is performed by an automated agent session on the same machine and runtime family as the implementation; it is not a human maintainer, not a different vendor's tool, and not a macOS environment.
- It cannot validate the macOS CI cells, which remain unverified because the fix was not published (maintainer decision, 2026-09-13).
- It does not cover the human onboarding, usability or maintainer-reproduction criteria.
