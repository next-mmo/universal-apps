# System Architecture — CMS Portfolio

## System map
- Status: Verified (initial implementation, 2026-09-10)
- Purpose: Local developer portfolio CMS with public gallery/blog and authenticated admin CRUD.
- System boundary: Single Express process, JSON file persistence, localhost-only binding.

| Component | Source path | Responsibility | State owner | Dependencies |
|---|---|---|---|---|
| Store | `src/store.js` | JSON CRUD for projects, posts, users; atomic write queue | `data/*.json` | Node fs |
| Auth | `src/auth.js` | SHA-256 password verification, session tokens, middleware | In-memory Map | crypto |
| App | `src/app.js` | Express routes: public API + admin API + static files | Stateless | store, auth |
| Server | `src/server.js` | Process lifecycle, port binding, graceful shutdown | — | app, store |
| Public UI | `public/js/app.js` | Landing page, project cards, blog list | DOM | fetch API |
| Admin UI | `public/js/admin.js` | Login, dashboard, CRUD forms and tables | DOM + session cookie | fetch API |

## Behavior and flow
- Public: `GET /api/projects` → full list; `GET /api/posts` → published only.
- Auth: `POST /api/auth/login` → session token in HttpOnly cookie + response; `POST /api/auth/logout` → destroy session.
- Admin: `POST/PATCH/DELETE /api/admin/{projects,posts}/:id` → requireAuth middleware checks token + admin role.
- Persistence: Store queue batches writes; `drain()` flushes on SIGINT/SIGTERM.
- Default credentials: `admin` / `password` (SHA-256 hash, demo only).

## Trust boundaries
- Auth middleware validates session token on every admin request; rejects expired sessions.
- CSP header restricts script sources to self; X-Content-Type-Options nosniff.
- JSON body limit 100kb prevents oversized payloads.
- **Demo limitation**: SHA-256 password hashing without salt. Not suitable for production. Use bcrypt/scrypt with per-user salt for real deployments.

## Decisions
- JSON file storage chosen over SQLite for zero-dependency portability, consistent with Todo example pattern.
- Session tokens stored in-memory Map; sessions lost on restart. Acceptable for local demo; production would use persistent session store.
- No CORS enabled; localhost-only binding prevents cross-origin access.
