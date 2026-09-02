---
name: tauri-universal-ui-setup
description: Sets up or repairs Tauri Universal UI packages, Tailwind/Uniwind token wiring, scaffolding, and cross-platform component integration.
---

# Tauri Universal UI Setup

Use when adding a primitive, preparing a consuming app, repairing styling configuration, or deciding where a new UI capability belongs.

## Discover before changing

1. Identify the consumer: React DOM, React Native Web, Vue, or Svelte.
2. Read its package manifest, stylesheet entry, Vite configuration, and the matching local platform docs.
3. Search `apps/tauri-app/public/agent/catalog.json` and the source tree for an existing component or recipe.
4. Check `scaffold.config.json` and use the scaffold command when a supported template exists.

Keep this repository's existing dependencies and versions. Do not install gluestack, NativeWind, Expo, or another UI system as a setup shortcut; this workspace uses Radix/CVA for DOM components and Uniwind for the native playground.

## Scaffold first when supported

Preview before writing:

```bash
pnpm scaffold list
pnpm scaffold add ui <kebab-name> --dry-run
pnpm scaffold add native <kebab-name> --dry-run
```

Use the supported target only after reviewing the generated files and dependency changes. Keep `--no-install` when the task needs a separate dependency decision. Do not use `--allow-placeholder` for production work.

The UI target writes to `packages/ui/src/components/ui`; the native target writes to `packages/ui-native/src/components/ui` and should mirror the DOM public behavior where the catalog claims parity.

## Stylesheet wiring

DOM consumers import the shared tokens stylesheet through the app's existing CSS entry. The native playground currently uses this compatibility wiring:

```css
@import 'tailwindcss';
@import 'uniwind';
@import '@package/ui/src/styles/tokens.css';
@source '../../../packages/ui-native/src';
```

Preserve the `@source` declaration for package code outside the app directory. Do not copy the internal `src/styles` path into new component imports; keep it only where the existing native stylesheet requires it until a deliberate native export is designed. Keep token names and light/dark values in `tokens.css`; update the JavaScript mirror only when real-native consumers need the same data.

## Provider and app boundaries

There is no global gluestack provider to add. Follow the owning package's existing Radix provider or Uniwind theme setup. Keep Tauri operations behind `packages/tauri-api` and do not make setup scripts reach into Rust capabilities.

## Verify setup

- Run the owning app build and `pnpm agent check --changed`.
- If docs or catalog metadata changed, run `pnpm agent:docs:check`.
- If a component was scaffolded, inspect the generated source and confirm no placeholder or internal import was introduced.
- Record dependency or configuration changes in the active task before handoff.
