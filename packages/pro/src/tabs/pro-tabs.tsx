import { useEffect } from 'react';
import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { XIcon, RotateCwIcon } from 'lucide-react';

export interface ProTabItem {
  id: string;
  title: string;
  path: string;
  closable?: boolean;
}

export interface ProTabsState {
  tabs: ProTabItem[];
  activeTabId: string;
}

const STORAGE_KEY = 'universal_pro_tabs_store';

function loadPersistedTabs(defaultTabs: ProTabItem[]): ProTabItem[] {
  if (typeof window === 'undefined') return defaultTabs;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error
  }
  return defaultTabs;
}

function persistTabs(tabs: ProTabItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch {
    // Ignore quota error
  }
}

const DEFAULT_INITIAL_TABS: ProTabItem[] = [
  { id: '/dashboard/analysis', title: 'Analysis', path: '/dashboard/analysis', closable: false },
];

export const proTabsStore = new Store<ProTabsState>({
  tabs: loadPersistedTabs(DEFAULT_INITIAL_TABS),
  activeTabId: typeof window !== 'undefined' ? window.location.pathname : '/dashboard/analysis',
});

export function syncProTab(pathname: string, title?: string, closable: boolean = true) {
  proTabsStore.setState((prev) => {
    const existingIndex = prev.tabs.findIndex((t) => t.path === pathname || t.id === pathname);
    let nextTabs = prev.tabs;

    if (existingIndex === -1) {
      const resolvedTitle = title || pathname.split('/').pop() || pathname;
      nextTabs = [
        ...prev.tabs,
        { id: pathname, title: resolvedTitle, path: pathname, closable },
      ];
    } else if (title && nextTabs[existingIndex].title !== title) {
      nextTabs = nextTabs.map((t, idx) => (idx === existingIndex ? { ...t, title } : t));
    }

    persistTabs(nextTabs);
    return {
      tabs: nextTabs,
      activeTabId: pathname,
    };
  });
}

export function openProTab(tab: ProTabItem) {
  proTabsStore.setState((prev) => {
    const exists = prev.tabs.some((t) => t.id === tab.id || t.path === tab.path);
    const nextTabs = exists
      ? prev.tabs.map((t) => (t.path === tab.path ? { ...t, title: tab.title || t.title } : t))
      : [...prev.tabs, { ...tab, closable: tab.closable ?? true }];

    persistTabs(nextTabs);
    return {
      tabs: nextTabs,
      activeTabId: tab.path,
    };
  });
}

export function closeProTab(tabId: string): string | null {
  let nextActiveId: string | null = null;
  proTabsStore.setState((prev) => {
    const targetIndex = prev.tabs.findIndex((t) => t.id === tabId || t.path === tabId);
    if (targetIndex === -1) return prev;

    const targetTab = prev.tabs[targetIndex];
    if (targetTab.closable === false) return prev;

    const nextTabs = prev.tabs.filter((_, idx) => idx !== targetIndex);
    if (prev.activeTabId === tabId || prev.activeTabId === targetTab.path) {
      const nextTab = nextTabs[Math.max(0, targetIndex - 1)] || nextTabs[0];
      nextActiveId = nextTab ? nextTab.path : '/';
      persistTabs(nextTabs);
      return {
        tabs: nextTabs,
        activeTabId: nextTab ? nextTab.path : '/',
      };
    }

    persistTabs(nextTabs);
    return {
      ...prev,
      tabs: nextTabs,
    };
  });
  return nextActiveId;
}

export function closeOtherProTabs(currentPath: string) {
  proTabsStore.setState((prev) => {
    const nextTabs = prev.tabs.filter((t) => t.closable === false || t.path === currentPath || t.id === currentPath);
    persistTabs(nextTabs);
    return {
      tabs: nextTabs,
      activeTabId: currentPath,
    };
  });
}

export function useProTabs() {
  return useStore(proTabsStore);
}

export interface ProTabsProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  routeTitles?: Record<string, string>;
  className?: string;
}

/**
 * Ant Design Pro Keep-Alive multi-tab navigation bar with automatic route synchronization
 * and localStorage persistence.
 */
export function ProTabs({
  currentPath,
  onNavigate,
  routeTitles = {},
  className = '',
}: ProTabsProps) {
  const { tabs, activeTabId } = useProTabs();

  // Synchronize incoming path with tabs
  useEffect(() => {
    if (currentPath && currentPath !== '/' && currentPath !== '/login') {
      const resolvedTitle = routeTitles[currentPath];
      syncProTab(currentPath, resolvedTitle);
    }
  }, [currentPath, routeTitles]);

  const handleTabClick = (path: string) => {
    const resolvedTitle = routeTitles[path];
    syncProTab(path, resolvedTitle);
    onNavigate(path);
  };

  const handleClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const nextPath = closeProTab(tabId);
    if (nextPath) {
      onNavigate(nextPath);
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.reload();
  };

  return (
    <div
      className={`flex items-center gap-1 border-b border-border/70 bg-card/40 px-3 py-1.5 overflow-x-auto select-none ${className}`}
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {tabs.map((tab) => {
          const isActive =
            tab.id === activeTabId ||
            tab.path === activeTabId ||
            tab.path === currentPath;

          return (
            <div
              key={tab.id || tab.path}
              onClick={() => handleTabClick(tab.path)}
              className={`group flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 border ${
                isActive
                  ? 'bg-background text-foreground border-border/80 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border-transparent'
              }`}
            >
              <span className="truncate max-w-[140px]">{tab.title}</span>
              {isActive && (
                <button
                  type="button"
                  title="Refresh View"
                  onClick={handleRefresh}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent hover:text-accent-foreground transition-opacity"
                >
                  <RotateCwIcon className="size-3 text-muted-foreground hover:text-foreground" />
                </button>
              )}
              {tab.closable !== false && (
                <button
                  type="button"
                  title="Close Tab"
                  onClick={(e) => handleClose(e, tab.id || tab.path)}
                  className="p-0.5 rounded hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-colors"
                >
                  <XIcon className="size-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {tabs.length > 2 && (
        <button
          type="button"
          onClick={() => closeOtherProTabs(currentPath)}
          className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded hover:bg-muted whitespace-nowrap transition-colors"
        >
          Close others
        </button>
      )}
    </div>
  );
}
