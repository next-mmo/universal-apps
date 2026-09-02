---
name: tauri-universal-ui-creating-components
description: Guides creation of new Tauri Universal primitives and composed components with typed APIs, accessibility, DOM/native parity, docs, and catalog evidence.
---

# Creating Tauri Universal UI Components

Use for a component that does not already exist, a new cross-platform primitive, or a repeated composition that has become a public pattern.

## Component workflow

1. Search the catalog, docs, templates, and both UI packages for the nearest existing behavior.
2. Decide whether the need is a DOM primitive, native primitive, shared contract, or feature block.
3. Define the public states and semantics before writing styles: normal, hover/pressed, focus, disabled, loading, invalid, empty, and error as applicable.
4. Reuse an existing primitive or scaffold a complete template. Add a new dependency only when the owning layer requires behavior that cannot be composed locally.
5. Implement the DOM version with the appropriate Radix primitive for interaction-heavy behavior; implement the native sibling with React Native/Web primitives and Uniwind when parity is part of the contract.
6. Add typed props, stable data attributes or slot markers where the existing package uses them, and preserve native event/ref behavior.
7. Add or update the public docs, catalog entry, and a compileable consumer example.
8. Run focused builds and validation before handoff.

## Keep the API small

- Prefer a semantic prop (`variant`, `size`, `orientation`, `checked`) over forcing consumers to repeat class strings.
- Use compound components when a component has meaningful slots such as trigger/content, header/body/footer, or label/control.
- Forward the platform's normal props unless the component intentionally narrows them for safety.
- Do not add a root `index.ts` barrel or expose internal source paths as a new public API.
- If DOM and native APIs diverge, document the reason and keep shared names and state semantics where feasible.

## Example shape

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@package/ui/cn';
import type { ComponentProps } from 'react';

const noticeVariants = cva('rounded-lg border p-4 text-sm', {
  variants: {
    tone: {
      default: 'border-border bg-card text-card-foreground',
      destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
    },
  },
  defaultVariants: { tone: 'default' },
});

type NoticeProps = ComponentProps<'div'> & VariantProps<typeof noticeVariants>;

export function Notice({ className, tone, ...props }: NoticeProps) {
  return <div data-slot='notice' className={cn(noticeVariants({ tone }), className)} {...props} />;
}
```

The example is a shape, not a mandate to create a new component. Prefer the repository's existing implementation when it already covers the behavior.

## Completion criteria

A new public component is not complete until its implementation, imports, docs, catalog metadata, and at least one real consumer agree. Include native evidence when the component is advertised as cross-platform.
