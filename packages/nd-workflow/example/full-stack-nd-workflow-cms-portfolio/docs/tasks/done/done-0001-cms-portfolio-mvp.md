# Task: Implement CMS Portfolio MVP

## Context
- Goal: Build full-stack CMS portfolio example demonstrating ND Workflow adoption.
- PRD: `docs/prd/cms-portfolio-mvp.md`
- Risk tier: Medium

## Ownership & State
- Task path: `docs/tasks/done/done-0001-cms-portfolio-mvp.md`
- Owner: Root session
- Write scope: All files under `example/full-stack-nd-workflow-cms-portfolio/`

## Scope
- In scope: Express API, JSON store, session auth, public/admin UI, API tests, adopted .agents.
- Out of scope: E2E browser tests, image upload, rich text, deployment.

## Implementation Plan
- [x] Step 1: Scaffold project structure, package.json, .gitignore.
- [x] Step 2: Implement store.js with atomic JSON persistence for projects, posts, users.
- [x] Step 3: Implement auth.js with SHA-256 password verify, session management, middleware.
- [x] Step 4: Implement app.js with public and admin API routes.
- [x] Step 5: Implement server.js with graceful shutdown.
- [x] Step 6: Build public frontend (landing, projects grid, blog list).
- [x] Step 7: Build admin frontend (login, dashboard, CRUD forms).
- [x] Step 8: Write comprehensive API tests.
- [x] Step 9: Write adopted .agents (AGENTS.md, ARCHITECTURE.md, PRD, task records).
- [x] Step 10: Write GUIDE.md and run verification.

## Acceptance Criteria
- [x] Public API returns projects and published-only posts.
- [x] Admin CRUD requires valid session.
- [x] Security headers present.
- [x] API tests pass.
- [x] Syntax check passes.
- [x] Full .agents adoption with real architecture and PRD.

## Verification
- Status: Completed and verified.
- Environment: Windows, Node 24.16.0, Express 5.2.1.
- Evidence: `npm run check` passed; `npm run test:api` all passed.

## Compounded Learnings
- JSON store atomic write pattern reusable across examples; keep temp file + rename.
- Session-based auth with HttpOnly cookie + X-Session-Token header dual-path simplifies both browser and API test clients.
- SHA-256 without salt is acceptable for demo; document production alternative clearly.
