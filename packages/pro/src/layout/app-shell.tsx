import { Link, useLocation } from '@tanstack/react-router';

import type { ComponentType, ReactNode } from 'react';
import { cn } from '@package/ui/src/lib/cn';

export interface NavItem {
  label: string;
  to: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface AppShellProps {
  title: string;
  navItems: Array<NavItem>;
  headerExtra?: ReactNode;
  children: ReactNode;
}

/**
 * macOS-window-inspired shell: translucent blurred sidebar with tinted
 * pill selections, hairline separators, floating content area.
 */
export function AppShell({ title, navItems, headerExtra, children }: AppShellProps) {
  const location = useLocation();

  return (
    <div className='flex min-h-screen bg-background text-foreground'>
      <aside className='sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/70 bg-sidebar backdrop-blur-2xl md:flex'>
        <div className='flex h-14 items-center border-b border-border/60 px-5 text-[15px] font-semibold tracking-[-0.02em]'>
          {title}
        </div>
        <nav className='flex flex-1 flex-col gap-0.5 p-2.5'>
          {navItems.map((item) => {
            const active =
              location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-100',
                  active
                    ? 'bg-primary font-medium text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {item.icon !== undefined && <item.icon className='size-4' />}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border/70 bg-sidebar/80 px-4 backdrop-blur-2xl md:px-6'>
          <div className='flex items-center gap-4 overflow-x-auto md:hidden'>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'text-[13px] whitespace-nowrap',
                  location.pathname === item.to
                    ? 'font-semibold text-primary'
                    : 'text-muted-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <span className='hidden text-sm text-muted-foreground md:inline'>{title}</span>
          <div className='flex items-center gap-2'>{headerExtra}</div>
        </header>

        <main className='flex-1 p-4 md:p-6'>{children}</main>
      </div>
    </div>
  );
}
