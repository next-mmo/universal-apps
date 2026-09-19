# PRD-0000: Product Requirement Index

> Status: living document  
> Updated: 2026-09-19

## Product architecture

| Layer | Role | Technology |
| :--- | :--- | :--- |
| Applications | Web, Tauri desktop, and framework playground consumers | React, Vue, Svelte, React Native Web, Tauri |
| Shared UI | Tokens, primitives, forms, tables, layouts, and CRUD composition | Canonical workspace source with source-owned consumer distribution |
| Platform | Typed desktop operations with browser fallbacks | TypeScript and Rust |
| Agent interfaces | Focused capability discovery, recipes, docs, and MCP tools | CLI, MCP, `llms.txt` |

## PRDs

| PRD | Title | Status | Summary |
| :--- | :--- | :--- | :--- |
| **0001** | [Tauri Universal Platform](0001-tauri-universal-platform.md) | **draft** | Existing product goal and public boundaries imported from the repository README for human confirmation |
| **0002** | [Source-owned distribution](0002-source-owned-distribution.md) | **review** | Generate editable consumer source without Universal Apps runtime libraries; owner acceptance and release remain pending |
| **0003** | [Counter app token measurement](0003-counter-app-token-measurement.md) | **draft** | Defines how to capture host-reported token usage for one frozen counter app with and without the stack; no result exists until an authorized run |
| **0004** | [Agent-token benchmark: three UI strategies](0004-agent-token-benchmark.md) | **approved** | Measures host-reported agent tokens for one matched todo app built three ways; round 1 smoke is n=1 per arm and its ordering is provisional |
| **0005** | [Uniwind Bare React Native Support](0005-uniwind-bare-support.md) | **approved** | Official support, CLI starter scaffolding, Metro configuration, and documentation for Bare React Native with Uniwind |
| **0006** | [Competitive Parity and Enterprise Pro Expansion](0006-competitive-parity-and-expansion.md) | **draft** | Expansion roadmap for high-demand primitives, Ant Design Pro parity blocks, data connectors, and native ergonomics |
| **0007** | [Enterprise Admin Dashboard Application](0007-admin-dashboard-app.md) | **shipped** | Ant Design Pro and UmiJS inspired enterprise admin portal app (`apps/admin-dashboard`) powered by Full TanStack Suite, `@package/pro`, and `@package/ui` |

## Authority

PRDs define intended behavior after human approval; they do not prove implementation. Use [`CONTEXT.md`](../../CONTEXT.md) to reconcile requirements with current code, checks, and task evidence.
