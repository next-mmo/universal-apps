---
id: "0008"
title: "Browser-first docs app with optional framework previews"
status: in-progress
last-audit: 2026-09-20
---

# Change Proposal: Browser-first docs app with optional framework previews

Use only for unresolved product scope. Local delta convention, not an OpenSpec CLI schema. Lifecycle: draft, approved, in-progress, shipped, archived.

## Problem and scope

- **User / problem / desired outcome:**
  The previous `apps/tauri-app` combined the Kitchen demo and Fumadocs site with a Tauri desktop shell. The user wants a faster, browser-first docs site in `apps/docs`, with regular React DOM as the default and optional framework-specific examples and live previews. The site remains one project and one domain; any future Tauri app is separate work.
- **In scope:**
  - **DOC-01: Browser docs app identity:** Rename `apps/tauri-app` to `apps/docs` and rename its workspace package to `@app/docs`; update root scripts and repository references.
  - **DOC-02: TanStack Start and Fumadocs:** Move the current web app to TanStack Start + Fumadocs while preserving the Kitchen routes (`/`, `/todos`, `/forms`), docs routes (`/docs/*`), current content, generated agent docs, and same-domain deployment.
  - **DOC-03: Web-only current app:** Remove the Tauri shell, Rust project, Tauri dependencies, and Tauri-specific app adapters from `apps/docs`. Use browser storage for the web Todo demo. Any future Tauri app will be a separate app/folder or project.
  - **DOC-04: DOM-first documentation:** Keep the docs shell, navigation, prose, and controls as ordinary React DOM. React DOM is the default platform for examples.
  - **DOC-05: Optional framework previews:** Let the platform selector switch the example code and live preview among React DOM, Vue, Svelte, and React Native with UniWind. Keep the selector and docs on the same site/domain. Persist the selection for later visits.
  - **DOC-06: Load previews on demand:** Split platform preview implementations so the default DOM experience does not download Vue, Svelte, or React Native Web/UniWind runtime code before selection. The browser preview for React Native uses React Native Web and therefore renders to DOM; real iOS/Android rendering is outside this docs app.
  - **DOC-07: Faster initial experience:** Capture a current baseline and compare the production docs and Kitchen entry routes after migration. Set a numeric budget from the measured baseline before implementation: each of `/` and `/docs` must load at most 1,000,000 raw bytes of initial JavaScript and CSS combined, excluding HTML. The current Vite SPA baseline is 1,623,248 bytes per route (1,509,601 JavaScript + 113,647 CSS), so the target requires at least a 38.4% reduction. Vue, Svelte, and React Native Web/UniWind code must remain outside that initial transfer.
- **Non-goals:**
  - Removing shared Tauri packages or unrelated platform support from the monorepo.
  - Adding a native mobile or desktop app to `apps/docs`; a future Tauri app is separate work.
  - Changing the public domain, publishing, or deploying the migration.
  - Rebuilding all framework UI packages or changing docs content unrelated to this migration.
- **Selected requirements / open questions:**
  - DOC-01 through DOC-06 reflect the user's clarifications: web-first, `apps/docs`, same site/domain, DOM by default, and opt-in React/Vue/Svelte/UniWind previews.
  - DOC-07 budget set from the baseline captured on 2026-09-20: at most 1,000,000 raw bytes of initial JavaScript + CSS per `/` and `/docs` route. The user was shown this proposed target and said “continue”; use it as the working acceptance budget and report the result transparently.
  - Preserve Vercel hosting while replacing the old static Vite rewrites with TanStack Start's Vercel/Nitro configuration.

## Approval record

- **Scope approval:** approved; implementation resumed and authorized by the user's follow-up “do it now”.
- **Approver / decision date:** user / 2026-09-20.
- **Exact approved requirement IDs, exclusions and document revision or content hash:** DOC-01–DOC-07, including non-goals, draft body SHA-256 `4cfd55b6078406423a8c6fa4f3eb6a9ed32ec1906f9b712b8b8be21125d3b155` (front matter and this approval record excluded).
- **Approval evidence:** User's direct resume instruction: “do it now”, referring to Task 0014 and this saved migration scope, after clarifying the web-only app, `apps/docs` name, same-domain behavior, DOM default, optional UniWind/Vue/Svelte/React previews, and Tauri as a separate future app/project.
- **Execution authorization:** authorized to implement DOC-01–DOC-07 within the docs app and its required workspace/build integration. No production deployment or publication is authorized.
- **Scope changes since approval / renewed decision needed:** The task was initially deferred; the user resumed it on 2026-09-20. No requirements were added or removed. Confirm the performance budget after collecting the current baseline and preserve the existing Vercel target unless evidence requires a scope decision.

## Canonical targets and baseline

- **Current feature/API/spec documents:** `docs/prd/0001-tauri-universal-platform.md`; app usage docs in `apps/docs/content/docs/`; current project and architecture facts in `.agents/docs/PROJECT.md` and `.agents/docs/ARCHITECTURE.md`.
- **Source baseline revision or file-state reference:** repository HEAD `4b3e80c`; working tree was clean when this draft was prepared.
- **New capability:** `apps/docs` browser-first documentation site and optional multi-framework live previews. There is no existing cross-framework live preview selector baseline.
- **Integration owner / related concurrent changes:** repository maintainers; keep the existing Tauri packages and unrelated consumers outside this increment.

## Requirement changes

### ADDED

#### DOC-01 — Browser docs app identity
- The existing app is named and located as `apps/docs` / `@app/docs`; root development/build commands and canonical repository docs target the new identity.
- Given a contributor follows the documented command, when they start or build the docs app, then it resolves the `@app/docs` workspace package.

#### DOC-02 — TanStack Start + Fumadocs site
- The docs and Kitchen demo run as a standard browser application on TanStack Start and Fumadocs. Existing public routes, content, and generated docs remain reachable on the same domain.
- Given a user opens a docs or Kitchen URL directly, when the server responds, then the route renders and client navigation continues to work.

#### DOC-03 — Tauri-free docs app
- `apps/docs` has no Rust/Tauri desktop runtime or Tauri-specific operation dependency. Kitchen Todo persistence uses a browser implementation.
- Given a user builds or runs the docs app, then no Tauri CLI, Rust target, or Tauri runtime is required. Shared Tauri packages remain available for separate consumers or future work.

#### DOC-04 — DOM-first docs experience
- Fumadocs chrome, docs prose, and the default live example use the React DOM implementation.
- Given a user opens the site without changing the platform selection, then the site uses the React DOM preview.

#### DOC-05 — Same-site framework selector
- A persistent platform selector updates framework-specific example code and preview for React DOM, Vue, Svelte, or React Native + UniWind without leaving the docs site/domain.
- Given a user selects a framework, when the preview is ready, then the corresponding implementation is shown and the docs shell remains usable.

#### DOC-06 — Lazy preview loading
- Non-default framework preview code is split from the initial DOM experience and loaded only when selected.
- Given a user keeps the default React DOM selection, then Vue, Svelte, and React Native Web/UniWind preview modules are not loaded into the initial page bundle. If a preview fails to load, the site remains navigable and the user can return to React DOM.

#### DOC-07 — Performance evidence
- Capture comparable production-load evidence for the current baseline and the migrated docs and Kitchen routes. Each route must load at most 1,000,000 raw bytes of initial JavaScript + CSS; report route behavior and the limits of any timing evidence without treating SSR or a smaller initial chunk alone as proof of faster user experience.

## Design impact and decisions

- **Components, data ownership, contracts, and trust boundaries touched:** `apps/docs/**`, root `package.json`, workspace lockfile, Vercel/TanStack Start server output configuration, Fumadocs source and generated agent docs, `.agents/docs/PROJECT.md`, `.agents/docs/ARCHITECTURE.md`, and `llms.txt`.
- **Selected approach / rejected alternatives / consequences:** Keep one Fumadocs/React DOM site and mount platform-specific previews on demand. React Native + UniWind in the browser uses React Native Web; it is a browser DOM preview rather than a native device renderer. Defer native app work to a separate project. Same-origin chunks or isolated same-origin preview entries may be selected during implementation based on build compatibility; the initial bundle must stay DOM-first.
- **Significant risks:** TanStack Start changes the rendering and hosting runtime. Its current release-candidate status and Vercel deployment integration require explicit build/runtime verification. Framework preview integration must not leak optional runtimes into the initial client bundle.

## Acceptance and delivery

- [x] The app is renamed `apps/docs` / `@app/docs`, with workspace scripts and canonical docs updated.
- [x] Kitchen and Fumadocs routes/content load directly on the same domain; no Tauri or Rust setup is required for the app.
- [x] React DOM is the default. Selecting Vue, Svelte, or React Native + UniWind updates the code sample and preview without moving to another site/domain.
- [x] Non-selected preview runtimes are absent from a fresh `/docs` page load and are fetched only when selected; an offline preview leaves the docs shell usable with a return action.
- [x] Each production route `/` and `/docs` loads at most 1,000,000 raw bytes of initial JavaScript + CSS; comparable route asset measurements and available navigation evidence are recorded. Baseline: 1,623,248 bytes per route.
- [x] The TanStack Start production build and Vercel framework configuration are verified; no deployment is included in this scope.
- **Implementation verification (2026-09-20):** `pnpm run build:web` completed successfully, including Fumadocs generation, Vue/Svelte/UniWind preview builds, Nitro production output, and `tsc --noEmit`. Browser inspection confirmed direct rendering of `/`, `/docs`, `/docs/architecture`, `/todos`, and `/forms`. The first-load `/docs` asset inventory contained no preview iframe or preview route. Production route assets measured 728,881 bytes for `/` and 777,414 bytes for `/docs` (raw JS + CSS), reductions of 55.1% and 52.1% from baseline. Selected preview bundles measured 106,831 bytes (Vue), 71,318 bytes (Svelte), and 395,216 bytes (React Native Web + UniWind); each loaded from `/previews/<framework>/` on the same origin and its task action updated the preview. An offline preview produced the fallback and preserved `/docs`; returning to React DOM recovered the example. Navigation duration was not measured, so the asset figures are not a claim about perceived load time. The build also emitted a Nitro warning that its Vite builder requires Vite ^8 while this workspace has Vite 7.3.6; the build passed, but deployment compatibility should be confirmed before release.
- **Delivery state:** implemented and integrated in the local workspace; not deployed. Nitro generated the production server output and `vercel.json` selects TanStack Start with the web build command. Production hosting remains pending and is outside the approved scope.
- **Risk / required approvals / rollback constraints:** High (app runtime and hosting boundary). Scope approval and implementation authorization are recorded above; deployment/publication are not authorized. Reverting the app rename and restoring the prior Vite/Tauri app from version control is the recovery path; no persistent production data is in scope.
- **Current-doc reconciliation plan:** Update project/architecture docs, root scripts, app README, generated docs routes/catalog references, and the PRD index to describe the final web-only app. Leave platform-wide Tauri packages documented as separate capabilities.
- **Implementation, integration, and deployment gates:** Implementation and local production build gates passed as recorded above. Deployment/publication is not authorized.
