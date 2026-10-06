# Task 0022: Make the docs live framework preview component-aware

> **Status:** done
> **Type:** fix
> **Created:** 2026-10-03
> **PRD:** `docs/prd/0008-browser-first-docs-app.md`

The "Live framework preview" panel rendered the same hardcoded "New task" card demo on every docs
page, so on `/docs/components/button` it previewed a Card instead of the Button. Reported by the
repository owner on 2026-10-03 ("component Button but preview card — let fix it real").

## Checkpoint Fields (ND)

- Owner: implementation session agent; acceptance stays with the repository maintainer.
- Scope approval: **approved 2026-10-03** — three fix scopes (full component-aware, React-first
  labeling, hide-only) were presented in session and the owner selected the full component-aware fix.
- Execution authorization: granted with that approval, scoped to the docs app preview feature, the
  per-component demo files, and this task record. Publication, push, and release remain outside it.
- Exact next action: none — closed on the `fix/docs-live-preview-component` branch; merge stays with
  the maintainer.

## Goal and scope

- Mode: feature fix (medium risk — docs app only; no runtime packages touched).
- Outcome / why: the panel previews the component the reader is viewing, in each framework, and the
  source panel always shows the exact file that renders (the original `?raw`-source invariant).
- Root cause: `docs-page.tsx` rendered `<FrameworkPreview />` unconditionally on every page, and the
  panel had a single hardcoded demo per framework (`framework-preview-task.tsx` plus one task-card
  example in each `previews/<fw>` app) — nothing component-aware existed.
- In scope: per-component demo files for all four frameworks (18 components: accordion, badge,
  button, card, checkbox, dialog, dropdown-menu, input, label, popover, select, separator, skeleton,
  switch, table, tabs, textarea, tooltip), a `?component=<id>` selection contract for the three
  iframe preview apps, a `componentId` prop and per-demo raw sources for `FrameworkPreview`, and a
  `resolvePreviewComponent(pagePath)` gate so pages without a demo render no panel at all.
- Non-goals: demos for components that never had React demos (calendar, avatar, toast, combobox,
  command, date pickers, drawers — their pages show no panel rather than an unrelated demo), blocks
  pages, new preview frameworks, and changes to `packages/*`.

## Design notes

- One demo file per component per framework: `apps/docs/src/demos/<id>.tsx`,
  `apps/docs/previews/<fw>/src/demos/<id>.{vue,svelte,tsx}`. The React demo files are shared by the
  MDX body (`<ButtonDemo />` lazy imports in `docs-page.tsx`) and the panel, so page demo and panel
  demo cannot drift.
- `FrameworkPreview` indexes the four demo directories with `import.meta.glob(..., { query: '?raw',
  eager: true })`; the iframe gets `/previews/<fw>/?component=<id>` and each preview app resolves the
  id against its own registry, falling back to the original task card only for direct standalone
  visits without the parameter.
- Vue/Svelte demos are token-styled markup (no Vue/Svelte component packages exist — same approach as
  the original task card); Uniwind demos use real `@package/ui-native` components. RN string children
  rules respected (text wrapped in `<Text>` where the native slot does not wrap it).
- Superseded files removed: `component-demos.tsx`, `accordion-demo.tsx`, `framework-preview-task.tsx`.

## Plan

- [x] Split React demos into `apps/docs/src/demos/<id>.tsx` and repoint `docs-page.tsx` lazy imports.
- [x] Add 18 Vue demos + registry selector in `previews/vue/src/preview.vue` (`?component=`).
- [x] Add 18 Svelte demos + registry selector in `previews/svelte/src/preview.svelte` (`?component=`).
- [x] Add 18 Uniwind demos + registry selector in `previews/uniwind/src/preview.tsx` (`?component=`).
- [x] Rework `framework-preview.tsx`: `componentId` prop, per-framework raw sources, iframe query,
      panel description ("The <Component> example, implemented for each framework."), hidden when no
      demo exists for the page.
- [x] Fix Svelte self-closing non-void tags found by the compiler during verification.

## Verification

- `pnpm --filter @app/docs build` (fumadocs-mdx + generate-llm + all three preview builds + vite
  build + `tsc --noEmit`): pass, exit 0 (run twice: once mid-change, once after the final regex fix).
- `pnpm --filter @app/docs build:previews` after the Svelte tag fixes: pass, no compiler warnings.
- `npx oxlint` on all changed/new files: 0 errors (19 pre-existing-style react-perf warnings that
  match the old demo files' patterns).
- `pnpm agent check --changed`: 3 errors found were the three unused `View` imports in new Uniwind
  demos — fixed; re-run clean for the changed set (remaining repo-wide warnings pre-date this change).
- Live browser verification against the running dev server on `/docs/components/button`:
  - React tab renders the real Button variants; source panel shows `apps/docs/src/demos/button.tsx`.
  - Vue / Svelte / Uniwind tabs each render that framework's button demo inside the iframe and show
    `apps/docs/previews/<fw>/src/demos/button.{vue,svelte,tsx}` as the source.
  - Screenshot captured: panel layout and token styling render correctly.
  - `/docs/agent` renders no preview panel.
- One defect found and fixed during verification: the initial page-path regex required a `.mdx`
  suffix, so `page.path` values without an extension hid the panel; the extension is now optional.
