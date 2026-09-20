// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ProTabs,
  closeOtherProTabs,
  closeProTab,
  openProTab,
  proTabsStore,
  syncProTab,
} from '../src/tabs/pro-tabs.tsx';
import type { ProTabItem } from '../src/tabs/pro-tabs.tsx';

const STORAGE_KEY = 'universal_pro_tabs_store';

const pinned: ProTabItem = { id: '/dashboard/analysis', title: 'Analysis', path: '/dashboard/analysis', closable: false };
const read = () => proTabsStore.state;
const persisted = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');

beforeEach(() => {
  localStorage.clear();
  proTabsStore.setState(() => ({ tabs: [pinned], activeTabId: '/dashboard/analysis' }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('persisted tabs', () => {
  it('starts from the built-in tab when storage is empty', async () => {
    vi.resetModules();
    const mod = await import('../src/tabs/pro-tabs.tsx');

    expect(mod.proTabsStore.state.tabs).toEqual([pinned]);
  });

  it('restores tabs an earlier session persisted', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: '/a', title: 'A', path: '/a', closable: true }]),
    );
    vi.resetModules();
    const mod = await import('../src/tabs/pro-tabs.tsx');

    expect(mod.proTabsStore.state.tabs).toEqual([{ id: '/a', title: 'A', path: '/a', closable: true }]);
  });

  it('falls back to the built-in tab when the payload is not valid JSON', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    vi.resetModules();
    const mod = await import('../src/tabs/pro-tabs.tsx');

    expect(mod.proTabsStore.state.tabs).toEqual([pinned]);
  });

  it('rejects a payload whose entries are not tabs', async () => {
    // A foreign or corrupted key must not become the tab list.
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));
    vi.resetModules();
    const mod = await import('../src/tabs/pro-tabs.tsx');

    expect(mod.proTabsStore.state.tabs).toEqual([pinned]);
  });

  it('rejects a payload whose entries are missing required fields', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: '/a' }, { title: 'B' }]));
    vi.resetModules();
    const mod = await import('../src/tabs/pro-tabs.tsx');

    expect(mod.proTabsStore.state.tabs).toEqual([pinned]);
  });

  it('drops a payload that is an empty array', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    vi.resetModules();
    const mod = await import('../src/tabs/pro-tabs.tsx');

    expect(mod.proTabsStore.state.tabs).toEqual([pinned]);
  });
});

describe('syncProTab', () => {
  it('appends a new tab, activates it, and derives the title from the path', () => {
    syncProTab('/orders/list');

    expect(read().activeTabId).toBe('/orders/list');
    expect(read().tabs.at(-1)).toEqual({
      id: '/orders/list',
      title: 'list',
      path: '/orders/list',
      closable: true,
    });
  });

  it('prefers a supplied title', () => {
    syncProTab('/orders/list', 'Orders');

    expect(read().tabs.at(-1)!.title).toBe('Orders');
  });

  it('updates the title of a tab that already exists', () => {
    syncProTab('/orders/list', 'Orders');
    syncProTab('/orders/list', 'All orders');

    expect(read().tabs.filter((tab) => tab.path === '/orders/list')).toHaveLength(1);
    expect(read().tabs.at(-1)!.title).toBe('All orders');
  });

  it('leaves the state untouched when nothing changes', () => {
    syncProTab('/orders/list', 'Orders');
    const before = read();

    // Repeating the same call must not publish a new state, or an unstable routeTitles prop would
    // re-render the tab bar on every pass.
    syncProTab('/orders/list', 'Orders');

    expect(read()).toBe(before);
  });

  it('persists the tabs it changed', () => {
    syncProTab('/orders/list', 'Orders');

    expect(persisted().map((tab: ProTabItem) => tab.path)).toEqual(['/dashboard/analysis', '/orders/list']);
  });

  it('does not throw when storage refuses the write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(() => syncProTab('/orders/list')).not.toThrow();
  });
});

describe('openProTab', () => {
  it('adds a tab and defaults it to closable', () => {
    openProTab({ id: '/b', title: 'B', path: '/b' });

    expect(read().tabs.at(-1)).toEqual({ id: '/b', title: 'B', path: '/b', closable: true });
    expect(read().activeTabId).toBe('/b');
  });

  it('respects an explicit closable flag', () => {
    openProTab({ id: '/b', title: 'B', path: '/b', closable: false });

    expect(read().tabs.at(-1)!.closable).toBe(false);
  });

  it('updates the title of an existing tab instead of duplicating it', () => {
    openProTab({ id: '/b', title: 'B', path: '/b' });
    openProTab({ id: '/b', title: 'Beta', path: '/b' });

    expect(read().tabs.filter((tab) => tab.path === '/b')).toHaveLength(1);
    expect(read().tabs.at(-1)!.title).toBe('Beta');
  });
});

describe('closeProTab', () => {
  beforeEach(() => {
    syncProTab('/a', 'A');
    syncProTab('/b', 'B');
  });

  it('removes a closable tab', () => {
    closeProTab('/a');

    expect(read().tabs.map((tab) => tab.path)).toEqual(['/dashboard/analysis', '/b']);
  });

  it('refuses to close the pinned tab', () => {
    closeProTab('/dashboard/analysis');

    expect(read().tabs.map((tab) => tab.path)).toEqual(['/dashboard/analysis', '/a', '/b']);
  });

  it('changes nothing for an unknown tab', () => {
    const before = read();
    closeProTab('/nope');

    expect(read()).toBe(before);
  });

  it('activates the neighbour when the active tab closes, and reports the path', () => {
    const next = closeProTab('/b');

    expect(next).toBe('/a');
    expect(read().activeTabId).toBe('/a');
  });

  it('reports nothing when a background tab closes', () => {
    syncProTab('/b');
    const next = closeProTab('/a');

    expect(next).toBeNull();
    expect(read().activeTabId).toBe('/b');
  });

  it('activates the previous tab when the active one closes', () => {
    syncProTab('/a');

    const next = closeProTab('/a');

    // /a sat at index 1, so its predecessor is the pinned tab.
    expect(next).toBe('/dashboard/analysis');
    expect(read().tabs.map((tab) => tab.path)).toEqual(['/dashboard/analysis', '/b']);
    expect(read().activeTabId).toBe('/dashboard/analysis');
  });

  it('falls back to the first remaining tab when the last one closes', () => {
    const next = closeProTab('/b');
    closeProTab('/a');

    // With every closable tab gone the pinned tab is all that is left to activate.
    expect(next).toBe('/a');
    expect(read().tabs.map((tab) => tab.path)).toEqual(['/dashboard/analysis']);
    expect(read().activeTabId).toBe('/dashboard/analysis');
  });
});

describe('closeOtherProTabs', () => {
  it('keeps the pinned tabs and the current one', () => {
    syncProTab('/a', 'A');
    syncProTab('/b', 'B');

    closeOtherProTabs('/b');

    expect(read().tabs.map((tab) => tab.path)).toEqual(['/dashboard/analysis', '/b']);
    expect(read().activeTabId).toBe('/b');
  });
});

describe('ProTabs', () => {
  const setup = () => {
    const onNavigate = vi.fn<(path: string) => void>();
    render(<ProTabs currentPath='/a' onNavigate={onNavigate} routeTitles={{ '/a': 'A' }} />);
    return { onNavigate };
  };

  it('renders a tablist with the current route as the selected tab', () => {
    setup();

    const selected = screen.getAllByRole('tab').filter((tab) => tab.getAttribute('aria-selected') === 'true');
    expect(selected.map((tab) => tab.textContent)).toContain('A');
  });

  it('synchronizes the incoming path into a tab', async () => {
    render(<ProTabs currentPath='/a' onNavigate={vi.fn<(path: string) => void>()} routeTitles={{ '/a': 'A' }} />);

    await waitFor(() => {
      expect(read().tabs.some((tab) => tab.path === '/a')).toBe(true);
    });
  });

  it('navigates when a tab is clicked', async () => {
    syncProTab('/b', 'B');
    const onNavigate = vi.fn<(path: string) => void>();
    render(<ProTabs currentPath='/a' onNavigate={onNavigate} routeTitles={{}} />);

    await userEvent.click(screen.getByText('B'));

    expect(onNavigate).toHaveBeenCalledWith('/b');
  });

  it('navigates when a tab is activated from the keyboard', async () => {
    syncProTab('/b', 'B');
    const onNavigate = vi.fn<(path: string) => void>();
    render(<ProTabs currentPath='/a' onNavigate={onNavigate} routeTitles={{}} />);

    const tab = screen.getByRole('tab', { name: /B/ });
    tab.focus();
    await userEvent.keyboard('{Enter}');

    expect(onNavigate).toHaveBeenCalledWith('/b');
  });

  it('closes a tab and navigates to the neighbour', async () => {
    syncProTab('/b', 'B');
    const onNavigate = vi.fn<(path: string) => void>();
    render(<ProTabs currentPath='/b' onNavigate={onNavigate} routeTitles={{}} />);

    const tab = screen.getByRole('tab', { name: /B/ });
    await userEvent.click(within(tab).getByTitle('Close Tab'));

    expect(read().tabs.some((item) => item.path === '/b')).toBe(false);
    expect(onNavigate).toHaveBeenCalledWith('/dashboard/analysis');
  });

  it('offers no close control on a pinned tab', () => {
    syncProTab('/a', 'A');
    render(<ProTabs currentPath='/a' onNavigate={vi.fn<(path: string) => void>()} routeTitles={{}} />);

    const pinnedTab = screen.getByRole('tab', { name: /Analysis/ });
    expect(within(pinnedTab).queryByTitle('Close Tab')).toBeNull();
  });

  it('offers a close-others control only once there are more than two tabs', () => {
    syncProTab('/a', 'A');
    render(<ProTabs currentPath='/a' onNavigate={vi.fn<(path: string) => void>()} routeTitles={{}} />);
    expect(screen.queryByText(/close others/i)).toBeNull();
  });

  it('reloads the page from the refresh control', async () => {
    const reload = vi.fn<() => void>();
    const original = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...original, reload, pathname: '/a' },
    });
    try {
      syncProTab('/a', 'A');
      render(<ProTabs currentPath='/a' onNavigate={vi.fn<(path: string) => void>()} routeTitles={{}} />);

      await userEvent.click(screen.getByTitle('Refresh View'));

      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: original });
    }
  });
});
