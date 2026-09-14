# CMS Portfolio: Express + Vanilla JS

A runnable full-stack developer portfolio CMS demonstrating **full ND Workflow adoption**. Features public showcase pages and an authenticated admin dashboard for managing projects and blog posts.

Node 20+, npm, Express 5.2.1. JSON file persistence, zero database dependencies, zero build step.

---

## What this demonstrates

This example shows what an adopted project looks like after running the ND Workflow:

- **`AGENTS.md`** — Project-specific instructions and risk classification.
- **`.agents/docs/ARCHITECTURE.md`** — Filled system map, component responsibilities, data flow, and trust boundaries.
- **`docs/prd/cms-portfolio-mvp.md`** — Delta PRD with ADDED scope and explicit acceptance criteria.
- **`docs/tasks/done/done-0001-cms-portfolio-mvp.md`** — Completed task record with convergence matrix and compounded learnings.
- **`docs/README.md`** — Documentation catalog routing agents to the right context.

---

## Quickstart

From this directory:

```powershell
npm.cmd install
npm.cmd start
```

Open `http://127.0.0.1:3001` in your browser.

- **Public portfolio**: `http://127.0.0.1:3001/` — Browse projects and published blog posts.
- **Admin dashboard**: `http://127.0.0.1:3001/admin/` — Login with `admin` / `password`.
- Create, update, and delete projects and blog posts.
- Save posts as **Draft** (hidden from public) or **Published**.

### Custom port and data directory

```powershell
$env:PORT = '3002'
$env:CMS_DATA_DIR = 'data/custom'
npm.cmd start
```

---

## Verification

```powershell
# Syntax check
npm.cmd run check

# API test suite (auth, CRUD, edge cases)
npm.cmd run test:api
```

---

## API Overview

### Public (no auth)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects |
| `GET` | `/api/projects/:id` | Get project by ID |
| `GET` | `/api/posts` | List published posts |
| `GET` | `/api/posts/:id` | Get published post by ID; drafts return 404 |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login with username + password |
| `POST` | `/api/auth/logout` | Invalidate session |
| `GET` | `/api/auth/me` | Current session info |

### Admin (requires session)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/posts` | List all posts (including drafts) |
| `POST` | `/api/admin/projects` | Create project |
| `PATCH` | `/api/admin/projects/:id` | Update project |
| `DELETE` | `/api/admin/projects/:id` | Delete project |
| `POST` | `/api/admin/posts` | Create blog post |
| `PATCH` | `/api/admin/posts/:id` | Update blog post |
| `DELETE` | `/api/admin/posts/:id` | Delete blog post |

---

## Current verification limits

Local API suite covers cookie logout revocation, draft detail privacy, and queued shutdown persistence. Browser E2E is not verified. Known remaining blockers: inline admin event handlers conflict with the script CSP, UI editing is incomplete, and non-401 HTTP failures can clear forms. Do not treat earlier completed task records as browser acceptance evidence.

JSON writes are queued; API responses still precede disk completion. Shutdown waits for the queue and reports retained write errors, but crash/power-loss durability and multi-process writes are not certified. Missing data directories are created automatically. No production deployment is supported.

## Security notes

- Default admin credentials (`admin` / `password`) use unseeded SHA-256 for demo portability. Use bcrypt/scrypt for production.
- Session tokens expire after 1 hour and are kept in memory (reset on restart).
- CSP headers enforce same-origin scripts and nosniff content types.
- Server binds strictly to `127.0.0.1`.
