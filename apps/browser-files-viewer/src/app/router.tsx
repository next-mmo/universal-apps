import {
  createHashHistory, createRootRoute, createRoute, createRouter, Outlet,
} from '@tanstack/react-router';
import App from '../App';

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>): { file?: string } => ({
    file: typeof search.file === 'string' && search.file !== '' ? search.file : undefined,
  }),
  component: () => <App />,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute]),
  history: createHashHistory(),
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
