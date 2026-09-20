# Browser-first Kitchen and documentation app

`apps/docs` is the monorepo's React DOM app, built with TanStack Start and Fumadocs. It serves the Kitchen at `/`, `/todos`, and `/forms`, and the component documentation at `/docs/*`.

Run `pnpm dev` from the repository root for local development, or `pnpm build:web` for the production build. The Vue, Svelte, and React Native Web + UniWind examples are built as separate same-origin preview bundles and loaded only after a visitor selects them.

The docs app uses browser storage for its demo Todo data and has no Tauri or Rust runtime. Shared platform bindings remain in their packages for a future, separate native app.
