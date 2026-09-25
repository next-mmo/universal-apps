# System Architecture

Implemented v1, GUI-verified 2026-09-26. Status per component below; deployment state: not deployed (local static app only). Decisions D1–D2b approved before build; D3 (no backend) held throughout.

## System map
- Status: implemented and verified in-browser 2026-09-26 (lint clean, 26 unit tests, production build, live GUI pass with screenshots). Not deployed.
- Purpose and system boundary: a pure client-side web app. The browser reads files the user explicitly grants access to (folder picker, drag-and-drop); no upload, no server, no persistence of file contents. Read-only by design: no editing, no writing back to disk.
- Source entry points and runtime topology: none yet. Planned: Vite dev server for development; static bundle in production. Single page, no backend.

| Component | Actual source path | Responsibility | State/data owner | Dependencies |
|---|---|---|---|---|
| Starter (React + Vite + Tailwind v4) | `src/App.tsx`, `src/main.tsx`, `vite.config.ts` | app shell, build tooling | — | tauri-universal source CLI (universal.lock.json) |
| File access layer | `src/lib/fsAccess.ts`, `src/lib/nodes.ts` | File System Access API (lazy folder tree), drag-and-drop + `webkitdirectory` fallback, unified tree node model | browser file handles (in-memory only) | browser APIs |
| Demo source | `src/lib/demo.ts` | in-memory sample tree (all viewer kinds) for offline demos and automated GUI checks | in-memory Files | — |
| Tree UI | `src/components/FileTree.tsx` | virtualized rows, lazy expansion, name filter (Universal `input`), selection | TanStack store (`src/app/store.ts`) | `@tanstack/react-virtual` |
| Viewer router | `src/components/Viewer.tsx` + `src/hooks/useFileContent.ts` | kind detection → viewer dispatch; async reads cached per path; blob URLs revoked on change | TanStack Query cache | `@tanstack/react-query` |
| Code/text viewer | `src/components/viewers/CodeView.tsx`, `src/lib/monacoSetup.ts` | Monaco read-only (bundled workers, no CDN); custom themes bfv-dark/light | — | `monaco-editor` |
| Format viewers | `src/components/viewers/` | markdown (sanitized render + source), image (SVG source toggle), PDF (native embed), audio/video, JSON (pretty/raw), CSV (`ProDataTable`), hex dump fallback | — | marked + DOMPurify; pro data-table |
| Routing/deep links | `src/app/router.tsx` | hash history, `?file=<path>` search param synced with selection | URL | `@tanstack/react-router` |

## Behavior and flow
- Verified flow: user grants a folder (File System Access picker — exercised live on the real repo) or drops files / loads the demo tree → tree rows virtualize and lazy directories load on expand → selection resolves a `File` through a TanStack Query (`['file', path]`, staleTime Infinity) → viewer router picks a viewer by extension + NUL-byte sniff → viewer renders; text over 4 MB is truncated with a notice.
- Selection syncs to the hash URL (`#/?file=<path>`); reopening the app restores the last viewed file when the tree contains it. Blob URLs are revoked on file change/unmount.
- Public contracts, compatibility constraints: File System Access API is Chromium-only; Firefox/Safari fall back to drag-and-drop and the `webkitdirectory` compat picker.
- Important invariants and supporting tests: read-only (no write path to disk in code); content stays local; markdown links are forced to `target="_blank"` (verified in `src/lib/markdown.test.ts` after a live navigation-away bug); 26 unit tests cover kind detection, CSV parsing, hex dump, tree filtering, demo/list tree building.

## Trust boundaries
- Untrusted inputs and validation boundary: file contents are untrusted local input. Markdown is sanitized (DOMPurify) before HTML render; SVG renders as `<img>` (inert, script-free) with a source view toggle; Monaco runs in read-only mode without extension executability concerns.
- Authentication/authorization and sensitive data handling: none — no accounts, no network transport of file data.
- Technical security reference or N/A: N/A until a server exists.

## Decisions and maintenance
- D1 (2026-09-26, user-approved): view code with Monaco in read-only mode instead of a lightweight highlighter. Consequence: heavier bundle, best-in-class viewing (folding, line numbers, big-file handling).
- D2 (2026-09-26, user-directed): starter generated from tauri-universal's source CLI, React web framework, no Tauri desktop shell in v1. Consequence: Tailwind v4 + Universal component conventions; `universal.lock.json` records generated-file hashes.
- D2a (2026-09-26, user-directed): the viewer UI is composed from Universal components generated into the project via `universal add` — shell/toolbar (`button`, `toggle-group`, `dropdown-menu`, `separator`, `tooltip`, `card`, `toast`), sidebar filter (`input`), viewer chrome (`tabs`, `badge`, `skeleton`). Custom logic only where the catalog has no component (file tree interactions, viewer routers), always styled with Universal tokens — no parallel hand-rolled widget set. Optional later: `command` palette for quick-open.
- D2b (2026-09-26, user-directed): "all TanStack" — cross-cutting libraries come from the TanStack ecosystem, matching what Universal `pro` already depends on (`@tanstack/react-table` v9, `react-query`, `react-router`, `react-store`, `react-form`): virtualized tree/list rendering via `@tanstack/react-virtual`, file-content loading/caching via `@tanstack/react-query`, app state via `@tanstack/react-store`, tabular CSV rendering via Universal pro data-table on `@tanstack/react-table`, and route-based deep links to a selected file via `@tanstack/react-router`. Consequence: one ecosystem for state/async/table/virtual concerns; no Redux/Zustand/React-Query alternatives mixed in.
- D3 (2026-09-26): no backend and no database (MongoDB declined for v1). Consequence: privacy-friendly, zero-infrastructure viewer; a server-based variant would be a different product.
- Changed component boundaries, contracts, or invariants require updating affected sections in the same work. Record implementation/deployment state where they differ.
- Last verified scope: v1 implemented and GUI-verified 2026-09-26 (every viewer kind exercised in-browser with screenshots). Unresolved questions: hosting/deployment, link navigation inside the tree (preview links open in a new tab for now), media codec coverage on non-Chromium browsers.
