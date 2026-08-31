# Tauri Universal

Token-first Tauri and web application building blocks for React, Vue, Svelte, and React Native Web. Clone the GitHub template, import shared workspace packages, and upgrade the library in place instead of copying component source into each app.

## Quick start

```bash
pnpm install
pnpm dev:web
```

Use `pnpm tauri dev` for the desktop shell. The same frontend runs in a browser through typed platform adapters with local fallbacks.

## React fast path

```tsx
import { ProCrudPage, defineProResource } from '@package/pro/crud';

const tasks = defineProResource<Task, TaskInput>({
  id: 'tasks', title: 'Tasks', getRowId: (row) => row.id,
  columns: [{ key: 'name', header: 'Task', valueType: 'text' }],
  form: {
    schema: [{ fields: [{ name: 'name', label: 'Task', type: 'text', required: true }] }],
    create: { title: 'New task', values: { name: '' } },
  },
});

<ProCrudPage resource={tasks} controller={{ rows, create, remove }} />;
```

Stable subpath exports such as `@package/ui/button`, `@package/pro/data-table`, and `@package/tauri-api/todo-storage` keep imports short. CSS variables and typed slots customize shared components without ejecting their source.

## Agent fast path

```bash
pnpm agent find table --framework react
pnpm agent inspect block.data-table --framework react
pnpm agent recipe crud-page --framework react
pnpm agent check --changed
```

Start with [llms.txt](llms.txt), which routes agents to one focused capability or recipe. The complete bundle in `llms-full.txt` is opt-in.

## Workspace

- `packages/ui`: React primitives and shared design tokens
- `packages/pro`: React forms, tables, layouts, and config-first CRUD pages
- `packages/pro-core`: framework-neutral schemas and table contracts
- `packages/tauri-api`: typed desktop operations with browser fallbacks
- `packages/pro-vue`, `packages/pro-svelte`, `packages/ui-native`: framework adapters

Detailed setup, architecture, APIs, and platform notes live in [the focused documentation](apps/tauri-app/content/docs/index.mdx). Run `pnpm agent budget --check` to enforce the repository's context and consumer-code budgets.
