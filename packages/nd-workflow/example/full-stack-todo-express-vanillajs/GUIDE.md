# Full-stack Todo: Express + Vanilla JavaScript

Runnable local workflow exercise, not a production service. Node 20+, npm, Express 5.2.1; browser tests use Playwright 1.63.0. Dependencies pinned in package-lock.json. No bundler, external UI service, database install, or account required.

## Run from clean source

From this directory:

```powershell
npm.cmd ci --ignore-scripts --no-fund
npm.cmd start
```

Open `http://127.0.0.1:3000`. Stop with Ctrl+C. On non-Windows shells use `npm` instead of `npm.cmd`. Install dependencies/browser only with appropriate local authorization.

```powershell
$env:PORT = '3100'
$env:TODO_DATA_FILE = 'data/custom-todos.json'
npm.cmd start
```

PORT accepts 0 for an OS-assigned port and 1–65535 for a fixed port. Default file resolves from the example directory; explicit TODO_DATA_FILE resolves from current working directory. Server always binds `127.0.0.1`. Do not point tests at real user data.

## Verify

```powershell
npm.cmd run check
npm.cmd run test:api
npx.cmd playwright install chromium
npm.cmd run test:e2e
npm.cmd audit
```

API tests use Node built-ins and ephemeral localhost ports. Browser tests run desktop Chromium and mobile Chromium emulation; mobile is not a physical-device test. Test records/data live under `.test-data/` and `test-results/`, ignored and excluded from source package. Tests allocate unique data paths and close owned servers. Keep or remove only those disposable outputs under your own cleanup policy.

## API contract

| Method/path | Input | Success |
|---|---|---|
| GET /api/health | None | 200 `{status: 'ok'}` |
| GET /api/todos | None | 200 `{todos: [...]}` |
| POST /api/todos | JSON `{title}` | 201 `{todo}` |
| PATCH /api/todos/:id | JSON `{title?, completed?}` | 200 `{todo}` |
| DELETE /api/todos/:id | None | 204 |

Todo: UUID, trimmed title (1–200 JavaScript string units), boolean completed, createdAt/updatedAt ISO timestamps. Blank/oversized title, unknown keys, non-boolean completion, invalid ID, malformed JSON: 400. Missing todo: 404. Oversized JSON body: 413. Missing JSON media type on POST/PATCH: 415. Storage error: safe generic 500. Unknown routes: 404.

UI: create, edit/cancel, toggle, delete, All/Active/Completed filters; error alert and load retry. Failed mutation preserves displayed state and draft. Titles render with textContent, never innerHTML.

## Architecture and decisions

- `src/server.js`: process configuration and localhost listener; drains writes on graceful shutdown.
- `src/app.js`: Express HTTP validation, host/origin guards, static public files, safe errors.
- `src/store.js`: one in-process queue; copy-on-write JSON snapshot. Write unique same-directory temp, sync/close, rename, then publish memory state. Failed persist leaves previous in-memory snapshot; corrupt persisted data fails startup rather than resetting.
- `public/app.js`: UI state and fetch API; no build step. Confirmed server mutations update UI; network/server failures stay visible.
- `test/api.test.js`: HTTP contracts, concurrent writes, corruption and failure injection, real child-process restart.
- `e2e/todo.spec.js`: real browser interactions and deterministic network failure injection.

JSON chosen for transparent persistence and low setup burden. **Only one writer process/store instance may own a file.** No cross-process locks, multi-user auth, database transactions across files, optimistic version conflicts, or automatic backup policy. Reads/rewrites scale with list size. This is a small local demo, not an unbounded production todo service.

## Safety and recovery

Host/origin checks, JSON-only mutations, CSP and text-only rendering reduce accidental cross-site interaction. They are not authentication. Any trusted local process/user can access the app. No proxy exposure, remote binding, secrets, or real sensitive data.

Before changing data manually: stop server; preserve a copy of `data/todos.json` outside public/ with approved permissions. Restore only while stopped. If startup rejects corruption, preserve bad bytes for diagnosis; do not silently delete/reset. Atomic rename and file sync are tested for normal process restart and injected failure, not guaranteed power-loss recovery on every filesystem. Directory fsync, multi-process writes, forced-kill mid-rename, and disaster recovery are not certified.

## Handover

- Start here, inspect source modules above, then run checks from clean lockfile installation.
- Example-specific decisions live here; root PROJECT.md/ARCHITECTURE.md remain adoption templates, not a claim that every project uses this architecture.
- Before pausing a change, record next command, partial work, invalidated evidence, and data-path ownership in the root task record; never share live data unintentionally.
- Root [handover guide](../../docs/HANDOVER.md) defines broader gates and limitations.

Official references: [Express error handling](https://expressjs.com/en/guide/error-handling.html), [Playwright tests](https://playwright.dev/docs/writing-tests). Express 5 forwards rejected asynchronous handlers to error middleware. No claim that all browsers/platforms or third-party coding agents were tested.
