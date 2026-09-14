# Product hardening checkpoint — 2026-09-10

## Ownership and scope
- Owner: root session mvs_78b6eace67e940d0b18f3e834de65039.
- User requested product improvements after staging/plugin/CMS testing.
- Existing dirty changes preserved; no commit, push, deployment, or global settings modified.
- Scope: shared core export, source/bundle staging, associated tests/docs; discovered CMS draft exposure, cookie logout, and drain race regressions.
- Risk: high (file trust boundaries and CMS authorization). Human signoff required before release. Existing feature scope; no new PRD required for bug fixes.

## Acceptance and evidence
- [x] Source paths validated before content reads; unsafe and linked source tests.
- [x] Core exports exclude examples and carry self-consistent manifests/doc links.
- [x] Source preview/apply matches plugin staging; live files preserved; repeated apply rejected.
- [x] Fresh-process extracted staging finds helper imports without repository cwd.
- [x] Bundle malformed/checksum/Windows path rejection stays fail-closed.
- [x] Cookie logout revokes server session; replay rejected. Reproduced failure before fix.
- [x] Public draft lookup returns 404; authenticated draft listing remains available. Reproduced failure before fix.
- [x] Missing data directory created; 40 queued project/post writes survive drain/reopen.
- [x] Python suite: 83/83 passed; CMS syntax and API suite: 21/21 passed on Node 24.16.0, Windows.
- [x] Fresh source and six target artifacts built; extracted core full Python suite passed.
- Independent verification: BLOCKED by Token Plan usage limit; no independent verdict. Release signoff remains pending.
- Delivery: artifacts/hardening-61f8239e/nd-workflow-hardening.zip; SHA-256 34e9b28500f3835385952da06b381fa1c24c5ab5349a07475066875c90ad763a.
- Tested file hashes: artifacts/hardening-61f8239e/verification.json. Extracted logs: .validation/hardening-61f8239e/tests.txt.

## Remaining product issues (not completion claims)
- CMS inline admin handlers conflict with CSP; edit UI incomplete; non-401 API errors may clear forms. Browser acceptance remains open.
- CMS default credentials and unsalted password hash are demo-only; persistence acknowledges before durable commit.
- Actual host installation/discovery across six providers not verified. Generated metadata is not proof of official compatibility.
- Node 20, Linux runtime, remote CI, competitive ranking, token savings remain unverified.
- Prior report claiming competitive superiority and numeric token savings is unsupported and must not be used as release evidence.

## Durable rule
Core profile is a derived distribution, not a filename filter alone: keep manifest, documentation references, helper modules, and hashes synchronized. Validate both source and extracted copies. Checksums detect changed bundle bytes, not publisher authenticity.

## Resume
Implementation and local automated validation complete for this scoped pass. Independent review and release remain blocked/pending; task retained as checkpoint, not archived as release acceptance. Recovery: revert scoped uncommitted changes; staging never merges into live project files. No production data migration occurred.
