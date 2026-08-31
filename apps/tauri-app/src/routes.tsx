import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { BookOpenIcon, ListTodoIcon, LayoutDashboardIcon, PenSquareIcon } from 'lucide-react';

import DashboardPage from './pages/dashboard-page';
import DocsPage from './pages/docs-page';
import FormsDemoPage from './pages/forms-page';
import TodosPage from './pages/todos-page';
import { ThemeToggle } from './components/theme-toggle';
import { AppShell } from '@package/pro/app-shell';

const rootRoute = createRootRoute({
  component: () => (
    <AppShell
      title='Universal Todos'
      sidebarAction={<ThemeToggle />}
      navItems={[
        { label: 'Dashboard', to: '/', icon: LayoutDashboardIcon },
        { label: 'Todos', to: '/todos', icon: ListTodoIcon },
        { label: 'Form blocks', to: '/forms', icon: PenSquareIcon },
        { label: 'Docs', to: '/docs', icon: BookOpenIcon },
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
const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/docs/$',
  component: DocsPage,
});

const routeTree = rootRoute.addChildren([indexRoute, todosRoute, formsRoute, docsRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
