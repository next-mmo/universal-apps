import { Link, Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { ListTodoIcon, LayoutDashboardIcon } from 'lucide-react';

import DashboardPage from './pages/dashboard-page';
import DocsPage from './pages/docs-page';
import FormsDemoPage from './pages/forms-page';
import TodosPage from './pages/todos-page';
import { AppHeader } from './components/app-header';

function RootLayout() {
  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <AppHeader />
      <div className='flex flex-1 min-h-0 flex-col'>
        <Outlet />
      </div>
    </div>
  );
}

function KitchenLayout() {
  return (
    <div className='flex flex-1 min-h-0'>
      <aside
        data-slot='kitchen-sidebar'
        className='sticky top-[var(--app-header-height,3.5rem)] hidden h-[calc(100vh-var(--app-header-height,3.5rem))] w-[var(--app-sidebar-width,15rem)] shrink-0 flex-col border-r border-border/70 bg-[var(--sidebar)] backdrop-blur-2xl md:flex'
      >
        <nav aria-label='Kitchen navigation' className='flex flex-1 flex-col gap-0.5 p-2.5'>
          <Link
            to='/'
            activeOptions={{ exact: true }}
            className='flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            activeProps={{
              className: 'bg-primary font-medium text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground',
            }}
          >
            <LayoutDashboardIcon className='size-4' />
            Dashboard
          </Link>
          <Link
            to='/todos'
            className='flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            activeProps={{
              className: 'bg-primary font-medium text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground',
            }}
          >
            <ListTodoIcon className='size-4' />
            Todos
          </Link>
        </nav>
      </aside>
      <div className='flex min-w-0 flex-1 flex-col'>
        {/* Mobile secondary navigation */}
        <nav
          aria-label='Mobile kitchen navigation'
          className='flex items-center gap-4 border-b border-border/70 px-4 py-2 overflow-x-auto md:hidden'
        >
          <Link
            to='/'
            activeOptions={{ exact: true }}
            className='whitespace-nowrap text-[13px] text-muted-foreground'
            activeProps={{ className: 'font-semibold text-primary' }}
          >
            Dashboard
          </Link>
          <Link
            to='/todos'
            className='whitespace-nowrap text-[13px] text-muted-foreground'
            activeProps={{ className: 'font-semibold text-primary' }}
          >
            Todos
          </Link>
        </nav>
        <main
          data-slot='kitchen-content'
          className='flex-1 p-[var(--app-content-padding,1rem)] md:p-[var(--app-content-padding,1.5rem)]'
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const kitchenLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'kitchen',
  component: KitchenLayout,
});

const indexRoute = createRoute({ getParentRoute: () => kitchenLayoutRoute, path: '/', component: DashboardPage });
const todosRoute = createRoute({
  getParentRoute: () => kitchenLayoutRoute,
  path: '/todos',
  component: TodosPage,
});
const formsRoute = createRoute({
  getParentRoute: () => kitchenLayoutRoute,
  path: '/forms',
  component: FormsDemoPage,
});

const docsIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/docs',
  component: DocsPage,
});

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/docs/$',
  component: DocsPage,
});

const routeTree = rootRoute.addChildren([
  kitchenLayoutRoute.addChildren([indexRoute, todosRoute, formsRoute]),
  docsIndexRoute,
  docsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

