# Task 0018: Repair the broken MDX expression on the interactive-drawer docs page

> **Status:** done
> **Type:** fix
> **Created:** 2026-09-23
> **PRD:** `docs/prd/0008-browser-first-docs-app.md`

The docs page `/docs/components/drawer-interactive` threw at render time, so the page showed an error
boundary instead of documentation. Reported by the repository owner from the running docs app on
2026-09-23 with a screenshot of the rendered `ReferenceError`.

## Checkpoint Fields (ND)

- Owner: implementation session agent; acceptance stays with the repository maintainer.
- Scope approval: **approved 2026-09-23** — the fix, the task record, and the gate run were presented
  in session and approved directly ("Fix it now").
- Execution authorization: granted with that approval, scoped to the two files below (the docs page and
  this task). Publication, push, and release remain outside it.
- Exact next action: none — closed; push and merge are the maintainer's.

## Goal and scope

- Mode: defect fix (low risk — one content line, no runtime code).
- Outcome / why: the page renders its documentation body again; a reader sees the velocity-dismiss
  description instead of an error message.
- Root cause: `apps/docs/content/docs/components/drawer-interactive.mdx:72` wrote a flick velocity in
  LaTeX (`$> 600\text{ px/s}$`). This docs pipeline registers no math plugin — `source.config.ts` only
  calls `defineDocs` — so `$…$` is plain text while `{ px/s }` is a JSX expression by MDX syntax,
  evaluating the undefined identifier `px`. React's fallback error boundary printed the message on the
  page (console: `ReferenceError: px is not defined at _createMdxContent
  (.../drawer-interactive.mdx?collection=docs:1293:84)`).
- In scope: the one content line, plus the regenerated `llms-full.txt` that embeds it.
- Non-goals: adding a math plugin or KaTeX to the docs pipeline; auditing or rewording the rest of the
  page; touching the interactive-drawer component itself.

## Plan

- [x] Replace the LaTeX fragment with the plain-text form used elsewhere in the docs (`above 600 px/s`).
- [x] Regenerate the embedded docs output (`pnpm agent:docs`) and run `pnpm docs:check`,
      `pnpm agent:docs:check`, `pnpm workflow:check`, and `pnpm lint`.
- [x] Reload the page in the docs app and confirm the body renders without the error.
- [x] Close: evidence ledger, acceptance checkboxes, archive to `docs/tasks/done/`.

## Acceptance Criteria

- [x] The page renders its documentation body in the docs app — the deviation note, the anatomy block,
      and the key-features list — with no `ReferenceError` in the console for that route.
- [x] No LaTeX-style `\text{…}` or `{ … }` expression remains in the docs content tree.
- [x] `pnpm docs:check`, `pnpm agent:docs:check`, `pnpm workflow:check`, and `pnpm lint` pass, with the
      regenerated `llms-full.txt` committed.

## Evidence Ledger

- 2026-09-23 — Report and diagnosis: owner annotated the rendered error on
  `http://localhost:1430/docs/components/drawer-interactive`. Console stack pointed at
  `_createMdxContent` in the compiled `drawer-interactive.mdx`; `source.config.ts` inspected and
  confirms no math plugin; a `\text{` search across `apps/docs/content` returned this single line.
- 2026-09-23 — Pre-existing, not a regression from task 0013: `git log -2 --
  apps/docs/content/docs/components/drawer-interactive.mdx` → last change `d1242ed 2026-09-20
  feat(docs): migrate kitchen app to web-first TanStack Start`, before the date-range work and
  untouched by commit `72718d0`.
- 2026-09-23 — Fix applied on `fix/docs-drawer-interactive-mdx` (based on `main` @ `f905871`): the
  line now reads "Automatically detects a downward flick velocity above 600 px/s to dismiss smoothly."
  `llms-full.txt` regenerated from it.
- 2026-09-23 — Gates after the fix: `pnpm agent:docs` and `pnpm agent:docs:check` → `PASS agent docs
  (49 pages)`; `pnpm docs:check` → `docs: documentation checks passed`; `pnpm workflow:check` →
  `workflow consistency passed` (its one product path is synchronized to this task); `npx oxlint` →
  **0 errors**, 723 warnings (the pre-existing `react-perf` baseline).
- 2026-09-23 — Browser verification on `http://localhost:1430/docs/components/drawer-interactive`:
  console has no `ReferenceError` (only the known inspecto hydration warning and the iframe sandbox
  warnings); `<h1>` is "Interactive Drawer"; the body contains "above 600 px/s" and no "is not defined"
  text; the installation, anatomy, and Vue-preview code blocks render (3 `<pre>` elements, none of them
  an error). The earlier "Loading documentation…" hang did not reproduce in this session — the docs
  body renders.
- 2026-09-23 — LaTeX sweep: `grep -rn '\\text{\|\\frac{' apps/docs/content/` → no matches.

## Verification and closure

- Tested state and relevant environment: Windows, Node 24, docs dev server (`pnpm dev`, port 1430).
- Failed / skipped / unverified checks and reasons: none material — the change is text-only, and the
  affected route was verified in the running app. The docs previews and the rest of the content tree
  were not re-audited, as they are outside this defect's scope.
- Current-doc reconciliation result / conflicts resolved: no canonical document described the LaTeX
  notation; the page now matches the plain-text style used by the other component pages.
- Implemented / integrated / deployed state and evidence: implemented and verified on
  `fix/docs-drawer-interactive-mdx`; push and merge remain the maintainer's actions.
- Status: done; all acceptance criteria met and evidenced.
