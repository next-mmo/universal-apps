---
id: "0006"
title: "Competitive Parity and Enterprise Pro Expansion"
status: draft
last-audit: 2026-09-19
---

# Change Proposal: Competitive Parity and Enterprise Pro Expansion

Use only for unresolved product scope. Local delta convention, not an OpenSpec CLI schema. Lifecycle: draft, approved, in-progress, shipped, archived.

## Problem and scope

- **User / problem / desired outcome:** Universal Apps possesses a unique architecture (source-owned code generation, multi-surface parity across Web, Bare React Native, and Tauri Desktop, and an agent-native foundation). However, when benchmarked against enterprise design systems like **Ant Design / Ant Design Pro**, **Shadcn UI**, and **Tamagui**, developers face feature gaps in:
  1. Primitive breadth (currently 18 core primitives vs 45-60+ in Ant Design and Shadcn, lacking Drawer/Sheet, Toast, Combobox, and DatePicker).
  2. Enterprise Pro capabilities (Ant Design Pro offers `ProDescriptions`, `EditableProTable`, DrawerForm, StepForm, and multi-filter toolbars; Universal currently has single-record CRUD and basic data-table).
  3. Data adapters for enterprise backends (Supabase, SQLite/Tauri, standard REST/GraphQL query contracts).
  4. Mobile-native physical ergonomics (keyboard avoidance, gesture-driven bottom sheets, haptics).
  5. Public ecosystem distribution (npm registry publishing, interactive preview documentation).
  **Desired outcome:** Establish a phased roadmap and technical specifications to systematically close these gaps, elevating Universal Apps from a niche cross-platform starter to an enterprise-grade, market-leading universal design system that outperforms Ant Design Pro and Shadcn in cross-platform developer velocity.

- **In scope:**
  - **CPE-01: High-Priority Primitives**: Add Drawer/BottomSheet, Toast/Notification, Command/Combobox, Avatar, Toggle/ToggleGroup, and DatePicker/Calendar across Web (`@package/ui`) and Native (`@package/ui-native`).
  - **CPE-02: Enterprise Pro Blocks**: Expand `@package/pro` and `@package/pro-core` with `ProDescriptions`, `DrawerForm`, `StepForm`, inline editable rows for `ProDataTable`, and advanced filter toolbar presets (matching Ant Design Pro's key workflows).
  - **CPE-03: Data & Storage Connectors**: Standardize data query adapters in `pro-core` for Tauri SQLite, browser LocalStorage, and Supabase / REST endpoints.
  - **CPE-04: Mobile Native Ergonomics**: Integrate safe area insets, keyboard-avoiding container wrappers, and gesture-friendly drawer/sheet interactions in `ui-native`.
  - **CPE-05: Ecosystem & Distribution**: Prepare and document npm publication of `@next-mmo/universal-cli`, plus live interactive code block previews on the Fumadocs documentation site.

- **Non-goals:**
  - Full rewrite of existing 18 primitives (keep existing clean Radix Web + Uniwind Native APIs).
  - Replicating niche legacy enterprise components (e.g., Transfer, Watermark, Tour, Cascader).
  - Introducing heavy runtime CSS-in-JS (maintain strict Tailwind CSS v4 source-distribution).
  - Forcing backend opinions (connectors must remain optional plug-in adapters).

- **Selected requirements / open questions:**
  - Requirements CPE-01 through CPE-05 defined below.
  - *Open Question 1*: Should Toast/Notification on native use a pure React Native toast overlay or delegate to platform native alerts/banners?
  - *Open Question 2*: Should DatePicker use native OS date pickers on iOS/Android (`@react-native-community/datetimepicker`) with a custom Radix-style calendar on Web, or a unified JavaScript calendar component across both?
  - *Open Question 3*: Release timing and versioning scheme for `@next-mmo/universal-cli` on npm.

## Approval record

- **Scope approval:** pending (draft).
- **Approver / decision date:** pending user review.
- **Exact approved requirement IDs, exclusions and document revision or content hash:** pending.
- **Approval evidence:** pending explicit user approval.
- **Execution authorization:** not authorized by default; specification-only mode.
- **Scope changes since approval / renewed decision needed:** initial draft.

## Canonical targets and baseline

- **Current feature/API/spec documents:**
  - `apps/tauri-app/content/docs/` (documentation site and component index).
  - `packages/ui/src/` (Web primitives).
  - `packages/ui-native/src/` (React Native primitives).
  - `packages/pro/src/` and `packages/pro-core/src/` (Pro CRUD, Form, Table, Layout).
  - `packages/cli/source/` (CLI generator and registry packager).
  - `agent/catalog.json` (agent component catalog).
- **Source baseline revision:** current workspace HEAD.
- **New capability:** Intended current-doc targets for new primitives, Pro blocks, and connectors; explicitly state no prior baseline exists for `Drawer`, `Toast`, `Command`, or `ProDescriptions`.
- **Integration owner / related concurrent changes:** repository maintainers; coordinated with `packages/ui`, `packages/ui-native`, `packages/pro`, `packages/pro-core`, and `packages/cli`.

## Requirement changes

### ADDED

#### CPE-01 — High-Demand Primitive Expansion
Provide unified Web (`@package/ui`) and Native (`@package/ui-native`) implementations, catalog entries, and source-distribution registry items for:
1. **Drawer / BottomSheet**: Web drawer powered by Vaul/Radix dialog; Native bottom sheet with drag-to-dismiss and snap points.
2. **Toast / Sonner**: Global toast notification system with success/error/loading states, action buttons, and dismiss timer.
3. **Command / Combobox**: Searchable filtering list and popup selector with keyboard navigation.
4. **Avatar**: Image avatar with initials fallback and shape variants.
5. **Toggle & ToggleGroup**: Pressed state toggle button and single/multi-selection group.
6. **DatePicker & Calendar**: Day grid selector, range selection, and formatted text input binding.

#### CPE-02 — Enterprise Pro Components (Ant Design Pro Parity)
1. **ProDescriptions**: Read-only structured data display component with columns, tag badges, copyable values, and schema-driven field renderers matching `ProFieldSchema`.
2. **DrawerForm**: Slide-over form trigger and container for fast create/edit actions without full page navigation.
3. **StepForm**: Multi-step wizard form with state preservation, step validation, and previous/next navigation.
4. **EditableProTable**: Support inline row editing (save, cancel, delete) within `ProDataTable`.
5. **FilterToolbar**: Collapsible query bar supporting search text, filter dropdowns, and date range filters with clear-all actions.

#### CPE-03 — Pro Core Data & Query Connectors
1. Standardized `DataProvider` interface in `@package/pro-core/src/resource`:
   - `getList`, `getOne`, `create`, `update`, `delete`, `deleteMany`.
2. Ready-to-use reference adapters:
   - `sqliteAdapter`: Tauri SQLite / local persistent storage connector.
   - `restAdapter`: Fetch-based REST connector with pagination, sorting, and filter serialization.
   - `supabaseAdapter`: Supabase JavaScript client query connector.

#### CPE-04 — Mobile Native Ergonomics & Polish
1. Safe area container integration: auto-padding for iPhone notch, Dynamic Island, and Android status/navigation bars.
2. Keyboard-aware form wrapper: automatic scrolling when focused inputs are obscured by the software keyboard.
3. Haptic feedback trigger points: subtle haptic response on button taps, toggle switches, and tab changes.

#### CPE-05 — Distribution & Interactive Preview Showcase
1. NPM publication preparation for `@next-mmo/universal-cli` with automated provenance and changelog verification.
2. Interactive component preview widgets in Fumadocs documentation allowing live switching between React DOM, React Native Web, and theme variants.

### MODIFIED
- None (all changes are strictly additive to existing 18 primitives and Pro components).

### REMOVED
- None.

## Design impact and decisions

- **Components, data ownership, contracts, and trust boundaries touched:**
  - `@package/ui` and `@package/ui-native`: new component exports, token alignment.
  - `@package/pro` and `@package/pro-core`: extended schema definitions and adapters.
  - `agent/catalog.json`: new entries and example recipes.
  - `packages/cli/source`: registry rebuild and component templates.
- **Selected approach / rejected alternatives:**
  - *Selected*: Maintain source-owned model. Every new component is distributed as clean source files into the user's project, keeping zero runtime vendor lock-in.
  - *Rejected*: Re-packaging antd or shadcn as heavy dependencies; defeats the core value proposition of Universal Apps.

## Acceptance and delivery

- [ ] Each new primitive compiles cleanly on React DOM (`@package/ui`), React Native Web, and Bare React Native Metro (`@package/ui-native`).
- [ ] 100% export and slot parity verified between Web and Native for all added components.
- [ ] `agent/catalog.json` updated and validated with `pnpm agent catalog-check`.
- [ ] Source distribution verified with `pnpm source:build` and `pnpm source:test`.
- [ ] Pro blocks demonstrated in interactive showcase apps (`apps/tauri-app` and `apps/uniwind-bare`).
- [ ] Documentation pages added for each new component and block under `apps/tauri-app/content/docs/`.
