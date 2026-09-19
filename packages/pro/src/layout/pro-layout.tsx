import { useState, useEffect, useMemo, type ReactNode } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  LayersIcon,
} from 'lucide-react';
import { Button } from '@package/ui/button';
import { Badge } from '@package/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@package/ui/dropdown-menu';

export interface ProMenuItemChild {
  key: string;
  title: string;
  path: string;
  badge?: string;
}

export interface ProMenuItem {
  key: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  path?: string;
  badge?: string;
  adminOnly?: boolean;
  children?: ProMenuItemChild[];
}

export interface ProHeaderProps {
  tenantSwitcher?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  themeToggle?: ReactNode;
  user?: ReactNode;
}

export interface ProLayoutProps {
  /** Application brand title */
  title?: string;
  /** Subtitle or version tag */
  subtitle?: string;
  /** Brand Logo component */
  logo?: ReactNode;
  /** Hierarchical menu configuration */
  menuItems: ProMenuItem[];
  /** Current route pathname */
  pathname: string;
  /** Navigation callback */
  onNavigate: (path: string) => void;
  /** Header slot configurations */
  header?: ProHeaderProps;
  /** Multi-tab keep alive bar slot */
  tabs?: ReactNode;
  /** Custom sidebar footer */
  sidebarFooter?: ReactNode;
  /** Main view children */
  children: ReactNode;
  /** Additional container class name */
  className?: string;
}

/**
 * Ant Design Pro Layout engine for Universal Apps.
 * Renders a collapsible multi-level sidebar, global header with action slots,
 * keep-alive tab integration, and responsive view containers.
 */
export function ProLayout({
  title = 'Universal Pro',
  subtitle = 'Enterprise Admin Console',
  logo,
  menuItems,
  pathname,
  onNavigate,
  header,
  tabs,
  sidebarFooter,
  children,
  className = '',
}: ProLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Determine active parent key from current pathname
  const activeParentKey = useMemo(() => {
    for (const item of menuItems) {
      if (item.children?.some((c) => c.path === pathname) || item.path === pathname) {
        return item.key;
      }
    }
    return menuItems[0]?.key || '';
  }, [menuItems, pathname]);

  // Open submenus
  const [openKeys, setOpenKeys] = useState<string[]>([activeParentKey]);

  // Auto-expand parent submenu when pathname changes
  useEffect(() => {
    if (activeParentKey && !openKeys.includes(activeParentKey)) {
      setOpenKeys((prev) => [...prev, activeParentKey]);
    }
  }, [activeParentKey]);

  const toggleSubMenu = (key: string) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden bg-background text-foreground ${className}`}>
      {/* Sider Left Navigation */}
      <aside
        className={`relative flex flex-col border-r border-border/70 bg-card/60 backdrop-blur-xl transition-all duration-200 z-30 select-none ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-border/70 px-4">
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
          >
            {logo || (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
                <LayersIcon className="size-4" />
              </div>
            )}
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-foreground truncate">
                  {title}
                </span>
                {subtitle && (
                  <span className="text-[10px] text-muted-foreground font-medium truncate">
                    {subtitle}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isParentOpen = openKeys.includes(item.key);
            const hasActiveChild = item.children?.some((c) => c.path === pathname);
            const isSingleActive = item.path === pathname;

            // Collapsed 64px Icon Mode -> Floating Popover SubMenu
            if (collapsed) {
              if (!item.children || item.children.length === 0) {
                return (
                  <button
                    key={item.key}
                    type="button"
                    title={item.title}
                    onClick={() => item.path && onNavigate(item.path)}
                    className={`flex size-10 items-center justify-center rounded-lg mx-auto transition-colors ${
                      isSingleActive
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {Icon && <Icon className="size-4.5" />}
                  </button>
                );
              }

              return (
                <DropdownMenu key={item.key}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      title={item.title}
                      className={`flex size-10 items-center justify-center rounded-lg mx-auto transition-colors ${
                        hasActiveChild
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {Icon && <Icon className="size-4.5" />}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-52 ml-1 shadow-xl border-border/80">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.path;
                      return (
                        <DropdownMenuItem
                          key={child.path}
                          onClick={() => onNavigate(child.path)}
                          className={`text-xs py-2 cursor-pointer flex items-center justify-between ${
                            isChildActive ? 'font-semibold text-primary bg-primary/10' : ''
                          }`}
                        >
                          <span>{child.title}</span>
                          {child.badge && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">
                              {child.badge}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            // Expanded Full Sider Menu
            // Case A: Single link item (no children)
            if (!item.children || item.children.length === 0) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => item.path && onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isSingleActive
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {Icon && <Icon className={`size-4 shrink-0 ${isSingleActive ? 'text-primary-foreground' : ''}`} />}
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge variant={isSingleActive ? 'secondary' : 'outline'} className="text-[9px] px-1.5 py-0 h-3.5">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            }

            // Case B: SubMenu with Level 2 children
            return (
              <div key={item.key} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSubMenu(item.key)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    hasActiveChild
                      ? 'text-primary bg-primary/5 font-bold'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {Icon && <Icon className={`size-4 shrink-0 ${hasActiveChild ? 'text-primary' : 'text-muted-foreground'}`} />}
                    <span className="truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <Badge variant={hasActiveChild ? 'default' : 'outline'} className="text-[9px] px-1.5 py-0 h-3.5">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronDownIcon
                      className={`size-3.5 text-muted-foreground/80 transition-transform duration-200 ${
                        isParentOpen ? 'rotate-180 text-foreground' : ''
                      }`}
                    />
                  </div>
                </button>

                {isParentOpen && (
                  <div className="relative pl-6 pr-1 space-y-0.5 mt-0.5 border-l-2 border-border/50 ml-4.5">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.path;
                      return (
                        <button
                          key={child.path}
                          type="button"
                          onClick={() => onNavigate(child.path)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                            isChildActive
                              ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <span className="truncate">{child.title}</span>
                          {child.badge && (
                            <Badge variant={isChildActive ? 'secondary' : 'outline'} className="text-[9px] px-1.5 py-0 h-3.5">
                              {child.badge}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        {sidebarFooter}

        {/* Collapse / Expand Toggle */}
        <div className="border-t border-border/70 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 h-8 text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRightIcon className="size-4" />
            ) : (
              <>
                <ChevronLeftIcon className="size-4" />
                <span className="text-xs">Collapse Sidebar</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Global Header */}
        <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/70 bg-background/95 backdrop-blur-md px-4 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {header?.tenantSwitcher}
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            {header?.search}
          </div>

          <div className="flex items-center gap-2">
            {header?.actions}
            {header?.themeToggle}
            {header?.user}
          </div>
        </header>

        {/* Multi-Tab Bar Slot */}
        {tabs}

        {/* Content Body Slot */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
