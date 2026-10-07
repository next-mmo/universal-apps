// Extract apps/admin-dashboard into a standalone source project under dist/.
// Rebuilds the source registry first (a stale dist/universal-cli vendors
// pre-migration package source that fails typecheck against current pins),
// then reuses the packed source CLI (@next-mmo/universal-cli) to vendor the
// component sources, ports the app source with @package/* imports rewritten to
// the vendored layout, and verifies the result by running install + typecheck +
// build inside the extraction with --ignore-workspace so no monorepo
// resolution is used.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDistribution } from './build-source-registry.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'apps/admin-dashboard');
const OUT = path.join(ROOT, 'dist/admin-dashboard-standalone');
const CLI = path.join(ROOT, 'dist/universal-cli/cli.mjs');
const PKGS = ['ui', 'pro', 'pro-core'];

function run(cmd, args, opts = {}) {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  const result = execFileSync(cmd, args, { stdio: 'pipe', encoding: 'utf8', shell: process.platform === 'win32', ...opts });
  if (result.trim()) console.log(result.trim().split('\n').slice(-12).join('\n'));
  return result;
}

// --- 0. fresh registry so vendored source matches current package source -------
buildDistribution(ROOT);

// --- 1. fresh output directory -------------------------------------------------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const file of ['index.html', 'vite.config.ts']) fs.copyFileSync(path.join(APP, file), path.join(OUT, file));
fs.cpSync(path.join(APP, 'src'), path.join(OUT, 'src'), { recursive: true });

// --- 2. standalone tsconfig (base config inlined, no ../../extends) -------------
fs.writeFileSync(path.join(OUT, 'tsconfig.json'), JSON.stringify({
  compilerOptions: {
    target: 'ES2022', useDefineForClassFields: true, lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    module: 'ESNext', skipLibCheck: true, moduleResolution: 'bundler', allowImportingTsExtensions: true,
    resolveJsonModule: true, isolatedModules: true, noEmit: true, jsx: 'react-jsx', strict: true,
    noUnusedLocals: true, noUnusedParameters: true, noFallthroughCasesInSwitch: true,
    paths: { '@/*': ['./src/*'] },
  },
  include: ['src'],
}, null, 2) + '\n');

// --- 3. package.json without workspace packages (CLI merges vendored deps in) ---
const appPackage = JSON.parse(fs.readFileSync(path.join(APP, 'package.json'), 'utf8'));
const stripWorkspace = (deps = {}) => Object.fromEntries(Object.entries(deps).filter(([, v]) => !v.startsWith('workspace:')));
fs.writeFileSync(path.join(OUT, 'package.json'), JSON.stringify({
  name: 'admin-dashboard-standalone', private: true, version: '0.1.0', type: 'module',
  scripts: { dev: 'vite', build: 'tsc --noEmit && vite build', preview: 'vite preview' },
  dependencies: stripWorkspace(appPackage.dependencies),
  devDependencies: stripWorkspace(appPackage.devDependencies),
}, null, 2) + '\n');

// --- 4. resolve @package/* imports to registry items via package exports maps ---
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/universal-cli/registry/index.json'), 'utf8'));
const entryMap = new Map(); // "@package/ui/button" -> { pkg, item, importPath }
for (const pkg of PKGS) {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, `packages/${pkg}/package.json`), 'utf8'));
  const exportsMap = manifest.exports ?? {};
  for (const [entry, target] of Object.entries(exportsMap)) {
    if (entry === '.' || entry.includes('*')) continue;
    const source = typeof target === 'string' ? target : target.default;
    if (!/\.(ts|tsx)$/.test(source ?? '')) continue;
    const base = source.replace(/^\.\//, '').replace(/^src\//, '');
    const libTarget = `@lib/universal/${pkg}/${base}`;
    // Prefer the most specific item: helper files (ui/lib/*) ship inside larger
    // items' dependency graphs and are not standalone registry items.
    const candidates = registry.items.filter(i => i.files.some(f => f.target === libTarget));
    if (!candidates.length) continue; // internal helper without item coverage; only needed if imported
    const item = candidates.reduce((a, b) => (a.files.length <= b.files.length ? a : b));
    const relative = base.replace(/\.(ts|tsx)$/, '');
    entryMap.set(`@package/${pkg}/${entry.replace(/^\.\//, '')}`, { pkg, item: item.name, importPath: `@/lib/universal/${pkg}/${relative}` });
  }
}

const appFiles = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(name)) appFiles.push(full);
  }
})(path.join(OUT, 'src'));

const used = new Set();
const importPattern = /(['"])@package\/(ui|pro|pro-core)\/[a-z0-9-]+\1/g;
for (const file of appFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const matches = source.match(importPattern) ?? [];
  for (const match of matches) {
    const specifier = match.slice(1, -1);
    const resolved = entryMap.get(specifier);
    if (!resolved) throw new Error(`Unmapped import ${specifier} in ${path.relative(OUT, file)}`);
    used.add(resolved.item);
  }
}
if (!used.size) throw new Error('No @package/* imports found; nothing to vendor');
console.log(`\nResolved ${used.size} registry items:\n  ${[...used].sort().join('\n  ')}`);

// --- 5. init + add through the real CLI (closure, deps, css, lockfile) ----------
run('node', [CLI, 'init', '--framework', 'react', '--css', 'src/index.css', '-c', OUT]);
run('node', [CLI, 'add', ...[...used].sort(), '--no-install', '--yes', '-c', OUT]);

// --- 6. rewrite app imports to the vendored layout (app files only) -------------
for (const file of appFiles) {
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace(importPattern, match => {
    const resolved = entryMap.get(match.slice(1, -1));
    return `${match[0]}${resolved.importPath}${match[0]}`;
  });
  fs.writeFileSync(file, source);
}

// --- 7. fix index.css: tokens import + tailwind source scanning ------------------
const cssFile = path.join(OUT, 'src/index.css');
let css = fs.readFileSync(cssFile, 'utf8');
css = css.replace(/(['"])@package\/ui\/src\/styles\/tokens\.css\1/, "'./lib/universal/ui/styles/tokens.css'");
css = css.replace(/(['"])(\.\.\/)+packages\/(ui|pro|pro-core)\/src\1/g, (m, q, _up, pkg) => `${q}./lib/universal/${pkg}${q}`);
if (/['"]@package\//.test(css)) throw new Error('index.css still references @package/* after rewrite');
fs.writeFileSync(cssFile, css);

// --- 8. README -------------------------------------------------------------------
fs.writeFileSync(path.join(OUT, 'README.md'), `# Admin Dashboard (standalone)

Standalone source extraction of the Universal admin dashboard. All component
sources are vendored under \`src/lib/universal\` (recorded in \`universal.lock.json\`);
there is no dependency on the universal-apps monorepo or any \`@package/*\` runtime.

## Requirements

- Node.js >= 20.10
- pnpm (or npm/yarn/bun)

## Run

\`\`\`sh
pnpm install
pnpm dev      # http://localhost:5175
pnpm build    # typecheck + production bundle in dist/
\`\`\`

## Updating vendored components

Re-adding an identical file is a no-op; differing files stop the write plan
unless \`--overwrite\` is passed. Use \`npx @next-mmo/universal-cli diff <item>\`
to review local modifications before updating.
`);

// --- 9. prove it: isolated install + typecheck + build ---------------------------
run('pnpm', ['install', '--ignore-workspace'], { cwd: OUT });
run('pnpm', ['build'], { cwd: OUT });

const leftoverPattern = /(?:from\s+|import\s*\(\s*)['"]@package\//;
const leftovers = [];
(function scan(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { if (name !== 'node_modules' && name !== 'dist') scan(full); }
    else if (/\.(ts|tsx)$/.test(name) && leftoverPattern.test(fs.readFileSync(full, 'utf8'))) leftovers.push(path.relative(OUT, full));
  }
})(OUT);
if (leftovers.length) throw new Error(`@package/* imports remain: ${leftovers.join(', ')}`);

// --- 10. best-effort zip (tar exists on Windows 10+ and common CI images) --------
// Relative paths only: GNU tar reads a leading `C:` in -caf as a remote host.
const zipDir = path.dirname(OUT);
const zipName = 'admin-dashboard-standalone.zip';
const zipped = spawnSync('tar', ['-caf', zipName, '--exclude', '*/node_modules*', '--exclude', '*/dist', '--exclude', '*/dist/*', '-C', zipDir, path.basename(OUT)], { cwd: zipDir, stdio: 'pipe', encoding: 'utf8' });
const zip = path.join(zipDir, zipName);
console.log(zipped.status === 0 ? `\nzip: ${zip} (${Math.round(fs.statSync(zip).size / 1024)} KiB)` : `\nzip skipped: ${String(zipped.error ?? zipped.stderr).slice(0, 200)}`);

console.log(`\nOK standalone extraction verified at ${OUT}`);
