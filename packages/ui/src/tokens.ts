/**
 * JavaScript mirror of `packages/ui/src/styles/tokens.css`.
 *
 * React Native cannot read CSS custom properties, so the design tokens live
 * here as plain data consumed by `@package/ui-native`. Keep the two files in
 * sync — values, names, and order intentionally mirror the CSS source.
 *
 * Shadows are provided in two shapes: `boxShadow` strings for React Native
 * Web's css layer, and native `shadow*` fields for iOS/Android via Metro
 * (RN cannot render the 0.5px hairline outline from the CSS strings natively).
 */

export interface Palette {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  green: string;
  orange: string;
  red: string;
  fill: string;
  sidebar: string;
  /** CSS multi-layer box-shadow (usable on RNW; not renderable natively). */
  boxShadowCard: string;
  boxShadowOverlay: string;
  /** Native iOS/Android shadow decomposition of `boxShadowCard`. */
  shadowCard: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowRadius: number;
    shadowOpacity: number;
  };
  /** Native iOS/Android shadow decomposition of `boxShadowOverlay`. */
  shadowOverlay: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowRadius: number;
    shadowOpacity: number;
  };
}

export type ThemeMode = 'light' | 'dark';

const light: Palette = {
  background: '#f5f5f7',
  foreground: '#1d1d1f',
  card: '#ffffff',
  cardForeground: '#1d1d1f',
  popover: '#ffffff',
  popoverForeground: '#1d1d1f',
  primary: '#007aff',
  primaryForeground: '#ffffff',
  secondary: '#e9e9eb',
  secondaryForeground: '#1d1d1f',
  muted: '#f2f2f7',
  mutedForeground: '#6e6e73',
  accent: 'rgba(120, 120, 128, 0.12)',
  accentForeground: '#1d1d1f',
  destructive: '#ff3b30',
  destructiveForeground: '#ffffff',
  border: 'rgba(60, 60, 67, 0.16)',
  input: 'rgba(60, 60, 67, 0.12)',
  ring: 'rgba(0, 122, 255, 0.35)',
  green: '#34c759',
  orange: '#ff9500',
  red: '#ff3b30',
  fill: 'rgba(120, 120, 128, 0.14)',
  sidebar: 'rgba(246, 246, 248, 0.82)',
  boxShadowCard:
    '0 0 0 0.5px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.05)',
  boxShadowOverlay:
    '0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 12px 40px rgba(0, 0, 0, 0.18)',
  shadowCard: {
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 1,
  },
  shadowOverlay: {
    shadowColor: 'rgba(0, 0, 0, 0.18)',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 40,
    shadowOpacity: 1,
  },
};

const dark: Palette = {
  background: '#0a0a0c',
  foreground: '#f5f5f7',
  card: '#1c1c1e',
  cardForeground: '#f5f5f7',
  popover: '#232326',
  popoverForeground: '#f5f5f7',
  primary: '#0a84ff',
  primaryForeground: '#ffffff',
  secondary: '#2c2c2e',
  secondaryForeground: '#f5f5f7',
  muted: '#1c1c1e',
  mutedForeground: '#98989d',
  accent: 'rgba(120, 120, 128, 0.24)',
  accentForeground: '#f5f5f7',
  destructive: '#ff453a',
  destructiveForeground: '#ffffff',
  border: 'rgba(255, 255, 255, 0.12)',
  input: 'rgba(255, 255, 255, 0.14)',
  ring: 'rgba(10, 132, 255, 0.4)',
  green: '#30d158',
  orange: '#ff9f0a',
  red: '#ff453a',
  fill: 'rgba(120, 120, 128, 0.28)',
  sidebar: 'rgba(22, 22, 24, 0.78)',
  boxShadowCard:
    '0 0 0 0.5px rgba(255, 255, 255, 0.06), 0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.45)',
  boxShadowOverlay:
    '0 0 0 0.5px rgba(255, 255, 255, 0.08), 0 12px 40px rgba(0, 0, 0, 0.6)',
  shadowCard: {
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 1,
  },
  shadowOverlay: {
    shadowColor: 'rgba(0, 0, 0, 0.6)',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 40,
    shadowOpacity: 1,
  },
};

export const palettes: Record<ThemeMode, Palette> = { light, dark };

/** `--radius: 0.875rem` and the derived sm/md/lg/xl scale from tokens.css. */
export const radius = {
  base: 14,
  sm: 14 - 6,
  md: 14 - 4,
  lg: 14 - 2,
  xl: 14,
} as const;

/** `--font-sans` stack; RNW resolves it per-platform like the browser does. */
export const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif";

export function createTheme(mode: ThemeMode): { palette: Palette; radius: typeof radius; fontFamily: string } {
  return { palette: palettes[mode], radius, fontFamily };
}
