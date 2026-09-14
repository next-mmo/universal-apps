# Reuse-first application foundation

This layer is for application composition, not only CRUD. Keep product-specific
rules in the app. Consume public contracts before opening library internals.

## Discovery

```sh
pnpm agent find cancel --framework react
pnpm agent inspect core.async-task --framework react --detail api
pnpm agent recipe cancellable-task --framework vue --example
pnpm agent recipe application-frame --framework react --example
```

The CLI and the three read-only MCP tools share one catalog resolver. Summary
responses are bounded; `api`, `usage`, and `full` are explicit requests for more
context. API cards derive named/default/type imports from source without running
it. Source and catalog hashes identify the version inspected. A long-lived MCP
reads the current manifest instead of keeping an indefinitely stale copy.

Framework compatibility and runtime support are separate metadata. A React search
includes explicitly compatible core/universal contracts. The browser/Tauri Todo
storage adapter is not advertised as a server or React Native persistence layer.
No match means unavailable under those filters, not permission to invent an API.

Usage is implementation-specific. Missing native/Vue/Svelte examples return an
explicit unavailable result instead of React-only examples. Some adapters still
need dedicated minimal examples; inspect their public API or source when needed.

## Router-neutral layout

Import `AppFrame` from `@package/pro/app-frame`. Supply navigation items and the
current pathname. The default renderer uses ordinary anchors. `renderLink` adapts
another router without importing that router into the frame. Existing `AppShell`
imports remain a TanStack Router adapter, with the original required props.

Use `className`, `style`, and `classNames.sidebar/header/content/navigation` for
local customization. Theme layout globally with `--app-sidebar-width`,
`--app-header-height`, and `--app-content-padding`. Put the application theme at
the document root when portaled overlays need to inherit it.

The React/native Button and Input use the shared medium radius instead of a fixed
10px value. Web radius calculations clamp to zero so a square theme is valid.
Other components and the JavaScript token mirror still need a complete theme
coverage audit; this change is not a claim of universal token parity.

## Headless asynchronous behavior

Import `createAsyncTask` from `@package/core/async-task`. It provides `run`,
`cancel`, `reset`, `subscribe`, and `getSnapshot`. States are idle, pending,
success, error, and cancelled. A newer run cancels the previous one and prevents
its late result from overwriting the new state. Synchronous throws and rejected
promises follow the same error path.

Always await/catch `run`, including AbortError cancellation. Pass its AbortSignal
to your transport or worker. Cancelling the controller does not roll back a
server-side effect, payment, or already-persisted write. The caller owns
credentials, authorization, retries, durability, and the business operation.
This is a reusable lifecycle for previews, search, media work, or background jobs,
not a provider, queue server, or full application generator.

## Verification

```sh
pnpm foundation:typecheck
pnpm foundation:test
pnpm agent catalog-check
pnpm agent check --changed --plan
pnpm agent check --base <verified-base-ref> --plan --json
pnpm agent check --base <verified-base-ref> --timeout 300000
pnpm agent check --all
```

Worktree mode deliberately excludes earlier commits; use an explicit base for a
branch review. The existing change-scope implementation supplies committed,
staged, unstaged, deleted, renamed, and untracked paths. Git failures are errors.

Workspace inventory comes from pnpm rather than a hardcoded app list. Standard
package typecheck/test/build scripts and TypeScript project configs are selected
with transitive consumers. Themes and root build changes expand coverage.
Unowned product paths or libraries without checks/checked consumers stop the
runner instead of returning a misleading pass. A Rust/Tauri change requires an
explicit desktop check; a successful web build is not desktop validation.

Each launched check has a deadline and bounded diagnostic output. A timeout is a
failure, never a pass. The runner executes repository test/build scripts; review
untrusted changes before running those scripts with sensitive credentials.

## Evidence and limits

Source-size and response-size budgets are proxies, not billed model-token savings.
Measure complete accepted tasks across multiple app families, including repair
turns and cached input where the host exposes it. Keep consumer tasks separate
from library maintenance. Do not remove tests or compress readable source to win
a token metric. Optional feature packs and deterministic app-code generators are
separate work; no such packs are silently introduced by this foundation.
