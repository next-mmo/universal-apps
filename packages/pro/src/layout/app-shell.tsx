import { Link, useLocation } from '@tanstack/react-router';
import { AppFrame } from './app-frame';
import type { AppFrameProps, FrameNavItem } from './app-frame';
export type NavItem = FrameNavItem;
export type AppShellProps = Omit<AppFrameProps, 'pathname' | 'renderLink'>;
/** Backwards-compatible TanStack Router adapter over the router-neutral frame. */
export function AppShell(props: AppShellProps) {
    const location = useLocation();
    return <AppFrame {...props} pathname={location.pathname} renderLink={({ item, active, className, children }) => (<Link to={item.to} className={className} aria-current={active ? 'page' : undefined}>{children}</Link>)}/>;
}
