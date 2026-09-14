import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { cn } from '@package/ui/cn';
export interface FrameNavItem {
    label: string;
    to: string;
    icon?: ComponentType<{
        className?: string;
    }>;
}
export interface NavigationRenderProps {
    item: FrameNavItem;
    active: boolean;
    className: string;
    children: ReactNode;
}
export interface AppFrameProps {
    title: string;
    navItems: FrameNavItem[];
    children: ReactNode;
    pathname?: string;
    renderLink?: (props: NavigationRenderProps) => ReactNode;
    headerExtra?: ReactNode;
    sidebarAction?: ReactNode;
    className?: string;
    classNames?: {
        sidebar?: string;
        header?: string;
        content?: string;
        navigation?: string;
    };
    style?: CSSProperties;
}
/** Router-neutral presentation. Routing, permissions, and data stay in the app. */
export function AppFrame({ title, navItems, children, pathname = '', renderLink, headerExtra, sidebarAction, className, classNames = {}, style }: AppFrameProps) {
    const link = renderLink ?? ((props: NavigationRenderProps) => <a href={props.item.to} className={props.className} aria-current={props.active ? 'page' : undefined}>{props.children}</a>);
    const active = (to: string) => pathname === to || (to !== '/' && pathname.startsWith(`${to.replace(/\/$/, '')}/`));
    return (<div data-slot='app-frame' className={cn('flex min-h-screen bg-background text-foreground', className)} style={style}>
      <aside data-slot='app-sidebar' className={cn('sticky top-0 hidden h-screen w-[var(--app-sidebar-width,15rem)] shrink-0 flex-col border-r border-border/70 bg-[var(--sidebar)] backdrop-blur-2xl md:flex', classNames.sidebar)}>
        <div className='flex h-[var(--app-header-height,3.5rem)] items-center justify-between gap-2 border-b border-border/60 px-5 text-[15px] font-semibold'>
          <span className='truncate'>{title}</span>{sidebarAction}
        </div>
        <nav aria-label='Main navigation' className={cn('flex flex-1 flex-col gap-0.5 p-2.5', classNames.navigation)}>
          {navItems.map((item) => <div key={item.to}>{link({
                item, active: active(item.to), className: cn('flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors', active(item.to) ? 'bg-primary font-medium text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'), children: <>{item.icon && <item.icon className='size-4'/>}{item.label}</>
            })}</div>)}
        </nav>
      </aside>
      <div className='flex min-w-0 flex-1 flex-col'>
        <header data-slot='app-header' className={cn('sticky top-0 z-40 flex h-[var(--app-header-height,3.5rem)] items-center justify-between gap-3 border-b border-border/70 bg-[var(--sidebar)] px-4 backdrop-blur-2xl md:px-6', classNames.header)}>
          <nav aria-label='Mobile navigation' className='flex items-center gap-4 overflow-x-auto md:hidden'>
            {navItems.map((item) => <div key={item.to}>{link({
                item, active: active(item.to), className: cn('whitespace-nowrap text-[13px]', active(item.to) ? 'font-semibold text-primary' : 'text-muted-foreground'), children: item.label
            })}</div>)}
          </nav>
          <span className='hidden text-sm text-muted-foreground md:inline'>{title}</span>
          <div className='flex items-center gap-2'>{headerExtra}</div>
        </header>
        <main data-slot='app-content' className={cn('flex-1 p-[var(--app-content-padding,1rem)] md:p-[var(--app-content-padding,1.5rem)]', classNames.content)}>{children}</main>
      </div>
    </div>);
}
