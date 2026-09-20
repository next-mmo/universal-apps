# Antigravity browser inspection

This workspace combines **Chrome DevTools MCP** and **Inspecto** for Cursor-like browser inspection with Antigravity.

## What is wired

- `.agents/mcp_config.json` exposes `chrome-devtools` (connected to Antigravity's internal browser on `http://127.0.0.1:9222`) and `inspecto` to Antigravity.
- `.inspecto/settings.json` uses MCP delivery and runtime evidence.
- `.inspecto/prompts.json` adds `Fix + Browser Verify` and `Debug in Browser` workflows.
- `.vscode/extensions.json` recommends the `inspecto.inspecto` extension.
- `apps/docs/vite.config.ts` enables Inspecto source instrumentation outside production builds.

The browser app runs on `http://localhost:1430` with `pnpm dev`.

## First-time setup

From the repository root:

```bash
pnpm install
pnpm dev
```

Install the recommended Inspecto extension when Antigravity/VS Code prompts for workspace recommendations.

Restart Antigravity after pulling this configuration so it reloads workspace MCP servers.

## Inspect -> edit -> verify flow

1. Open `http://localhost:1430` in Chrome.
2. Use Inspecto to select or annotate the UI element you want changed.
3. Create the Inspecto task, or use **Fix + Browser Verify**.
4. Ask Antigravity to process the pending Inspecto task.
5. The agent should use Inspecto to map the selected element to its source and Chrome DevTools MCP to verify the running app.
6. Verification should include the changed interaction plus relevant console errors and failed network requests.

Suggested prompt:

```text
Process my pending Inspecto task. Use Inspecto to locate the exact source component, make the smallest maintainable change, then use Chrome DevTools MCP against the running app to reload and verify the result. Check the relevant interaction, console errors, and failed network requests before resolving the task.
```

## Direct browser debugging

You can also skip annotations and ask Antigravity directly:

```text
Open http://localhost:1430 with Chrome DevTools MCP. Reproduce the issue, inspect the DOM, console, and network requests, identify the source code involved, fix it, then reload and verify the original flow.
```

## Local overrides

Keep personal Inspecto overrides in `.inspecto/settings.local.json`; it is ignored by Git. Shared team defaults remain in `.inspecto/settings.json`.

If you need Chrome DevTools MCP to attach to an already-running Chrome instance instead of launching/managing its own browser, override the MCP arguments locally rather than committing machine-specific browser paths or profiles.

## Production safety

Inspecto instrumentation is only added when Vite is not running in production mode. Do not enable source instrumentation in production builds.
