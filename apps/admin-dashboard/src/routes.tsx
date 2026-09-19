import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import { AdminLayout } from './layout/admin-layout';
import AnalysisPage from './pages/dashboard/analysis-page';
import WorkplacePage from './pages/dashboard/workplace-page';
import TableListPage from './pages/list/table-list-page';
import EditableTablePage from './pages/list/editable-table-page';
import StepFormPage from './pages/form/step-form-page';
import AdvancedProfilePage from './pages/profile/advanced-profile-page';
import AuditLogPage from './pages/system/audit-log-page';
import SettingsPage from './pages/account/settings-page';
import LoginPage from './pages/exception/login';
import ForbiddenPage from './pages/exception/403';
import NotFoundPage from './pages/exception/404';
import { authStore } from './store/auth';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
});

// Standalone Login Route (outside admin sidebar shell)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Admin Shell Layout Route (with RBAC / Auth session beforeLoad guard)
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-shell',
  beforeLoad: () => {
    if (!authStore.state.isAuthenticated) {
      throw redirect({
        to: '/login',
      });
    }
  },
  component: AdminLayout,
});

// Index redirect to analysis
const indexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/dashboard/analysis',
    });
  },
});

const analysisRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/dashboard/analysis',
  component: AnalysisPage,
});

const workplaceRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/dashboard/workplace',
  component: WorkplacePage,
});

const tableListRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/list/table-list',
  component: TableListPage,
});

const editableTableRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/list/editable-table',
  component: EditableTablePage,
});

const stepFormRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/form/step-form',
  component: StepFormPage,
});

const advancedProfileRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/profile/advanced',
  component: AdvancedProfilePage,
});

const auditLogRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/system/audit-log',
  component: AuditLogPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/account/settings',
  component: SettingsPage,
});

const forbiddenRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/403',
  component: ForbiddenPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  adminLayoutRoute.addChildren([
    indexRoute,
    analysisRoute,
    workplaceRoute,
    tableListRoute,
    editableTableRoute,
    stepFormRoute,
    advancedProfileRoute,
    auditLogRoute,
    settingsRoute,
    forbiddenRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
