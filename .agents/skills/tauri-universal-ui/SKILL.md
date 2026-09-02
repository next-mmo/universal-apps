---
name: tauri-universal-ui
description: Coordinates shared UI work across Tauri Universal's React DOM, React Native Web, Vue, and Svelte surfaces using the repository's tokens, adapters, scaffolding, and agent catalog.
---

# Tauri Universal UI

Use this skill when creating, reviewing, styling, or porting UI in this monorepo. It routes to focused skills while keeping the repository's cross-platform contracts intact.

## Choose the owning layer

| Need | Owner |
| --- | --- |
| React DOM primitive | `packages/ui`, imported from `@package/ui/<component>` |
| React Native Web primitive | `packages/ui-native`, consumed by the native playground |
| Shared form/table/query contract | `packages/pro-core` |
| React feature block | `packages/pro` |
| Vue or Svelte feature block | `packages/pro-vue` or `packages/pro-svelte` |
| Browser/Tauri operation | `packages/tauri-api` |
| Public usage guidance | `apps/tauri-app/content/docs/` and its generated agent catalog |

Do not put framework-specific behavior in `pro-core`, raw Tauri calls in UI components, or DOM components in the native adapter. If a behavior must work on more than one surface, define the contract once and implement the thinnest adapter for each target.

## Working contract

- Inspect the relevant local docs, catalog entry, source file, and real consumer before changing a component.
- Use public package subpaths for `@package/ui`; do not introduce new package-root or internal-source imports.
- Keep `@package/ui-native` behavior aligned with its DOM sibling where parity is promised. Follow the catalog's current native import path until native subpath exports are intentionally designed.
- Use the existing semantic tokens from `packages/ui/src/styles/tokens.css`; keep `packages/ui/src/tokens.ts` synchronized when native runtime data changes.
- Prefer existing component props and composition over one-off classes. Use `cn` for class merging and CVA for reusable variant matrices.
- Preserve keyboard, focus, labeling, disabled, loading, and error behavior at the owning platform boundary.
- New public components or blocks require docs, catalog metadata, and at least one compileable consumer.

## Resolution order

1. Existing component API or compound slot.
2. Composition of existing primitives in the owning package.
3. Existing Tailwind/Uniwind classes using semantic tokens and the repository spacing scale.
4. A named CVA variant when the style combination is reused or part of the public API.
5. A new scaffolded primitive only when composition cannot express the behavior.
6. A platform-specific implementation only when the platform boundary requires it; document the divergence.
7. Inline styles only for native-only values or runtime measurements that classes cannot represent.

## Focused skills

- [Setup](../tauri-universal-ui-setup/SKILL.md): inspect tooling, scaffold a component, or repair CSS/package wiring.
- [Creating components](../tauri-universal-ui-creating-components/SKILL.md): design and implement a new primitive or shared component.
- [Components](../tauri-universal-ui-components/SKILL.md): compose existing primitives, slots, semantics, and adapters.
- [Styling](../tauri-universal-ui-styling/SKILL.md): apply tokens, layout classes, dark mode, and platform-safe styling.
- [Variants](../tauri-universal-ui-variants/SKILL.md): add or refactor CVA variants and state matrices.
- [Performance](../tauri-universal-ui-performance/SKILL.md): review rendering, lists, memoization, and cross-platform costs.
- [Validation](../tauri-universal-ui-validation/SKILL.md): review implementation, docs, generated metadata, and consumer evidence.

## Handoff checks

Use the smallest relevant checks, then run the workflow checks when the skill family or public UI surface changed:

```bash
pnpm agent check --changed
pnpm agent:docs:check
pnpm workflow:check --strict-budget
bash .agents/scripts/skill.sh check
```

For native changes, include the native playground build. For DOM changes, include the owning app or consumer build. Treat existing warnings and unrelated dirty-worktree changes separately from regressions caused by the current change.
