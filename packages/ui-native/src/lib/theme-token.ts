import { useCSSVariable } from 'uniwind';

/**
 * Safely resolves a CSS variable or theme token color for native inputs.
 * If Uniwind runtime is mounted, resolves dynamic CSS variables.
 * Otherwise (or in Nativewind/standard RN environments), falls back to the provided fallback color.
 */
export function useThemeColor(variableName: string, fallbackColor: string = '#8e8e93'): string {
  try {
    const resolved: unknown = useCSSVariable(variableName as any);
    if (typeof resolved === 'string' && resolved.trim().length > 0) {
      return resolved;
    }
  } catch {
    // Graceful fallback when Uniwind context is not active
  }
  return fallbackColor;
}
