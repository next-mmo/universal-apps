import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import {
  FilterIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  ListChecksIcon,
  ListTodoIcon,
  MessageSquareTextIcon,
  PanelRightIcon,
  Rows3Icon,
  SquarePenIcon,
  TableIcon,
} from 'lucide-react';

const primaryNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboardIcon },
  { to: '/todos', label: 'Todos', icon: ListTodoIcon },
] as const;

const blockNav = [
  { to: '/blocks/forms', label: 'Forms', icon: SquarePenIcon },
  { to: '/blocks/data-table', label: 'Data Table', icon: TableIcon },
  { to: '/blocks/form-dialog', label: 'Form Dialog', icon: MessageSquareTextIcon },
  { to: '/blocks/page-container', label: 'Page Container', icon: LayoutTemplateIcon },
  { to: '/blocks/form-drawer', label: 'Form Drawer', icon: PanelRightIcon },
  { to: '/blocks/step-form', label: 'Step Form', icon: ListChecksIcon },
  { to: '/blocks/filter-toolbar', label: 'Filter Toolbar', icon: FilterIcon },
  { to: '/blocks/descriptions', label: 'Descriptions', icon: Rows3Icon },
] as const;

const desktopItem =
  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground';
const desktopActive =
  'bg-primary font-medium text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground';
const mobileItem = 'whitespace-nowrap text-[13px] text-muted-foreground';
const mobileActive = 'font-semibold text-primary';

function KitchenLayout() {
  return (
    <div className='flex flex-1 min-h-0'>
      <aside
        data-slot='kitchen-sidebar'
        className='sticky top-[var(--app-header-height,3.5rem)] hidden h-[calc(100vh-var(--app-header-height,3.5rem))] w-[var(--app-sidebar-width,15rem)] shrink-0 flex-col border-r border-border/70 bg-[var(--sidebar)] backdrop-blur-2xl md:flex'
      >
        <nav aria-label='Kitchen navigation' className='flex flex-1 flex-col gap-0.5 p-2.5'>
          {primaryNav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === '/' }}
              className={desktopItem}
              activeProps={{ className: desktopActive }}
            >
              <Icon className='size-4' />
              {label}
            </Link>
          ))}
          <div className='px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Blocks
          </div>
          {blockNav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={desktopItem}
              activeProps={{ className: desktopActive }}
            >
              <Icon className='size-4' />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className='flex min-w-0 flex-1 flex-col'>
        <nav
          aria-label='Mobile kitchen navigation'
          className='flex items-center gap-4 border-b border-border/70 px-4 py-2 overflow-x-auto md:hidden'
        >
          {primaryNav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === '/' }}
              className={mobileItem}
              activeProps={{ className: mobileActive }}
            >
              {label}
            </Link>
          ))}
          {blockNav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={mobileItem}
              activeProps={{ className: mobileActive }}
            >
              {label}
            </Link>
          ))}
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
