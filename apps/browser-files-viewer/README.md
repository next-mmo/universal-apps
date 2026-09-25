# Browser Files Viewer

A read-only web app for browsing and viewing local files — a viewer, not an IDE. Pick a folder, drag files in, or load the built-in demo tree; everything renders locally in your browser and nothing is ever uploaded.

![stack](https://img.shields.io/badge/React_19-Vite_7-Tailwind_v4) ![tests](https://img.shields.io/badge/tests-26%2F26-brightgreen)

## Open a folder

- **Open folder** (Chrome/Edge) — File System Access API; the tree expands lazily, so huge directories stay fast. Read-only permission.
- **Open folder (compat)** — `webkitdirectory` picker; works in every browser, reads the file list into memory.
- **Drag & drop** — drop files or a whole folder anywhere on the window.
- **Load demo files** — an in-memory sample tree with one file for every viewer; useful for a quick tour and automated checks.

## Viewers

| Type | Rendered as |
|---|---|
| Code & text (ts, py, rs, sh, …) | Monaco editor, **read-only**, syntax highlighting, line numbers |
| Markdown | Sanitized rendered preview + source toggle (links open in a new tab) |
| JSON | Pretty-printed / raw toggle |
| CSV / TSV | Sortable, filterable, paginated table (Universal `ProDataTable` on TanStack Table v9) |
| Images (png, jpg, gif, webp, svg…) | Image preview; SVG also has a source view |
| PDF | Browser's native embedded PDF viewer |
| Audio / video | Native player (codec support depends on your browser) |
| Everything else | Hex dump with ASCII column |

Limits: text over 4 MB is truncated with a notice; CSV rendering is capped at 5,000 rows; the hex view shows the first 4 KB.

## Privacy

Client-side only. Files are read through browser APIs, rendered in memory, and never sent anywhere — there is no backend and no database.

## Development

```sh
pnpm install
pnpm dev        # dev server
pnpm test       # vitest (unit)
pnpm lint       # oxlint
pnpm build      # tsc + vite production build → dist/
pnpm preview    # serve the production build
```

Stack: [tauri-universal](https://github.com/next-mmo) React starter + Universal UI components · TanStack (Router, Query, Store, Table, Virtual) · Monaco (bundled locally). UI widgets come from the Universal catalog; only the file-tree logic is custom.

Agent/process docs live in `.agents/docs/` (workflow contract) and `docs/tasks/` (task board).
