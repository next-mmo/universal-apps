# Task: RC validation with full-stack todo example

## Goal and approved scope
- Add `example/full-stack-todo-express-vanillajs`; user approved JSON persistence, local Express + Playwright installation and browser download, RC report and local ZIP.
- No version bump, commit, tag, push, production deployment, or public release authorized.
- Risk: High validation emphasis for file persistence and packaging; localhost demo with no production data. No claim of production security readiness.

## Ownership and integration
- Owner/integration: Mavis; all writes after delegated API worker failed from account quota.
- Base: unborn master; existing source untracked. Preserve previous artifacts.
- Scope: example source/test/docs, manifest and fixture integration, RC evidence/catalog.

## Acceptance
- [x] Runnable Express + vanilla JS CRUD, edit, completion/filter, labeled controls and responsive viewport checks. No full accessibility certification.
- [x] JSON real-process restart, 30 concurrent writes, corrupt-file rejection, injected failure before persist and after temp sync, queue recovery passed.
- [x] Strict API input/status/error behavior, host/origin guards, CSP/static isolation and HTML-as-text browser checks passed.
- [x] 11 API tests, eight desktop/mobile Chromium tests, syntax and zero-advisory dependency audit passed in source and clean candidate.
- [x] Core validator and 63 tests ran in source and clean candidate (60 passed, three privilege-related symlink skips); fresh npm ci passed.
- [x] Final 54-entry ZIP excludes dependencies/runtime/test output; all archived bytes match source, CRC passes, collision attempt preserves artifact. Durable RC report, logs and per-file hashes saved in repo.

## Final handoff
- Status: Completed for local-demo RC source scope. No version/tag/public release or production certification.
- Source and clean candidate: 63 core cases (60 pass/3 privilege skips), 11 API pass, eight Chromium desktop/mobile cases pass, syntax pass and zero npm audit advisories.
- Final source and final extraction core checks rerun after report/manifest changes; executable and lockfile hashes unchanged from fully tested candidate.
- Artifact: `artifacts/workflow-starter-rc-todo-2026-09-09.zip`, 90,901 bytes, 54 entries.
- SHA-256: `b11128f43828d54482a5dc485a4da9c1868236e1f1d9a82d8d180ac333d3ffb4`.
- Evidence: `docs/rc/2026-09-09-todo-rc.md`, `docs/rc/evidence-20260909/gates.json`, `docs/rc/2026-09-09-todo-delivery.json`; final structural/test logs `.validation/rc-todo-final/`.
- Next developer: read example GUIDE.md, npm ci, run check/test:api/test:e2e, then npm start. Default data local and ignored. Single process only; no production data.
- Limits: Windows and Chromium only, mobile emulation not physical device, three real symlink tests skipped by permissions, no independent code review (account quota), no production/power-loss/multi-process or cross-framework benchmark.
- No source commit, tag, version bump, push, or public deployment. Existing root project templates remain templates; example facts reside in its guide.

## Resume State
- Completed: Source API/store/server, UI, 10 API tests, 8 browser cases; approved dependencies installed.
- First failure: Node fetch ignored Host override; raw HTTP test now exercises actual host guard.
- Second failure: Immediate checkbox rollback prevented reliable pending interaction; now rollback occurs only on mutation failure. All eight browser cases passed afterward.
- Core defect: Catalog linked an unpackaged historical research document; validator now rejects existing linked files omitted from manifest. Fixtures use validated current manifest and independent required-file guard. Added one regression; core suite 63 cases (3 privilege skips).
- Current: Full source/clean candidate and final package checks completed; durable logs in `docs/rc/evidence-20260909/`, delivery hash sidecar in docs/rc.
- Exact archived task path: `docs/tasks/done/done-0004-rc-todo-example.md`.
- Next: Human RC review and optional broader-platform/production work under separate scope. No required local-demo gate remains.
- Decisions: Single process owns JSON file; no multi-process DB guarantee. Loopback-only, no authentication; not Internet-ready. File fsync + rename protects normal writes, no power-loss/directory-fsync guarantee.
- Evidence pending; no RC pass yet.
