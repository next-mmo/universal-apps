# Task: Portable checks and reliable handover

## Context
- Goal: Resolve nine reviewed readiness gaps without mandatory ceremony for small work.
- Approved scope: User requested implementation after deep review, 2026-09-09.
- Risk: Medium; shared workflow changes plus executable validation/packaging helpers. Python unit/CLI checks required, not docs-only validation.

## Ownership & State
- Exact task path: `docs/tasks/done/done-0003-portable-handover-workflow.md`
- Owner: Mavis; session `mvs_0c8b76d884eb46f9a6b7b1b8188e023c`
- Branch: master (unborn; no commits).
- Parent write scope: Markdown policy, templates, guides, .gitignore, local verification records.
- Worker write scope: scripts/, tests/, package-files.json. Worker returns test evidence; parent owns integration.
- Shared files: Parent only. No runtime config edits, installations, commits, or publication.

## Plan
1. Tighten root policy and conditional task routes; add current-doc reconciliation and checkpoints.
2. Add source-backed adoption, operational template, knowledge correction, and handover drill.
3. Add portable validation/packaging with negative regression tests and no historical backup dependency.
4. Run clean extracted-package checks and independent acceptance; package final source.

## Acceptance
- [x] Root policy <=450 words; measured 392; small tasks avoid mandatory specification/delegation/fingerprints.
- [x] Exact task checkpoints preserve next action, decisions, blockers, and state before pause; templates plus HANDOVER.md.
- [x] Shared integration ownership and combined-result verification explicit; WORKFLOW.md parallel contract.
- [x] Current-doc reconciliation has target, baseline, conflict handling, and deployed-state distinction; PRD template and spec/converge skills.
- [x] Adoption requires source-backed architecture and conditional operations without fabricated facts; START-HERE.md bootstrap and runbook template.
- [x] Compound deduplicates, corrects/retires stale knowledge, and allows no-op; skill verified by independent routing review.
- [x] Portable checks and full suite run in source and clean extraction without ignored baseline: 62 tests each, 59 passed and 3 privilege-dependent symlink tests skipped. Malformed metadata/path and output-race regressions passed.
- [x] ZIP includes .gitignore, scripts, tests, and manifest; 25 exact entries, CRC and all source bytes verified. Local history/scratch excluded; name guards are not a content secrets scanner.

## Resume State
- Updated by: Mavis, 2026-09-09, current implementation session.
- Status: Done for starter source/tooling scope; integrated locally, not committed or published.
- Current: Root 392 words (31% fewer than 571); independent verifier passed seven static routing scenarios, not a real application handover drill. Parent reviewed and corrected worker tooling (output aliasing, required .gitignore, device aliases, link ancestors). Added three parent regressions beyond worker's 59 tests.
- Next: Adopt into a real project and run the cold handover drill before claiming application/deployment readiness. No further required starter implementation remains.
- Blockers: None for starter acceptance. Real application setup, operational drill, installed-client integration and actual token/cycle-time improvements are unverified. Original local backups are machine-only and NOT accessible to another developer from distribution. No shared backup/upload authorized; remote rollback to earlier state remains an explicit access limitation.
- Decisions: Reuse current docs instead of mandatory specs directory; local delta convention explicitly not OpenSpec CLI integration. Operations template conditional. Per-task checkpoint, not global transcript memory.
- Outstanding ownership: scripts/tests/package-files.json worker only; shared docs and integration parent only.
- Rollback: Pre-change source backup `.validation/before-v3-20260909-135901/`; compare before restoring to preserve later user edits.
- Environment: Windows PowerShell, Python 3.12.10 standard library. Current changes uncommitted on unborn master; final per-file hash map pending packaging.
- Successor: No ownership transfer requested; parent Mavis retains integration. Any later developer needs final delivered package or authorized repository access, not session ID alone.
- Evidence: Independent static scenario report in verifier session `mvs_1ce5d2d104c04c0eb8c514d9343d39db`; seven scenarios passed and findings reviewed by parent. Structured local record `.validation/doc-routing-v3.json`.

## Final acceptance (2026-09-09)
- Commands: `python scripts/validate.py`; `python -m unittest discover -s tests -p 'test_*.py' -v`; `python scripts/package.py --output artifacts/workflow-starter-v3-handover-2026-09-09.zip`.
- Source and clean extracted package: 62 tests each, 59 passed, 3 symlink-privilege skips. Parent added lexical symlink guard test without requiring symlink privilege; real symlink cases remain skipped.
- Validator: 25 manifest files, 19 Markdown files, 28 relative links, five strict-subset skill headers, root 392 words; PASS. Five original skill metadata blocks unchanged.
- Repackaging from clean extraction: PASS, byte-identical archive; no old baseline or Git state needed. Existing-output retry: nonzero and original bytes unchanged.
- Package: `artifacts/workflow-starter-v3-handover-2026-09-09.zip`; 44,372 bytes; 25 entries; CRC, required entries, and every source byte verified.
- SHA-256: `b883ab8eb2aeed600fe920e6cee8ab78836841ba34f996e8dbb8aee9870b0e92`.
- State: Per-file SHA-256 map and audit logs in `.validation/final-v3-acceptance/summary.json`; source/clean tests and package logs beside it. Packaged source unchanged after audit; only this excluded task record updated.
- Durable learning: Existing procedures/tests now encode exclusive creation, independent required files, path/metadata rejection, and evidence scope; no duplicate memory entry needed.
- Limits: Heuristic Markdown/link checks, strict metadata subset (not general YAML), no content secrets scanner; no application deployment/recovery or installed-client smoke tests; no zero-bug or measured token-saving guarantee.
- No software installed, runtime permissions changed, commits created, or external publication performed. Historical backups remain local; shipped portable checks do not require them.
