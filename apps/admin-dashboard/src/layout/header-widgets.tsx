import { useNavigate } from '@tanstack/react-router';
import {
  SearchIcon,
  SunIcon,
  MoonIcon,
  BuildingIcon,
  ShieldCheckIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';
import { Button } from '@package/ui/button';
import { Badge } from '@package/ui/badge';
import { Avatar, AvatarFallback } from '@package/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@package/ui/dropdown-menu';
import { useAuth, setRole, logout, type UserRole } from '../store/auth';
import { useCurrentTenant, useTenants, switchTenant } from '../store/tenant';
import { useSettings, toggleTheme, setCommandPaletteOpen } from '../store/settings';
import { NotificationPopover } from './notification-popover';

export function TenantSwitcherWidget() {
  const currentTenant = useCurrentTenant();
  const tenants = useTenants();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 px-2.5 font-medium border-border/80 bg-card/60 hover:bg-accent"
        >
          <BuildingIcon className="size-3.5 text-primary" />
          <span className="truncate max-w-[150px] md:max-w-[200px] text-xs font-semibold">
            {currentTenant.name}
          </span>
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
            {currentTenant.env}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase font-semibold">
          Switch Workspace
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => switchTenant(t.id)}
            className="flex items-center justify-between text-xs py-2 cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{t.name}</span>
              <span className="text-[10px] text-muted-foreground">{t.region}</span>
            </div>
            <Badge variant={t.id === currentTenant.id ? 'default' : 'outline'} className="text-[10px] h-4">
              {t.tier}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GlobalSearchWidget() {
  return (
    <button
      type="button"
      onClick={() => setCommandPaletteOpen(true)}
      className="w-full flex items-center justify-between h-8 px-3 rounded-lg border border-border/70 bg-muted/40 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all duration-150"
    >
      <div className="flex items-center gap-2">
        <SearchIcon className="size-3.5" />
        <span>Search routes, users, actions…</span>
      </div>
      <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border/60 font-mono shadow-2xs">
        Ctrl+K
      </kbd>
    </button>
  );
}

export function HeaderActionsWidget() {
  const { currentUser } = useAuth();
  const { theme } = useSettings();
  const navigate = useNavigate();

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
  };

  const handleSignOut = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Mobile Search Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCommandPaletteOpen(true)}
        className="size-8 p-0 md:hidden"
      >
        <SearchIcon className="size-4 text-muted-foreground" />
      </Button>

      {/* Live RBAC Role Switcher Badge */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
          >
            <ShieldCheckIcon className="size-3.5" />
            <span className="capitalize">{currentUser.role}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold">
            Live RBAC Simulator
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleRoleChange('admin')}
            className={`text-xs cursor-pointer ${currentUser.role === 'admin' ? 'font-bold text-primary' : ''}`}
          >
            👑 Admin (Full Access & Audit)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleRoleChange('editor')}
            className={`text-xs cursor-pointer ${currentUser.role === 'editor' ? 'font-bold text-primary' : ''}`}
          >
            ✏️ Editor (CRUD, No System Logs)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleRoleChange('user')}
            className={`text-xs cursor-pointer ${currentUser.role === 'user' ? 'font-bold text-primary' : ''}`}
          >
            👁️ Viewer (Read Only, 403 on Admin)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notifications Popover */}
      <NotificationPopover />

      {/* Theme Switcher */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="size-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
        title="Toggle Theme"
      >
        {theme === 'dark' ? (
          <SunIcon className="size-4 text-amber-400" />
        ) : (
          <MoonIcon className="size-4" />
        )}
      </Button>

      {/* User Profile Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-2 p-1 rounded-full">
            <Avatar className="size-7">
              <AvatarFallback className="text-[11px] font-bold bg-primary text-primary-foreground">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="p-3">
            <div className="flex flex-col space-y-0.5">
              <p className="text-xs font-semibold leading-none text-foreground">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
              <p className="text-[10px] text-primary/80 font-medium pt-1">
                {currentUser.title}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate({ to: '/profile/advanced' })}
            className="text-xs cursor-pointer"
          >
            <UserIcon className="size-3.5 mr-2" />
            User Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate({ to: '/account/settings' })}
            className="text-xs cursor-pointer"
          >
            <SettingsIcon className="size-3.5 mr-2" />
            Account Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <LogOutIcon className="size-3.5 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
