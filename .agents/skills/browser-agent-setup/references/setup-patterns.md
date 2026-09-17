# Setup patterns

## Contents

- Antigravity MCP
- Inspecto shared configuration
- Browser workflows
- Vite integration
- Non-Vite integration
- Extension recommendation
- Git ignore
- Runtime proof

## Antigravity MCP

Workspace path: `.agents/mcp_config.json`.

Merge this under the existing top-level `mcpServers` object:

```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": [
      "-y",
      "chrome-devtools-mcp@latest",
      "--browser-url=http://127.0.0.1:9222"
    ]
  },
  "inspecto": {
    "command": "npx",
    "args": ["-y", "@inspecto-dev/cli@latest", "mcp"]
  }
}
```

Antigravity's built-in browser must be running for the port-9222 connection. Prefer the built-in browser route over launching a second unrelated Chrome instance.

## Inspecto shared configuration

Create or merge `.inspecto/settings.json`:

```json
{
  "delivery.mode": "mcp",
  "prompt.includeSnippet": false,
  "prompt.autoSend": false,
  "prompt.runtimeContext": true,
  "prompt.runtimeContextPreview": true,
  "prompt.runtimeContextMaxErrors": 5,
  "prompt.runtimeContextMaxRequests": 5
}
```

Do not set `ide: "antigravity"` in shared settings unless the installed Inspecto schema explicitly supports it. Current source-opening code can recognize the `antigravity://` scheme independently of that user-setting enum.

## Browser workflows

Create or merge `.inspecto/prompts.json`:

```json
[
  {
    "id": "browser-debug",
    "kind": "workflow",
    "label": "Browser Debug",
    "prompt": "Claim this Inspecto task. Use the selected UI/source context and Chrome DevTools MCP to reproduce the issue in the running app. Inspect DOM, console, and relevant network requests. Report the root cause and proposed change before editing when risk is non-trivial. Reply with evidence and resolve the Inspecto session only when the diagnosis is complete."
  },
  {
    "id": "browser-fix-verify",
    "kind": "workflow",
    "label": "Fix + Browser Verify",
    "prompt": "Claim this Inspecto task, use the selected UI/source context to locate the implementation, make the smallest correct fix, run relevant project checks, then use Chrome DevTools MCP to reload and reproduce the flow. Check console and relevant network requests and visually verify the selected UI. Resolve the Inspecto session only after browser verification passes; otherwise reply with the remaining failure evidence."
  }
]
```

If prompts already exist, merge by `id` rather than replacing unrelated workflows.

## Vite integration

Install the Inspecto plugin and core client runtime in the frontend package using the repo's package manager. Example for pnpm workspace package:

```bash
pnpm --filter <frontend-package> add -D @inspecto-dev/plugin @inspecto-dev/core
```

For a plain package directory:

```bash
pnpm add -D @inspecto-dev/plugin @inspecto-dev/core
```

Use the Vite plugin only in development mode:

```ts
import { vitePlugin as inspecto } from '@inspecto-dev/plugin';

export default defineConfig(({ mode }) => ({
  plugins: [
    mode !== 'production' &&
      inspecto({
        pathType: 'absolute',
        escapeTags: ['Transition', 'AnimatePresence'],
      }),
    react(),
  ].filter(Boolean),
}));
```

Adapt plugin order to the existing framework and plugins. Do not remove existing plugins.

If the config is async, preserve its structure and only add the conditional Inspecto plugin.

## Non-Vite integration

Prefer Inspecto's machine-readable onboarding instead of guessing build-tool APIs:

```bash
npx -y @inspecto-dev/cli@latest detect --json
npx -y @inspecto-dev/cli@latest plan --json
```

Review the detected project root/build tool and the planned files. If correct:

```bash
npx -y @inspecto-dev/cli@latest apply --json
```

Then inspect the actual diff. Do not accept an apply result that mutates unrelated packages or global IDE settings.

Inspecto supports multiple build-tool adapters; use the installed version's docs/CLI output as the source of truth rather than hard-coding stale Webpack/Rspack behavior into the skill.

## Extension recommendation

If the repository uses `.vscode/extensions.json`, merge:

```json
{
  "recommendations": ["inspecto.inspecto"]
}
```

Keep existing recommendations.

## Git ignore

Add if not already covered:

```gitignore
# Inspecto local/private overrides
.inspecto/settings.local.json
.inspecto/prompts.local.json
```

Do not ignore committed shared `settings.json` or `prompts.json`.

## Runtime proof

1. Install dependencies and regenerate the lockfile.
2. Start the frontend app and note its actual URL/port.
3. In Antigravity, open/start the built-in Chrome browser; Chrome DevTools MCP attaches to `127.0.0.1:9222` by default.
4. Open the app URL in that browser.
5. Use Inspecto Inspect/Annotate mode to select an element and create a task.
6. Ask the agent: `Process my pending Inspecto task and use Chrome DevTools MCP for browser verification.`
7. Verify source mapping, task claim, code edit, page reload, console/network checks, and visual result.
8. Resolve only after browser proof succeeds.
