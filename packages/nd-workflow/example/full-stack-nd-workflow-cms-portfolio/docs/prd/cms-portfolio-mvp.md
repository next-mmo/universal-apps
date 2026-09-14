# PRD: CMS Portfolio MVP

**Status**: Shipped (2026-09-10)
**Owner**: Root session
**Risk tier**: Medium

## Outcome
Local developer portfolio CMS demonstrating full ND Workflow adoption. Public visitors browse projects gallery and published blog posts. Authenticated admin manages content through dashboard with CRUD operations.

## Non-goals
- Production deployment, cloud hosting, or real user management.
- Image upload, rich text editor, or markdown rendering.
- Search, pagination, or filtering.
- Multi-user roles beyond single admin.

## ADDED

### Landing page
- Hero section with portfolio branding.
- Projects grid with cards showing title, description, tags, and links.
- Blog post list showing published posts with date and preview.

### Admin dashboard
- Session-based authentication with login/logout.
- Project management: create, update, delete with title, description, tags, URLs.
- Blog post management: create, update, delete with draft/published status.
- Admin-only post listing includes drafts; public API excludes them.

### API contract
- `GET /api/projects` — public, all projects.
- `GET /api/posts` — public, published only.
- `POST/PATCH/DELETE /api/admin/projects/:id` — admin, full CRUD.
- `POST/PATCH/DELETE /api/admin/posts/:id` — admin, full CRUD.
- `POST /api/auth/login` — credentials → session cookie.
- `POST /api/auth/logout` — destroy session.
- `GET /api/auth/me` — session validation.

### Data persistence
- JSON file storage: `data/projects.json`, `data/posts.json`, `data/users.json`.
- Atomic writes via temp file + rename pattern.
- Default admin user seeded on first run.

## Acceptance criteria
- [x] Public API returns projects and published posts.
- [x] Draft posts excluded from public listing.
- [x] Admin CRUD requires valid session token.
- [x] Security headers (CSP, nosniff) present on all responses.
- [x] Graceful shutdown flushes pending writes.
- [x] API tests cover auth, CRUD, validation, and edge cases.
