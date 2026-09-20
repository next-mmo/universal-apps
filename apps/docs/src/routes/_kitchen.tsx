import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { LayoutDashboardIcon, ListTodoIcon } from 'lucide-react';

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

export const Route = createFileRoute('/_kitchen')({
  component: KitchenLayout,
});
