# Testing and Acceptance

Select the smallest checks that prove the affected boundary, then add broader checks when shared packages, configuration, generated output, or platform behavior can propagate the change.

## Check matrix

| Boundary | Command or evidence |
| :--- | :--- |
| Static analysis | `pnpm lint` |
| CLI discovery and response budgets | `pnpm agent:test` |
| MCP protocol and tool responses | `pnpm mcp:test` |
| Standard automated suite | `pnpm test` |
| React web build and generated agent docs | `pnpm build` |
| Generated docs drift | `pnpm agent:docs:check` |
| Workflow lifecycle and synchronization | `pnpm workflow:check --strict-budget` |
| Documentation links and budgets | `pnpm docs:check` |
| Agent adapter drift | `bash .agents/scripts/skill.sh check` |
| Rust/Tauri changes | `cargo check --manifest-path apps/tauri-app/src-tauri/Cargo.toml` plus the affected desktop flow |

## Real-boundary acceptance

- UI changes: exercise the visible web or desktop route, relevant viewport and keyboard behavior, and console output.
- Shared package changes: verify a stable public subpath and at least one real application consumer.
- CLI changes: run the public command with success, empty, invalid, and budget-sensitive inputs.
- MCP changes: verify initialization, tool discovery, successful calls, and protocol errors.
- Tauri changes: verify both the typed JavaScript adapter and native command/capability boundary; a web fallback alone is insufficient.
- Generated documentation: regenerate, check drift, and inspect the user-visible output.

## Reliability

Allocate ports and temporary directories atomically, synchronize on observable state rather than sleeps, restore global state exactly, and await subprocess/server teardown to quiescence. Record pre-existing warnings or failures separately from regressions introduced by the active task.
