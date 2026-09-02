---
name: tauri-universal-ui-components
description: Applies Tauri Universal component composition, compound slots, accessibility, import boundaries, and DOM-to-native adapter patterns.
---

# Tauri Universal UI Components

Use when choosing, composing, or reviewing existing primitives rather than creating a new one.

## Select the adapter

- React DOM consumers import `@package/ui/<component>` and receive Radix-backed behavior where applicable.
- React Native Web consumers use the matching implementation from `@package/ui-native`; do not render DOM or Radix components in the native tree.
- Vue and Svelte consumers use their adapter packages for feature blocks. Do not import React components into those applications.
- Framework-neutral state, table, form, and query logic belongs in `packages/pro-core` and is adapted by `packages/pro*`.

## Prefer composition

Use the component's existing slots and props before reaching for custom markup. Typical shapes include:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Account</CardTitle>
    <CardDescription>Update your profile.</CardDescription>
  </CardHeader>
  <CardContent>{/* fields */}</CardContent>
  <CardFooter className='justify-end'>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant='outline'>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm action</DialogTitle>
      <DialogDescription>This cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>{/* actions */}</DialogFooter>
  </DialogContent>
</Dialog>
```

Keep slot responsibilities explicit. A trigger owns activation, content owns the overlay/panel, titles and descriptions provide accessible naming, and action controls expose the correct disabled/loading state.

## Accessibility and behavior

- Prefer Radix primitives for focus management, keyboard navigation, labeling, and portal behavior on the DOM.
- Reproduce the public state contract on native with the platform's supported primitives; test pressed, disabled, modal, and focus-visible behavior at the native boundary.
- Never hide the only label in placeholder text. Associate labels with controls and expose validation text to assistive technology.
- Keep interactive controls keyboard reachable on the web and touch-target appropriate on native.
- Preserve controlled/uncontrolled behavior and event names when composing wrappers.

## Import and implementation boundaries

```tsx
import { Button } from '@package/ui/button';
import { Card, CardContent } from '@package/ui/card';
```

Use the catalog to resolve native imports and source locations. Existing internal compatibility imports may be encountered; do not introduce new ones merely to match them. Never put raw `invoke` calls or platform capability checks inside a presentational component.
