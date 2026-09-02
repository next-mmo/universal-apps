---
name: tauri-universal-ui-validation
description: Validates Tauri Universal UI changes against component contracts, accessibility, tokens, package boundaries, generated docs, and real consumer builds.
---

# Tauri Universal UI Validation

Use for code review, anti-pattern detection, or final validation of a UI change.

## Review checklist

### Ownership and imports

- [ ] The change is in the correct package for its framework and platform.
- [ ] React DOM consumers use `@package/ui/<component>` public subpaths.
- [ ] Native consumers use `@package/ui-native` and do not pull DOM/Radix code into the native tree.
- [ ] Framework-neutral logic remains in `pro-core` and feature adapters remain in their framework package.
- [ ] No new package-root, `src/*`, raw Tauri, or unrelated dependency import was introduced.

### Component behavior

- [ ] Props, defaults, controlled state, and forwarded events remain compatible.
- [ ] Compound slots are used when the component's behavior requires them.
- [ ] Keyboard navigation, focus, labeling, dialog/menu semantics, and validation messaging work on the owning platform.
- [ ] Disabled, loading, empty, error, and pressed/hover states are covered where relevant.
- [ ] DOM/native variants and public state names agree when parity is promised.

### Styling and theme

- [ ] Colors use existing semantic tokens from `tokens.css`.
- [ ] Spacing and radii use existing scales; arbitrary values are justified.
- [ ] Dark mode and contrast remain correct.
- [ ] `cn`/CVA merging is used consistently and inline styles are limited to runtime/native-only values.
- [ ] Native text styles are applied to `Text`, not assumed to inherit from a `View`.

### Repository integration

- [ ] New public components have docs and catalog metadata.
- [ ] The generated docs check is clean when docs/catalog/source changed.
- [ ] At least one real consumer compiles.
- [ ] Existing unrelated dirty-worktree changes are not included in the implementation claim.

## Commands

Run the narrowest relevant checks first:

```bash
pnpm agent check --changed
pnpm agent:docs:check
```

When skills, workflow artifacts, or public documentation changed, also run:

```bash
pnpm workflow:check --strict-budget
pnpm docs:check
bash .agents/scripts/skill.sh check
```

For native work, run `pnpm --filter @app/native-playground build`; for DOM work, run the owning app build. Report warnings, skipped checks, and pre-existing failures separately from regressions.

## Escalate instead of guessing

Stop and ask for a product decision when a proposed change would alter a public API, break DOM/native parity, introduce a new token family, add a dependency, or move behavior across package ownership. A passing typecheck cannot approve those decisions.
