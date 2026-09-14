# Universal Apps

Source-owned Tauri and web application building blocks for React, Vue, Svelte, and React Native Web. Companies generate the implementation into their own project, edit it locally, and do not install an `@package/*` runtime library. The monorepo packages remain the authoring source and power the development playgrounds.

## Source-first consumer workflow

Build and pack the standalone CLI from this repository before its first release:

```sh
pnpm install
pnpm source:build
pnpm source:pack
```

Then run the packed CLI against an existing company project:

```sh
node /absolute/path/to/universal-apps/dist/universal-cli/cli.mjs init --cwd /path/to/company-app --css src/index.css
node /absolute/path/to/universal-apps/dist/universal-cli/cli.mjs add button pro-crud --cwd /path/to/company-app
```

After an owner publishes `@next-mmo/universal-cli`, the same flow is available through `npx @next-mmo/universal-cli init` and `npx @next-mmo/universal-cli add button pro-crud`. Publication is not implied by this repository change.

Generated applications import their local implementation:

```tsx
import { Button } from '@/lib/universal/ui/components/ui/button';
import { ProCrudPage, defineProResource } from '@/lib/universal/pro/crud/pro-crud-page';
```

The CLI copies transitive helpers, types, and styles; rewrites workspace imports; declares required third-party dependencies; and protects existing edits. `diff`, `--dry-run`, and `doctor` support review. Read the [consumer and release guide](packages/cli/source/README.md) for framework prerequisites, official shadcn registry use, naming, customization, and verification limits.

## Maintainer development

```sh
pnpm dev:web
pnpm tauri dev
pnpm source:test
pnpm source:build
pnpm source:smoke
```

The development apps still use internal workspace imports. This authoring arrangement does not become a dependency of generated consumer apps. The existing `pnpm scaffold` command remains a maintainer-only template/agent tool; `pnpm source` is the consumer generator.

## Workspace

- `packages/ui`, `packages/pro`: React primitives, tokens, forms, tables, layouts, and CRUD pages.
- `packages/core`, `packages/utils`, `packages/pro-core`, `packages/tauri-api`: shared contracts, utilities, and platform adapters.
- `packages/pro-vue`, `packages/pro-svelte`, `packages/ui-native`: framework adapters.
- `packages/cli/source`: standalone consumer CLI and source-registry build graph.

Existing agent catalogs describe maintainer workspace imports. For generated projects, use the source CLI's `list` output and local paths instead. Agent Workflow Scrum and verification evidence remain under [`.agents/`](.agents/docs/agent-workflow.md).
