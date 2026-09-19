---
id: "0007"
title: "Enterprise Admin Dashboard Application (apps/admin-dashboard)"
status: shipped
last-audit: 2026-09-19
---

# Change Proposal: Enterprise Admin Dashboard Application (`apps/admin-dashboard`)

Use only for unresolved product scope. Local delta convention, not an OpenSpec CLI schema. Lifecycle: draft, approved, in-progress, shipped, archived.

## Problem and scope

- **User / problem / desired outcome:**
  Developers building enterprise administrative consoles, internal tools, and SaaS management backends currently lack a turnkey, reference-grade admin dashboard app in Universal Apps. While `@package/pro`, `@package/pro-core`, and `@package/ui` provide robust modular building blocks (`AppFrame`, `PageContainer`, `ProCrudPage`, `ProDescriptions`, `ProForm`, `EditableProTable`), there is no integrated portal application showcasing how these pieces assemble into a coherent, high-productivity admin experience comparable to **Ant Design Pro** and **UmiJS** (nested navigation, RBAC permissions, analytics dashboards, multi-step wizards, search palettes, and profile settings).
  Furthermore, production admin portals require real-world resilience: multi-tenant workspace switching, multi-tab keep-alive navigation, column visibility/density controls, batch CSV export/import, dirty form navigation guards, tabbed notification center, two-tier destructive confirmations, and component-level error boundaries.
  **Desired outcome:** Scaffold and deliver `apps/admin-dashboard` as a premier reference application in the monorepo, demonstrating Ant Design Pro + UmiJS architectural elegance powered by the **Full TanStack Suite** (`Router` + `Query` + `Table` + `Form` + `Virtual` + `Store`) and native Universal Apps foundations (React 19, Tailwind CSS v4, `@package/pro`, `@package/ui`).

- **In scope:**
  - **ADM-01: Pro Layout, Navigation & Workspace Switching**:
    - Collapsible sidebar with multi-level nested menus, badges, and icon indicators.
    - Global top header with Organization/Tenant switcher (`Acme Corp [Production]` vs `Acme [Staging]`).
    - Dynamic breadcrumb trail, global Command/K search palette, dark/light theme switch, and user profile menu.
    - Router-neutral application shell integrated with `PageContainer` (title, description, action buttons, tabbed subviews).
  - **ADM-02: Multi-Tab Keep-Alive Navigation Bar**:
    - Browser-like tab bar beneath header showing open routes (e.g., `Dashboard`, `Users`, `Order #1042`).
    - Context actions: *Close Tab*, *Close Other Tabs*, *Refresh Page*.
    - Tab state caching ensuring preserved scroll positions and active form states during switching.
  - **ADM-03: Global State & RBAC Access Control (TanStack Store + TanStack Router)**:
    - `authStore` (TanStack Store) holding authenticated user profile, active tenant, permissions, and theme settings.
    - Role-based access control (RBAC) with `<Access accessible={...} fallback={<Forbidden403 />} />` component.
    - Route-level permission guards in TanStack Router `beforeLoad` protecting restricted routes.
    - Standard status/exception pages: Login (`/login`), 403 Forbidden, 404 Not Found, 500 Error, plus component-level Error Boundaries.
  - **ADM-04: Analysis & Workplace Dashboards**:
    - **Analysis Dashboard (`/dashboard/analysis`)**: Metric summary cards (Revenue, Visits, Payments, Operations), trend mini-sparklines/charts, sales ranking list, search tag frequency, and conversion breakdown.
    - **Workplace Dashboard (`/dashboard/workplace`)**: Personalized user greeting, project grid cards, quick-access action tiles, team activity audit stream, and project status charts.
  - **ADM-05: Enterprise Data Management & CRUD (`ProTable` Power Tools)**:
    - Advanced Table List (`/list/table-list`) utilizing `ProCrudPage` + TanStack Table with multi-filter toolbar, global search, and pagination.
    - **Column Visibility & Density**: Dropdown to show/hide columns and switch row density (Compact, Default, Relaxed).
    - **Batch Actions & Data Export**: Checkbox selection with floating batch action bar (Batch Status Toggle, CSV Data Export, Batch Delete).
    - Modal (`ProFormDialog`) for quick record creation and slide-over Drawer (`ProFormDrawer`) for detailed entity editing.
    - In-place editable data table (`EditableProTable`) for rapid data-entry workflows.
  - **ADM-06: Destructive Action Safety & Audit Logging**:
    - Two-tier deletion safety: inline Popconfirm for low-risk, modal typing confirmation (`"DELETE"`) for high-risk operations.
    - Dedicated Audit Log view (`/system/audit-log`) displaying timestamped operator actions, IP addresses, and before/after diffs with TanStack Virtual for high performance.
  - **ADM-07: Multi-Step Wizards & Advanced Details (`ProStepForm` & `ProDescriptions`)**:
    - Multi-step distribution/deployment form (`/form/step-form`) using `ProStepForm` with step indicator, validation, and submission confirmation.
    - Advanced Entity Detail view (`/profile/advanced`) using `ProDescriptions` with record headers, status badges, operational logs timeline, and nested relation tables.
  - **ADM-08: Form Safety & Dirty Navigation Guards**:
    - TanStack Form dirty detection wired into TanStack Router navigation blocker to prompt a confirmation dialog before discarding unsaved edits.
  - **ADM-09: Notification Center**:
    - Header notification bell with tabbed popover: **System Alerts**, **Pending Approvals**, and **Mentions** with unread count badges and deep-linking.
  - **ADM-10: Account Settings & Preferences (`/account/settings`)**:
    - Basic settings (profile avatar, display name, contact info, bio).
    - Security settings (password update, 2FA status, active sessions).
    - Notification preferences and theme customization.
  - **ADM-11: Monorepo & Build Architecture**:
    - Dedicated workspace app at `apps/admin-dashboard`.
    - Bundled with Vite 6 + React 19 + TypeScript + Tailwind CSS v4.
    - Workspace dependency links to `@package/ui`, `@package/pro`, `@package/pro-core`, and `@package/core`.
    - Full TanStack Suite: `@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/react-table`, `@tanstack/react-form`, `@tanstack/react-virtual`, `@tanstack/react-store`, and `@tanstack/store`.
    - Zero heavy external UI frameworks (no heavy antd or antd-pro npm packages; 100% native Universal Apps components).

- **Non-goals:**
  - Installing Ant Design or UmiJS packages directly (we are implementing their architecture and ergonomics on top of Universal Apps' Tailwind v4 + Radix + Pro packages).
  - Production backend database coupling (state will use mock services and local browser storage adapters with realistic async delays, ready to plug into REST or Supabase APIs).
  - Replacing or duplicating `apps/tauri-app` (this is a focused enterprise admin portal consumer).

- **Selected requirements / open questions:**
  - Requirements ADM-01 through ADM-11 defined above.
  - All open questions resolved: Full TanStack suite adopted; pure Web first with desktop readiness; native Tailwind/SVG visualizations for lightweight speed.

## Approval record

- **Scope approval:** approved (2026-09-19).
- **Approver / decision date:** repository owner / 2026-09-19.
- **Exact approved requirement IDs, exclusions and document revision or content hash:** ADM-01 through ADM-11.
- **Approval evidence:** User explicit approval: "yes do it" to real-world enterprise scope.
- **Execution authorization:** Authorized for planning and phased implementation of ADM-01 through ADM-11.
- **Scope changes since approval / renewed decision needed:** expanded to include real-world enterprise requirements (ADM-08 to ADM-11).

## Canonical targets and baseline

- **Current feature/API/spec documents:**
  - `packages/pro/` (`app-frame`, `page-container`, `crud`, `data-table`, `descriptions`, `editable-table`, `form`, `step-form`, `form-dialog`, `form-drawer`).
  - `packages/ui/` (primitives: Button, Card, Badge, Input, Select, Dialog, Drawer, Toast, Tabs, Avatar, Toggle, Combobox, DatePicker).
  - `agent/app-foundation.md` (router-neutral layout, async lifecycle, design token contracts).
  - `apps/tauri-app/src/pages/dashboard-page.tsx` and `todos-page.tsx` (existing pro component consumer patterns).
- **Source baseline revision:** current workspace HEAD.
- **New capability:** `apps/admin-dashboard/`. Explicitly state: no baseline application exists for a dedicated Ant Design Pro / UmiJS-style enterprise admin portal.
- **Integration owner / related concurrent changes:** repository maintainers; coordinated with `packages/pro`, `packages/pro-core`, `packages/ui`, and `pnpm-workspace.yaml`.

## Requirement changes

### ADDED

#### ADM-01 — Pro Layout, Navigation & Workspace Switching
- Collapsible sidebar with nested navigation groups, top header with Organization/Tenant switcher, breadcrumb trail, global `Cmd+K` command palette, notification popover, theme switch, and user profile menu.

#### ADM-02 — Multi-Tab Keep-Alive Navigation Bar
- Tab bar displaying open routes with context actions (close, close others, refresh) and cached view state.

#### ADM-03 — Global State & RBAC Access Control
- `authStore` (TanStack Store), `<Access />` component, TanStack Router `beforeLoad` guards, login page, and 403/404/500 exception pages.

#### ADM-04 — Analysis & Workplace Dashboards
- Executive analytics with KPI cards, mini-sparklines, ranking tables, and daily workplace greeting with project grid and activity audit stream.

#### ADM-05 — Enterprise Data Management & CRUD (`ProTable` Power Tools)
- Advanced Table List (`ProCrudPage`), column visibility toggle, density switch, batch export/delete actions, `ProFormDialog`, `ProFormDrawer`, and `EditableProTable`.

#### ADM-06 — Destructive Action Safety & Audit Logging
- Two-tier deletion confirmation (Popconfirm and typed confirmation modal) and audit log stream with TanStack Virtual.

#### ADM-07 — Multi-Step Wizards & Advanced Detail Inspection
- Multi-step form (`ProStepForm`) and structured inspection cards (`ProDescriptions`) with status history timeline.

#### ADM-08 — Form Safety & Dirty Navigation Guards
- TanStack Form dirty detection with navigation confirmation blocker.

#### ADM-09 — Notification Center
- Header notification center with tabbed popover (Alerts, Tasks, Mentions) and deep-links.

#### ADM-10 — Account Settings & Preferences
- User profile, security, and notification settings.

#### ADM-11 — Monorepo Architecture & Build Integration
- Clean monorepo app structure inside `apps/admin-dashboard` powered by Vite 6, React 19, Tailwind CSS v4, and the Full TanStack Suite.

## Design impact and decisions

- **Components touched:**
  - `apps/admin-dashboard/package.json`
  - `apps/admin-dashboard/src/layout/`
  - `apps/admin-dashboard/src/store/`
  - `apps/admin-dashboard/src/access/`
  - `apps/admin-dashboard/src/pages/`
  - `apps/admin-dashboard/src/routes.tsx`
  - `pnpm-workspace.yaml`
- **Selected approach vs alternatives:**
  - Full TanStack Suite (`Router` + `Query` + `Table` + `Form` + `Virtual` + `Store`) with native Universal Apps `@package/pro` and `@package/ui`.
  - Zero heavy external UI frameworks.

## Acceptance and delivery

- [x] `apps/admin-dashboard` builds cleanly with `pnpm --filter @apps/admin-dashboard build`. (verified 2026-09-19: exit 0, 1,996 modules)
- [x] Tenant switcher, collapsible navigation, command palette, and theme toggle operate smoothly. (session-verified, evidence: `docs/tasks/done/done-0012-admin-dashboard-app.md`)
- [x] Multi-tab bar tracks visited routes and permits closing/switching tabs. (session-verified, evidence: `docs/tasks/done/done-0012-admin-dashboard-app.md`)
- [x] RBAC role switcher dynamically restricts routes and actions with 403 fallback. (session-verified, evidence: `docs/tasks/done/done-0012-admin-dashboard-app.md`)
- [x] Analysis & Workplace dashboards render KPIs, charts, and activity feeds. (session-verified, evidence: `docs/tasks/done/done-0012-admin-dashboard-app.md`)
- [x] Table list showcases column visibility, density switch, batch export, and modal/drawer editing. (session-verified, evidence: `docs/tasks/done/done-0012-admin-dashboard-app.md`)
- [x] Step form, detail view, and account settings operate as specified. (session-verified, evidence: `docs/tasks/done/done-0012-admin-dashboard-app.md`)
- [x] `pnpm foundation:typecheck` passes cleanly across the workspace. (verified 2026-09-19 via `pnpm test` and `pnpm nd:check`)
- **Risk tier:** Medium.
