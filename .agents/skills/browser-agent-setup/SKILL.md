---
name: browser-agent-setup
description: "Set up or repair a reusable browser-to-agent debugging workflow for Antigravity projects using Chrome DevTools MCP plus Inspecto. Use when a repository needs Cursor-like browser inspection: open a running URL, select or annotate UI elements, map them to source, let the agent edit code, then reload and verify with DOM/console/network evidence. Supports monorepos and common frontend build tools by detecting the target app before changing files."
---

# Browser Agent Setup

Create a project-local, repeatable browser inspection workflow. Prefer workspace-scoped configuration so the setup travels with the repository without changing global user settings.

## Workflow

1. Identify the repository root and the frontend app/package that owns the browser UI.
2. Read the repo's agent instructions before modifying files (`AGENTS.md`, `.agents/`, equivalent).
3. Detect package manager and build tool/framework. Do not assume the repo root is the frontend package in a monorepo.
4. Inspect existing MCP, Inspecto, VS Code/Antigravity recommendations, build config, and ignore rules. Merge; never overwrite unrelated entries.
5. Configure Antigravity workspace MCP at `.agents/mcp_config.json` with both:
   - `chrome-devtools`
   - `inspecto`
6. Integrate Inspecto into the target frontend package. Prefer Inspecto's detect/plan/apply flow when the project shape is unfamiliar; for Vite, use the direct Vite plugin pattern in `references/setup-patterns.md`.
7. Add shared Inspecto MCP settings and reusable browser workflows under `.inspecto/`.
8. Recommend the `inspecto.inspecto` extension in the workspace when extension recommendations are used.
9. Preserve local/private overrides by ignoring `.inspecto/settings.local.json` and `.inspecto/prompts.local.json`.
10. Validate static setup with `node scripts/validate-setup.mjs <repo-root> <frontend-package-dir>` from this skill.
11. Run the repository's install, typecheck/test, and build commands. Regenerate the package lockfile if a dependency changed.
12. Start the app and perform a browser proof: select/annotate an element with Inspecto, claim the task from the agent, edit the source, then use Chrome DevTools MCP to reload/reproduce and check console/network before resolving the task.

## Antigravity MCP rules

Use `.agents/mcp_config.json` for workspace-local MCP. Preserve existing `mcpServers` entries.

For Antigravity, configure Chrome DevTools MCP to connect to Antigravity's browser on port 9222:

```json
{
  "mcpServers": {
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
}
```

Do not replace other MCP servers. If port 9222 is customized, preserve the project's actual browser-debug port.

## Inspecto rules

- Keep source instrumentation development-only. Never expose source-path instrumentation in production builds.
- Prefer `pathType: 'absolute'` for monorepos/pnpm workspaces.
- Set shared `.inspecto/settings.json` to MCP delivery and runtime evidence. Do not force an unsupported `ide` enum value; allow IDE auto-detection.
- Keep personal server URLs and overrides in `settings.local.json`, not committed shared config.
- Add a `browser-fix-verify` workflow whose completion condition requires browser verification, not only a code edit.
- For unfamiliar or non-Vite builds, run Inspecto CLI `detect --json` and `plan --json`; review the plan before `apply --json`.

See `references/setup-patterns.md` for exact templates and framework decisions.

## Verification contract

Do not declare success only because files were edited. Require evidence for all applicable checks:

- MCP JSON parses and contains both servers.
- Inspecto shared config parses and uses `delivery.mode = "mcp"`.
- The frontend build config contains Inspecto instrumentation or Inspecto CLI reports it installed.
- Dependency and lockfile are synchronized.
- App starts at its actual dev URL.
- Antigravity browser is running before Chrome DevTools MCP tries to attach.
- Inspecto can select/annotate a rendered element and map it to source.
- Agent can claim the task through Inspecto MCP.
- After a change, Chrome DevTools MCP reloads/reproduces the page and checks console/network.
- The Inspecto session is resolved only after verification passes.

If runtime access is unavailable, leave the change unverified and report the exact remaining commands instead of claiming completion.
