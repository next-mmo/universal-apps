# @package/mcp

Local stdio MCP server that exposes the tauri-universal capability catalog and generated Markdown docs to coding agents — no network, API keys, or hosting required.

## Tools

| Tool | Purpose |
| --- | --- |
| `find_capabilities` | Return up to five ranked matches; symbols are an explicit detail level |
| `get_component_docs` | Return one framework summary by default; `usage` and `full` are opt-in |
| `get_recipe` | Return one framework recipe; complete example source is opt-in |

The server reads `agent/catalog.json` and generated focused Markdown at call time. Normal responses stay below the checked-in 1,200-character budget; callers must request broader context explicitly.

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
