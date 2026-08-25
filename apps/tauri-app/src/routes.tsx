import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { ListTodoIcon, LayoutDashboardIcon, PenSquareIcon } from 'lucide-react';

import DashboardPage from './pages/dashboard-page';
import FormsDemoPage from './pages/forms-page';
import TodosPage from './pages/todos-page';
import { AppShell } from '@package/pro/src/layout/app-shell';

const rootRoute = createRootRoute({
  component: () => (
    <AppShell
      title='Universal Todos'
      navItems={[
        { label: 'Dashboard', to: '/', icon: LayoutDashboardIcon },
        { label: 'Todos', to: '/todos', icon: ListTodoIcon },
        { label: 'Form blocks', to: '/forms', icon: PenSquareIcon },
      ]}
    >
      <Outlet />
    </AppShell>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: DashboardPage });
const todosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/todos',
  component: TodosPage,
});
const formsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forms',
  component: FormsDemoPage,
});

const routeTree = rootRoute.addChildren([indexRoute, todosRoute, formsRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
