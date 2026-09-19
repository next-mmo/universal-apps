import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';

export interface TabItem {
  id: string;
  title: string;
  path: string;
  closable: boolean;
}

export interface TabsState {
  tabs: TabItem[];
  activeTabId: string;
}

export const ROUTE_META: Record<string, { title: string; closable: boolean }> = {
  '/dashboard/analysis': { title: 'Analysis', closable: false },
  '/dashboard/workplace': { title: 'Workplace', closable: true },
  '/list/table-list': { title: 'Table List', closable: true },
  '/list/editable-table': { title: 'Editable Table', closable: true },
  '/form/step-form': { title: 'Step Form', closable: true },
  '/profile/advanced': { title: 'Advanced Profile', closable: true },
  '/system/audit-log': { title: 'Audit Trail', closable: true },
  '/account/settings': { title: 'Account Settings', closable: true },
};

const STORAGE_KEY = 'universal_admin_tabs_v2';

function loadPersistedTabs(): TabItem[] {
  if (typeof window === 'undefined') {
    return [{ id: '/dashboard/analysis', title: 'Analysis', path: '/dashboard/analysis', closable: false }];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee Analysis is always present and non-closable
        const hasAnalysis = parsed.some((t) => t.path === '/dashboard/analysis');
        if (!hasAnalysis) {
          parsed.unshift({ id: '/dashboard/analysis', title: 'Analysis', path: '/dashboard/analysis', closable: false });
        }
        return parsed;
      }
    }
  } catch {
    // Ignore JSON errors
  }
  return [
    { id: '/dashboard/analysis', title: 'Analysis', path: '/dashboard/analysis', closable: false },
  ];
}

function persistTabs(tabs: TabItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch {
    // Ignore storage quota errors
  }
}

const initialTabs = loadPersistedTabs();

export const tabsStore = new Store<TabsState>({
  tabs: initialTabs,
  activeTabId: typeof window !== 'undefined' ? window.location.pathname : '/dashboard/analysis',
});

/**
 * Synchronize the current route with the keep-alive tabs.
 * Called on route changes, browser navigation, and hard reloads (F5).
 */
export function syncRouteTab(pathname: string) {
  const meta = ROUTE_META[pathname];
  if (!meta) return;

  tabsStore.setState((prev) => {
    const existingIndex = prev.tabs.findIndex((t) => t.path === pathname || t.id === pathname);
    let nextTabs = prev.tabs;

    if (existingIndex === -1) {
      nextTabs = [
        ...prev.tabs,
        { id: pathname, title: meta.title, path: pathname, closable: meta.closable },
      ];
    } else if (!nextTabs[existingIndex].title || nextTabs[existingIndex].title !== meta.title) {
      nextTabs = nextTabs.map((t, idx) => (idx === existingIndex ? { ...t, title: meta.title } : t));
    }

    persistTabs(nextTabs);
    return {
      tabs: nextTabs,
      activeTabId: pathname,
    };
  });
}

export function openTab(tab: { id: string; title: string; path: string; closable?: boolean }) {
  tabsStore.setState((prev) => {
    const meta = ROUTE_META[tab.path];
    const resolvedTitle = tab.title || meta?.title || tab.path;
    const resolvedClosable = tab.closable ?? meta?.closable ?? true;

    const exists = prev.tabs.some((t) => t.id === tab.id || t.path === tab.path);
    const tabs = exists
      ? prev.tabs.map((t) =>
          t.path === tab.path ? { ...t, title: resolvedTitle } : t
        )
      : [...prev.tabs, { ...tab, title: resolvedTitle, closable: resolvedClosable }];

    persistTabs(tabs);
    return {
      tabs,
      activeTabId: tab.id,
    };
  });
}

export function closeTab(tabId: string): string | null {
  let nextActiveId: string | null = null;
  tabsStore.setState((prev) => {
    const targetIndex = prev.tabs.findIndex((t) => t.id === tabId);
    if (targetIndex === -1) return prev;

    const tabs = prev.tabs.filter((t) => t.id !== tabId);
    if (prev.activeTabId === tabId || prev.activeTabId === prev.tabs[targetIndex]?.path) {
      const nextTab = tabs[Math.max(0, targetIndex - 1)] || tabs[0];
      nextActiveId = nextTab ? nextTab.path : '/dashboard/analysis';
      persistTabs(tabs);
      return {
        tabs,
        activeTabId: nextTab ? nextTab.id : '/dashboard/analysis',
      };
    }

    persistTabs(tabs);
    return {
      ...prev,
      tabs,
    };
  });
  return nextActiveId;
}

export function closeOtherTabs(tabId: string) {
  tabsStore.setState((prev) => {
    const tabs = prev.tabs.filter((t) => !t.closable || t.id === tabId || t.path === tabId);
    persistTabs(tabs);
    return {
      tabs,
      activeTabId: tabId,
    };
  });
}

export function useTabs() {
  return useStore(tabsStore);
}
