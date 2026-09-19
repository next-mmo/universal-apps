import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboardIcon,
  TableIcon,
  FileTextIcon,
  UserCheckIcon,
  ShieldAlertIcon,
  SettingsIcon,
  SunMoonIcon,
  BuildingIcon,
  LogOutIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@package/ui/dialog';
import { Input } from '@package/ui/input';
import { useSettings, setCommandPaletteOpen, toggleTheme } from '../store/settings';
import { switchTenant, AVAILABLE_TENANTS } from '../store/tenant';
import { logout } from '../store/auth';

export function CommandPalette() {
  const { commandPaletteOpen } = useSettings();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  const runCommand = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
    setSearch('');
  };

  const navItems = [
    { title: 'Analysis Dashboard', path: '/dashboard/analysis', icon: LayoutDashboardIcon, group: 'Navigation' },
    { title: 'Workplace Overview', path: '/dashboard/workplace', icon: LayoutDashboardIcon, group: 'Navigation' },
    { title: 'Standard Table List', path: '/list/table-list', icon: TableIcon, group: 'Navigation' },
    { title: 'Editable Pro Table', path: '/list/editable-table', icon: TableIcon, group: 'Navigation' },
    { title: 'Multi-Step Form Wizard', path: '/form/step-form', icon: FileTextIcon, group: 'Navigation' },
    { title: 'Advanced Entity Profile', path: '/profile/advanced', icon: UserCheckIcon, group: 'Navigation' },
    { title: 'Audit Trail Logs', path: '/system/audit-log', icon: ShieldAlertIcon, group: 'Navigation' },
    { title: 'Account Settings', path: '/account/settings', icon: SettingsIcon, group: 'Navigation' },
  ];

  const filteredItems = navItems.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="max-w-xl p-0 overflow-hidden shadow-2xl border border-border/80">
        <DialogHeader className="p-4 pb-2 border-b border-border/60">
          <DialogTitle className="text-sm font-semibold flex items-center justify-between text-muted-foreground">
            <span>Global Command Palette</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
              ESC to close
            </kbd>
          </DialogTitle>
          <div className="pt-2">
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search routes, actions, organizations…"
              className="h-10 text-sm focus-visible:ring-1"
            />
          </div>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto p-2 space-y-4 text-sm">
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1 tracking-wider">
              Navigation
            </div>
            <div className="space-y-0.5">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => runCommand(() => navigate({ to: item.path }))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="flex-1 font-medium">{item.title}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{item.path}</span>
                  </button>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="text-xs text-muted-foreground px-3 py-2">No matching pages.</div>
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1 tracking-wider">
              Workspaces & Tenants
            </div>
            <div className="space-y-0.5">
              {AVAILABLE_TENANTS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => runCommand(() => switchTenant(t.id))}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                >
                  <BuildingIcon className="size-4 text-primary" />
                  <span className="flex-1 font-medium">Switch to {t.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    {t.tier}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1 tracking-wider">
              Quick Actions
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => runCommand(toggleTheme)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors"
              >
                <SunMoonIcon className="size-4 text-amber-500" />
                <span className="flex-1 font-medium">Toggle Light / Dark Mode</span>
              </button>
              <button
                onClick={() => runCommand(logout)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive text-left transition-colors"
              >
                <LogOutIcon className="size-4" />
                <span className="flex-1 font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
