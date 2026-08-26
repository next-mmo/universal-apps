/**
 * Rewrites template-authoring import aliases (e.g. `@/lib/utils`) to the
 * workspace conventions declared in the target's `importRewrites` map.
 * Longer keys win so `@/components/ui/` matches before `@/lib/`.
 */
export function transformImports(source: string, rewrites: Record<string, string>): string {
  let out = source;
  const keys = Object.keys(rewrites).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    out = out.split(key).join(rewrites[key]);
  }
  return out;
}

/** External package names imported by a source file (excludes relative paths, aliases, node:). */
export function externalDependencies(source: string): string[] {
  const deps = new Set<string>();
  const importPattern = /(?:from\s+|require\(|import\s+)['"]([^'"]+)['"]/g;
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    if (specifier.startsWith('.') || specifier.startsWith('@/') || specifier.startsWith('node:')) {
      continue;
    }
    // scoped packages: take both segments; plain packages: first segment
    const name = specifier.startsWith('@')
      ? specifier.split('/').slice(0, 2).join('/')
      : specifier.split('/')[0];
    if (name === 'react' || name === 'react-dom' || name === 'lucide-react') {
      continue;
    }
    deps.add(name);
  }
  return [...deps].sort();
}
