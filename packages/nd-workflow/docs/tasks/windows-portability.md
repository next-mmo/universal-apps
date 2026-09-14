# Task: Restore Windows tooling portability

## Goal and scope
- Fix review findings approved by user: LF checkout policy and fixture I/O portability.
- Risk: medium shared tooling. Preserve demo, historical report content, APIs, global Git settings, and branch history.
- Distribution-profile redesign, CI setup, browser installation, and publication remain out of scope.

## Ownership and integration
- Owner: root session mvs_78b6eace67e940d0b18f3e834de65039; no other writers.
- Task path: docs/tasks/windows-portability.md (archive move blocked by workspace safety gate; retained here without retry).
- Base: main at 4aeb0edce60a64f1e12e963268367bde7b643cd4; initially clean working tree.
- Write scope: .gitattributes, package manifest, validator required-file list, tooling/plugin tests, START-HERE.md, task record; LF-only normalization of 65 tracked UTF-8 text files.

## Convergence Record (Verified 2026-09-09)

| Criterion | Fresh evidence | Result |
|---|---|---|
| Reproduce fixture translation and missing policy | Both focused regression tests failed before fix | PASS |
| Ship LF attributes and require presence | Distribution inclusion and omitted-policy tests; full suites | PASS |
| Preserve UTF-8/LF fixture bytes | Vietnamese/CJK byte regression; explicit newline writes | PASS |
| Normalize checkout text | Git reports i/lf w/lf and text=auto eol=lf; global core.autocrlf remains true | PASS |
| Source validation and all Python tests | source-validation.txt; source-tests.txt: 74 tests OK | PASS |
| Packaged clean copy | package.txt; extracted-validation.txt; extracted-tests.txt: 74 tests OK | PASS |
| Preserve demo behavior | npm.cmd run check; npm.cmd run test:api: 11/11 passed | PASS |
| Current docs and integrated diff | START-HERE.md reconciled; git diff --check passed | PASS |

## Resume State and evidence
- Implementation complete in local working tree; not staged, committed, published, or deployed.
- Runtime: Windows, Python 3.11.13, Node v24.16.0.
- Evidence directory: .validation/portability-97fbc6a7/ (local ignored verification output).
- Exact tested source hashes: .validation/portability-97fbc6a7/summary.json.
- Built artifact: artifacts/workflow-starter-portability-97fbc6a7.zip.
- Artifact SHA-256: 9d69d6b4fb5f3847476526df7bba6ffa4c67cf6196ebdbc9d2db7b96bcc9d296.
- Task record is intentionally excluded from starter package, matching existing distribution policy.
- Durable learning captured once in START-HERE.md: Git attributes do not rewrite existing checkout bytes; Python fixture writers separately need explicit LF. No extra memory entry.
- Browser E2E not rerun: Chromium binary absent in earlier review; browser behavior unverified. Linux execution not performed.
- Remaining optional cleanup: separate core/demo/evidence distribution profiles and establish cross-platform CI. No files deleted for those proposals.
- Recovery: review/revert scoped uncommitted changes; no production state affected.
- Status: done for stated portability scope; broader enterprise-readiness not claimed.
