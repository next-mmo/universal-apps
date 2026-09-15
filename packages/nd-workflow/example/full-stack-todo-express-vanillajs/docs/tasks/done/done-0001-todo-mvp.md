# Task: Implement Todo MVP

## Context
- Goal: Build full-stack todo example demonstrating ND Workflow adoption with API and browser tests.
- PRD: `docs/prd/todo-mvp.md`
- Risk tier: Medium

## Ownership & State
- Task path: `docs/tasks/done/done-0001-todo-mvp.md`
- Owner: Root session
- Write scope: All files under `example/full-stack-todo-express-vanillajs/`

## Scope
- In scope: Express API, single-process JSON store, vanilla-JS frontend, API tests, Playwright browser tests, adopted ND docs.
- Out of scope: E2E beyond the local Chromium desktop/mobile emulation; deployment, auth, database.

## Implementation Plan
- [x] Step 1: Scaffold project structure, package.json, package-lock.json, .gitignore.
- [x] Step 2: Implement store.js with copy-on-write JSON snapshot and atomic temp + rename persistence.
- [x] Step 3: Implement app.js with Express validation, host/origin guards, static files, safe errors.
- [x] Step 4: Implement server.js with process config, localhost binding, and graceful shutdown drain.
- [x] Step 5: Build public frontend (create/edit/toggle/delete, filters, error handling).
- [x] Step 6: Write API tests covering contract, concurrency, corruption, and failure injection.
- [x] Step 7: Write Playwright browser tests with deterministic network-failure injection.
- [x] Step 8: Write adopted ND docs (AGENTS.md, PRD, task records) and GUIDE.md.

## Acceptance Criteria
- [x] API contract matches the documented methods and status codes.
- [x] Validation and error paths return the documented responses.
- [x] Atomic persistence survives normal restart and injected failure.
- [x] API and browser tests exercise the contract.

## Verification
- Status: Completed and verified.
- Documented commands: `npm run check`, `npm run test:api`, `npx playwright install chromium`, `npm run test:e2e`.
- See `GUIDE.md` for the run and verification workflow.
