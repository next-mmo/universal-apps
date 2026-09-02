---
name: tauri-universal-ui-styling
description: Enforces Tauri Universal token-first styling with Tailwind v4, Uniwind parity, dark mode, spacing, class merging, and justified native styles.
---

# Tauri Universal UI Styling

Use when styling components, repairing theme behavior, or reviewing class names and runtime styles.

## Token-first rules

- Use semantic tokens such as `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, and `text-primary-foreground`.
- Do not introduce raw palette colors, numbered Tailwind colors, or new one-off CSS variables when an existing semantic token expresses the intent.
- Use the spacing and radius scales already defined by the repository. Arbitrary values need a concrete platform or visual reason and should not become a repeated pattern.
- Keep light and dark values in `packages/ui/src/styles/tokens.css`; use the existing `dark:` utilities for stateful class changes.
- Use `cn`/`twMerge` at component boundaries so consumer classes can safely override defaults.

```tsx
<Card className='border-border bg-card text-card-foreground'>
  <CardContent>
    <p className='text-muted-foreground'>Details</p>
  </CardContent>
</Card>
```

## Resolution order

1. Component prop or existing variant.
2. A semantic utility class.
3. A named reusable variant with CVA.
4. A token change in the shared stylesheet when the design meaning is genuinely new.
5. A native inline style only for a runtime measurement or a value that Uniwind cannot represent.

Avoid inline style objects for fixed DOM or native class values. In `ui-native`, remember that React Native does not inherit text styles from a parent `View`; place text color, size, and weight on the `Text` primitive.

## DOM/native parity

The native playground imports the same token stylesheet and scans `packages/ui-native/src`. Keep equivalent variant names and semantic colors between sibling components. Web-only hover, focus-ring, and portal behavior may need a native equivalent such as `active:` feedback, modal presentation, or an explicit focus state; do not silently remove an important state.

When a CSS feature has no native equivalent, document the reduced behavior in the platform docs or component source and verify the native fallback.

## Common corrections

```tsx
// Prefer intent over a literal palette.
<Text className='text-muted-foreground' />
<div className='border-border bg-card' />

// Prefer the spacing scale over a new pixel exception.
<Box className='gap-4 p-4' />
```

Check the owning stylesheet before adding a token. Do not copy gluestack token names or setup rules into this system; its token contract is local to this repository.
