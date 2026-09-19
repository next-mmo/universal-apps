# Task: Enterprise Admin Dashboard Application (`apps/admin-dashboard`)

Use for multi-step work; skip for genuinely low-risk single-turn changes. Keep this file current before pause, handover, or completion. A session checklist is not a substitute for this durable file. A pre-approval drafting checkpoint is allowed; it authorizes no implementation. Promote in place to implementation once approved for single-stream work (do not duplicate file).

## Goal and scope

- **Mode**: implementation
- **Outcome / why**: Delivered `apps/admin-dashboard` as a reference enterprise admin portal application inspired by Ant Design Pro and UmiJS (nested layout, multi-tenant switcher, keep-alive tabs, RBAC access control, analytics dashboards, multi-step wizards, search palette, column visibility/density, and CRUD tables), showcasing the Full TanStack Suite (`Router` + `Query` + `Table` + `Form` + `Virtual` + `Store`), `@package/pro`, `@package/pro-core`, and `@package/ui`.
- **Requirement or issue / exact draft or approved PRD path and version**: [`docs/prd/0007-admin-dashboard-app.md`](../../prd/0007-admin-dashboard-app.md) (approved revision 1).
- **Scope approval evidence / approver / date / exclusions**: Approved by repository owner on 2026-09-19 via explicit user decision ("yes do it"). Exclusions: direct antd npm dependencies; external database infrastructure.
- **Execution authorization**: Authorized for implementation of ADM-01 through ADM-11.
- **In scope**:
  - ADM-01: Pro layout and navigation shell (collapsible sidebar, multi-tenant switcher, command palette, header with theme switch and notifications).
  - ADM-02: Multi-tab keep-alive navigation bar with route caching and close actions.
  - ADM-03: Global initial state and RBAC access control system (`authStore`, `useAccess`, `<Access />`, 403 status page, login page).
  - ADM-04: Analysis and workplace dashboards with metrics, sparklines, project cards, and activity feeds.
  - ADM-05: Enterprise table list using `ProCrudPage`, column visibility, density switch, batch actions, CSV export, `ProFormDialog`, `ProFormDrawer`, and `EditableProTable`.
  - ADM-06: Destructive action safety (two-tier confirmation) and virtualized audit log stream (`@tanstack/react-virtual`).
  - ADM-07: Multi-step wizard (`ProStepForm`) and detailed inspection page (`ProDescriptions`).
  - ADM-08: Form safety & dirty navigation guards.
  - ADM-09: Notification center with tabbed popover (Alerts, Tasks, Mentions).
  - ADM-10: Account settings (profile, security, notifications).
  - ADM-11: Monorepo integration in `apps/admin-dashboard` with Vite, React 19, TypeScript, Tailwind CSS v4, and Full TanStack Suite.
- **Non-goals**:
  - Direct npm dependency on Ant Design (`antd`) or UmiJS runtime packages.
  - Production backend database coupling (uses simulated async services/local storage).
  - Breaking changes or regressions in existing apps or libraries.
- **Risk and required gates**: Medium risk. Isolated to new application directory `apps/admin-dashboard` and monorepo workspace registration. Automated typecheck and build validation required.

## Ownership and integration

- **Exact task path**: `docs/tasks/done/done-0012-admin-dashboard-app.md`
- **Owner / team**: Antigravity pairing with repository owner.
- **Branch/worktree and base revision**: current workspace HEAD.
- **Owned write paths**:
  - `apps/admin-dashboard/**`
  - `docs/prd/0007-admin-dashboard-app.md`
  - `docs/tasks/done/done-0012-admin-dashboard-app.md`
- **Dependencies / outstanding workers**: None.
- **Integration owner / shared files / merge order**: Repository owner.

## Plan and acceptance

- **Observable outcome — required checks**:
  - [x] `pnpm --filter @apps/admin-dashboard build` executes cleanly (`vite build` in 8.65s, 0 errors).
  - [x] Navigation renders nested routes, collapse toggle, theme toggle, and search palette.
  - [x] Multi-tenant switcher updates active tenant state across workspaces.
  - [x] Multi-tab bar tracks visited routes and permits closing/switching tabs.
  - [x] Role switcher toggles permissions and validates 403 access gates.
  - [x] Analysis dashboard displays KPI metric cards and charts.
  - [x] Table list provides working search, filter, column visibility, density switch, batch actions, and modal/drawer editing.
  - [x] Step form advances through validation to submission with dirty form warning.
  - [x] Detail view renders `ProDescriptions` cards and sub-tables.
  - [x] Virtualized audit log streams entries smoothly with `@tanstack/react-virtual`.
  - [x] `pnpm foundation:typecheck` passes cleanly across workspace (exit 0).
  - [x] `pnpm foundation:test` passes all 46 tests.
  - [x] `pnpm nd:check` passes all suites.

## Verification and closure

- **Criterion / command or inspection / result / evidence location**:
  - `pnpm --filter @apps/admin-dashboard build` -> Pass (0 errors, transformed 1995 modules).
  - `pnpm foundation:typecheck` -> Pass (0 errors).
  - `pnpm foundation:test` -> Pass (46 tests passed).
  - `pnpm nd:check` -> Pass (all foundation, CLI, MCP, and source tests passed).
- **Tested state and relevant environment**: Node 22, pnpm 10.32.1, Windows workspace.
- **Combined-state checks and integration result**: Clean build artifacts in `apps/admin-dashboard/dist`.
- **Status**: done.
