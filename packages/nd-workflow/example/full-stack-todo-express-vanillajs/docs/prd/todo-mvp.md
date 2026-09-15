# PRD: Todo MVP

**Status**: Shipped
**Owner**: Root session
**Risk tier**: Medium

## Outcome
Local full-stack todo exercise demonstrating ND Workflow adoption with API and real-browser coverage. Users create, edit, toggle, filter, and delete todos through a vanilla-JavaScript frontend backed by an Express API and single-process JSON persistence.

## Non-goals
- Production deployment, cloud hosting, or remote binding.
- Multi-user accounts, authentication, or authorization.
- Database, cross-process locking, or multi-writer persistence.
- Bundler, framework, or external UI service.

## ADDED

### API contract
- `GET /api/health` — 200 `{status: 'ok'}`.
- `GET /api/todos` — 200 `{todos: [...]}`.
- `POST /api/todos` — JSON `{title}` → 201 `{todo}`.
- `PATCH /api/todos/:id` — JSON `{title?, completed?}` → 200 `{todo}`.
- `DELETE /api/todos/:id` — 204.

### Data model and persistence
- Todo: UUID, trimmed title (1–200 JavaScript string units), boolean completed, createdAt/updatedAt ISO timestamps.
- Single-process JSON store with copy-on-write snapshot and atomic temp-file + rename.
- Failed persist keeps the previous in-memory snapshot; corrupt persisted data fails startup rather than resetting.

### Validation and errors
- 400: blank/oversized title, unknown keys, non-boolean completion, invalid ID, malformed JSON.
- 404: missing todo or unknown route. 413: oversized body. 415: missing JSON media type on POST/PATCH.
- 500: safe generic storage error.

### UI
- Create, edit/cancel, toggle, delete, All/Active/Completed filters, error alert, and load retry.
- Failed mutation preserves displayed state and draft. Titles render via textContent, never innerHTML.

## Acceptance criteria
- [x] API contract matches the documented methods and status codes.
- [x] Validation and error paths return the documented 4xx/5xx responses.
- [x] Atomic persistence survives normal restart and injected failure.
- [x] API tests and Playwright browser tests exercise the contract.
- [x] Host/origin guards, CSP, and text-only rendering reduce accidental cross-site interaction.
