import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';

export interface SettingsState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  notificationsOpen: boolean;
  commandPaletteOpen: boolean;
}

export const settingsStore = new Store<SettingsState>({
  sidebarCollapsed: false,
  theme: 'light',
  notificationsOpen: false,
  commandPaletteOpen: false,
});

export function toggleSidebar() {
  settingsStore.setState((s) => ({ ...s, sidebarCollapsed: !s.sidebarCollapsed }));
}

export function toggleTheme() {
  settingsStore.setState((s) => {
    const next = s.theme === 'light' ? 'dark' : 'light';
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { ...s, theme: next };
  });
}

export function setCommandPaletteOpen(open: boolean) {
  settingsStore.setState((s) => ({ ...s, commandPaletteOpen: open }));
}

export function setNotificationsOpen(open: boolean) {
  settingsStore.setState((s) => ({ ...s, notificationsOpen: open }));
}

export function useSettings() {
  return useStore(settingsStore);
}
