import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { ProLayout } from '@package/pro/pro-layout';
import { ProTabs } from '@package/pro/tabs';
import { ProErrorBoundary } from '@package/pro/error-boundary';
import { Toaster } from '@package/ui/toast';
import { ADMIN_MENU_ITEMS, ROUTE_TITLES } from '../config/menu';
import {
  TenantSwitcherWidget,
  GlobalSearchWidget,
  HeaderActionsWidget,
} from './header-widgets';
import { CommandPalette } from './command-palette';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <ProLayout
        title="Universal Pro"
        subtitle="AntD Pro + TanStack Stack"
        menuItems={ADMIN_MENU_ITEMS}
        pathname={location.pathname}
        onNavigate={(path) => navigate({ to: path })}
        header={{
          tenantSwitcher: <TenantSwitcherWidget />,
          search: <GlobalSearchWidget />,
          actions: <HeaderActionsWidget />,
        }}
        tabs={
          <ProTabs
            currentPath={location.pathname}
            onNavigate={(path) => navigate({ to: path })}
            routeTitles={ROUTE_TITLES}
          />
        }
      >
        <ProErrorBoundary fallbackTitle="View Error">
          <Outlet />
        </ProErrorBoundary>
      </ProLayout>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Global Toast Notifications */}
      <Toaster position="bottom-right" />
    </>
  );
}
