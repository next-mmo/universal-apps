---
name: tauri-universal-ui-performance
description: Reviews shared UI performance across React DOM and React Native Web, including list rendering, memoization, styling cost, and platform-specific work.
---

# Tauri Universal UI Performance

Use when a UI is slow, a list grows beyond a small static set, a cross-platform implementation adds cost, or a review needs performance evidence.

## Start with the boundary

Measure or reproduce the reported cost at the real consumer. Separate browser, Tauri webview, and React Native Web behavior; a class or component change that is cheap in one renderer may not be cheap in another.

## High-value rules

- Use virtualized list primitives for long or unbounded collections; do not render a large list through `map` inside a `ScrollView`-style container.
- Keep row keys stable and derive row content from the item rather than recreating expensive closures and objects unnecessarily.
- Memoize only components or selectors with a measured repeated cost and stable props; avoid blanket `memo`, `useMemo`, or `useCallback`.
- Keep data fetching, query state, and table models in their owning contracts/packages rather than triggering them from presentational primitives.
- Prefer class-based token styling over per-render inline style objects. Reuse CVA definitions and stable class maps.
- Avoid importing a DOM/Radix implementation into native or shipping native-only dependencies to browser consumers.
- For animations, choose a renderer-supported mechanism and provide a reduced or static state when motion is unavailable or disabled.

## Cross-platform checks

For a performance change, verify:

1. The reported consumer no longer reproduces the issue or has a measured improvement.
2. DOM and native builds still compile through their respective package boundaries.
3. Loading, empty, error, disabled, and reduced-motion states remain correct.
4. No platform-specific optimization has leaked into the framework-neutral contract.

Do not call a build pass a performance proof. Record the observation, environment, and relevant measurement in the active task.
