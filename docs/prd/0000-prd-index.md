# PRD-0000: Product Requirement Index

> Status: living document  
> Updated: 2026-09-14

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

## Authority

PRDs define intended behavior after human approval; they do not prove implementation. Use [`CONTEXT.md`](../../CONTEXT.md) to reconcile requirements with current code, checks, and task evidence.
