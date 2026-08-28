import { useEffect, useState } from 'react';
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';

import { Button } from '@package/ui/src/components/ui/button';

export type ThemePreference = 'system' | 'light' | 'dark';

const storageKey = 'theme';

const cycle: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const labels: Record<ThemePreference, string> = {
  system: 'Theme: system (switch to light)',
  light: 'Theme: light (switch to dark)',
  dark: 'Theme: dark (switch to system)',
};

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function readThemePreference(): ThemePreference {
  const stored = localStorage.getItem(storageKey);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

/** Mirrors the inline script in index.html; keep both in sync. */
export function applyTheme(preference: ThemePreference): void {
  const dark = preference === 'dark' || (preference === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

/** Three-state theme control cycling system → light → dark; defaults to following the OS. */
export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(readThemePreference);

  useEffect(() => {
    applyTheme(preference);
    localStorage.setItem(storageKey, preference);
  }, [preference]);

  useEffect(() => {
    if (preference !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference]);

  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label={labels[preference]}
      title={labels[preference]}
      onClick={() => setPreference(cycle[preference])}
    >
      {preference === 'system' ? <MonitorIcon /> : preference === 'light' ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
