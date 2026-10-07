# PRD-0000: Product Requirement Index

> Status: living document  
> Updated: 2026-09-29

## Product architecture

| Layer | Role | Technology |
| :--- | :--- | :--- |
| Applications | Web and framework playground consumers; a Tauri desktop app is future separate work | React, Vue, Svelte, Vanilla Web Components, React Native Web |
| Shared UI | Tokens, primitives, forms, tables, layouts, and CRUD composition | Canonical workspace source with source-owned consumer distribution |
| Platform | Typed native operations with browser fallbacks, consumed by a separate native app | TypeScript; Rust only when a native app exists |
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
| **0008** | [Browser-first docs app with optional framework previews](0008-browser-first-docs-app.md) | **in-progress** | Migrate the Fumadocs/Kitchen app to web-only `apps/docs`, with a DOM-first site and optional lazy React, Vue, Svelte, and UniWind previews |
| **0009** | [Verification foundation and enforced quality gates](0009-verification-foundation.md) | **in-progress** | Behavioral tests for the previously unverified packages, a blocking correctness lint gate, an enforced coverage floor, and gates that fail loudly instead of reporting success |
| **0010** | [ND Light Workflow (ndl) for small applications](0010-nd-light-workflow.md) | **draft** | A second, smaller delivery profile beside ND Workflow: bounded footprint, zero-dependency Node tooling, one enforcement command, and a documented promotion path; scope approval pending |
| **0011** | [ND adoption document closure and task routing](0011-nd-adoption-document-closure.md) | **in-progress** | Five additive edits to the shipped adoption guidance so an adoption ends with one reviewable closure view: canonical documents, task links, optional layout, and how to read `context check` ambiguity |
| **0012** | [Date range picker for @package/ui and ui-native](0012-date-range-picker.md) | **in-progress** | A zero-dependency range mode for the shared Calendar, DOM and native DateRangePicker wrappers, and a from/to pro filter field; RDP-ported semantics, baseline `main` @ `f905871`; closure recorded in `docs/tasks/done/done-0013-date-range-picker.md`; merged to `main` 2026-09-23 |
| **0013** | [Locale-aware date formatting for the date components](0013-locale-aware-date-formatting.md) | **in-progress** | `Intl.DateTimeFormat` replaces the hard-coded English month/weekday/day strings in the date components on both surfaces, with an optional `locale` prop; zero new dependencies, week layout unchanged; closure recorded in `docs/tasks/done/done-0019-locale-aware-date-formatting.md`; merged to `main` 2026-09-23 |
| **0014** | [Production readiness: gates that can fail, pins that resolve, coverage that is true](0014-production-readiness-gates-and-pins.md) | **in-progress** | A line-ending policy, one router version instead of two, a PR gate that actually builds, SHA-pinned actions with dependabot, a release that cannot publish a mismatched tag, a coverage floor that reports the true 40% packages-wide number instead of a curated 96%, and vue/svelte consumer compilation that can fail; recorded in `docs/tasks/wip-0020-production-readiness-gates-and-pins.md` |
| **0015** | [Vanilla Web UI source target](0015-vanilla-web-ui.md) | **in-progress** | Adds framework-free light-DOM Custom Elements as a first-class source CLI target with `create/init/add --framework vanilla`, framework-local short aliases, and smoke/compile gates |
| **0016** | [Nativewind v5 and Expo React Native Support](0016-nativewind-v5-and-expo-support.md) | **in-progress** | Adds dual native engine support for Nativewind v5 RC0 and Uniwind with Tailwind CSS v4, Expo scaffolding, and engine-agnostic @package/ui-native components |
| **0017** | [TanStack Form v2 migration for the pro form components](0017-tanstack-form-v2-migration.md) | **in-progress** | Repins `@tanstack/react-form` to the `2.0.0-alpha.2` line and adapts the single direct consumer in `packages/pro` to the v2 validator array and field-state API with behavior parity; closure recorded in `docs/tasks/done/done-0023-tanstack-form-v2-migration.md` |

## Authority

PRDs define intended behavior after human approval; they do not prove implementation. Use [`CONTEXT.md`](../../CONTEXT.md) to reconcile requirements with current code, checks, and task evidence.

