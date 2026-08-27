import { createContext, useContext, useMemo, useState } from 'react';
import { createElement } from 'react';

import { createTheme } from '@package/ui/src/tokens';

import type { ReactNode } from 'react';

export type { ThemeMode, Palette } from '@package/ui/src/tokens';

export interface NativeTheme {
  mode: 'light' | 'dark';
  palette: ReturnType<typeof createTheme>['palette'];
  fontFamily: string;
  setMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<NativeTheme | null>(null);

export interface ThemeRootProps {
  /** Initial mode; defaults to light. Toggle at runtime via `useTheme().setMode`. */
  defaultMode?: 'light' | 'dark';
  children: ReactNode;
}

/** Stateful theme root providing the token palette to ui-native components. */
export function ThemeRoot({ defaultMode = 'light', children }: ThemeRootProps): ReactNode {
  const [mode, setMode] = useState<'light' | 'dark'>(defaultMode);
  const theme = useMemo<NativeTheme>(
    () => ({ mode, palette: createTheme(mode).palette, fontFamily: createTheme(mode).fontFamily, setMode }),
    [mode],
  );
  return createElement(ThemeContext.Provider, { value: theme }, children);
}

export function useTheme(): NativeTheme {
  const theme = useContext(ThemeContext);
  if (theme === null) {
    throw new Error('useTheme must be used inside <ThemeRoot> from @package/ui-native');
  }
  return theme;
}
