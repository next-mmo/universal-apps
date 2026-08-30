# @package/mcp

Local stdio MCP server that exposes the tauri-universal capability catalog and generated Markdown docs to coding agents — no network, API keys, or hosting required.

## Tools

| Tool | Purpose |
| --- | --- |
| `find_capabilities` | Search components/blocks by keyword, exported symbol, id, framework, or kind |
| `get_component_docs` | Full docs for one capability by catalog id (`ui.button`) or symbol (`Button`) |
| `get_recipe` | Proven composition recipes with required capabilities and verify commands |

The server reads `agent/catalog.json` and the generated `apps/tauri-app/public/docs/*.md` at call time, so it stays current with the checked-in artifacts.

## Register with an MCP client

```json
{
  "mcpServers": {
    "tauri-universal": {
      "command": "npx",
      "args": ["tsx", "packages/mcp/src/index.ts"],
      "cwd": "C:/path/to/tauri-universal"
    }
  }
}
```

Or from a workspace script after the package gains a published binary: `universal-mcp`.

## Test

```bash
pnpm mcp:test
```

Spawns the real server over stdio and asserts the initialize → tools/list → tools/call flow, including native-framework filtering and error responses.
