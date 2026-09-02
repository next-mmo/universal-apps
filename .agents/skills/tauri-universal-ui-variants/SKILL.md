---
name: tauri-universal-ui-variants
description: Designs reusable CVA variant systems for Tauri Universal components while preserving typed APIs, token usage, state coverage, and DOM/native parity.
---

# Tauri Universal UI Variants

Use when adding a visual state, refactoring repeated class combinations, or extending a component's public variant API.

## When a variant is warranted

Create a named variant when a style combination is reused, a component has a meaningful public state, or DOM and native siblings need a shared state vocabulary. Keep one-off layout composition at the call site.

Before editing, inspect the existing `cva` definition, `VariantProps` type, docs, and sibling native component.

## Variant design

- Keep variant names semantic: `default`, `secondary`, `destructive`, `outline`, `ghost`, `success`, or a domain term already used by the component.
- Keep size, tone, density, and interaction state separate unless a compound variant is necessary to express a real combination.
- Use `defaultVariants` for the stable behavior and preserve existing defaults.
- Use semantic token classes in every branch; do not encode a numbered color palette in a variant.
- Merge consumer overrides through `cn` after CVA resolution.
- Extend a component's public type when adding a public variant and update its docs/catalog examples.

```tsx
const badgeVariants = cva('inline-flex items-center rounded-full text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      destructive: 'bg-destructive/10 text-destructive',
      outline: 'border border-border text-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});
```

Use compound variants only when the combination changes behavior or contrast; do not grow a matrix to avoid a small composition class.

## Cross-platform rule

If a variant is public in `@package/ui`, decide whether `@package/ui-native` must expose the same name. Preserve semantic meaning even when the class implementation differs. Verify the variant in the relevant real consumer instead of assuming class compilation proves visual parity.

## Review checklist

- Existing defaults remain unchanged unless the task explicitly changes them.
- Disabled, focus, hover/pressed, loading, and destructive states retain sufficient contrast.
- No duplicate class matrix exists in a sibling or feature block without a reason.
- Types, docs, catalog metadata, and examples describe the new value.
- The smallest affected app build passes.
