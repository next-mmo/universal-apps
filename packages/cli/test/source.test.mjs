import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildRegistry, moduleReferences, runtimePackages } from '../source/graph.mjs';
import { buildDistribution } from '../../../scripts/build-source-registry.mjs';
import { initialize, safePath, validateRegistry, planInstall, applyPlan, diffItems, doctor, selectItems } from '../source/install.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const scratch = path.resolve(here, '../../../.source-test-tmp');
fs.mkdirSync(scratch, { recursive: true });
function fixture(t) {
  const root = fs.mkdtempSync(path.join(scratch, 'fixture-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const put = (file, content) => { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), typeof content === 'string' ? content : JSON.stringify(content)); };
  put('package.json', { name: 'fixture', version: '0.1.0' });
  put('LICENSE', 'Fixture license\n');
  put('packages/core/package.json', { name: '@package/core', exports: { './value': './src/value.ts' } });
  put('packages/core/src/value.ts', 'export const value: number = 42;\n');
  put('packages/ui/package.json', { name: '@package/ui', exports: { './button': './src/components/ui/button.tsx', './cn': './src/lib/cn.ts' }, dependencies: { '@package/core': 'workspace:*', clsx: '^2.1.1', 'tw-animate-css': '^1.4.0' } });
  put('packages/ui/src/components/ui/button.tsx', 'import { value } from "@package/core/value";\nimport { cn } from "../../lib/cn";\nexport const button = () => cn(String(value));\n');
  put('packages/ui/src/lib/cn.ts', 'import { clsx } from "clsx";\nexport const cn = clsx;\n');
  put('packages/ui/src/styles/tokens.css', '@import "tw-animate-css";\n:root { --primary: blue; }\n');
  put('consumer/package.json', { name: 'company-app', private: true, type: 'module', dependencies: { clsx: '2.1.0' } });
  put('consumer/src/index.css', '@import "tailwindcss";\n');
  const cwd = path.join(root, 'consumer');
  const build = () => buildRegistry(root, { packages: ['core', 'ui'] });
  return { root, put, cwd, build };
}

test('AST rewriting ignores comments and strings but detects imports, exports and dynamic imports', () => {
  const refs = moduleReferences('// import x from "fake"\nconst s = "@package/nope";\nimport { x } from "one"; export * from "two"; const f = () => import("three"); type T = import("four").T;', 'x.ts');
  assert.deepEqual(refs.map((r) => r.value), ['one', 'two', 'three', 'four']);
});
test('Vue and Svelte script offsets and CSS imports are parsed', () => {
  const source = '<template>import fake from "no"</template><script lang="ts">import x from "yes";</script><style>@import "./a.css";</style>';
  for (const ext of ['vue', 'svelte']) {
    const refs = moduleReferences(source, `file.${ext}`);
    assert.deepEqual(refs.map((r) => source.slice(r.start, r.end)), ['yes', './a.css']);
  }
});
test('nonliteral module imports fail closed', () => assert.throws(() => moduleReferences('import(something)', 'x.ts'), /Non-literal/));
test('all public exports have registry items with transitive local code and styles', (t) => {
  const f = fixture(t), registry = f.build();
  assert.equal(registry.publicEntryCount, 3);
  assert.deepEqual(registry.items.map((i) => i.name), ['core', 'core-value', 'ui', 'ui-button', 'ui-cn']);
  const button = registry.items.find((i) => i.name === 'ui-button');
  assert.equal(button.files.length, 5);
  assert.deepEqual(button.dependencies, ['clsx@^2.1.1', 'tw-animate-css@^1.4.0']);
  assert.match(button.files.find((f) => f.path.endsWith('button.tsx')).content, /\.\.\/\.\.\/\.\.\/core\/value/);
  assert.ok(button.files.every((f) => !/from ["']@package\//.test(f.content)));
  validateRegistry(registry);
});
test('registry builds are deterministic', (t) => { const f = fixture(t); assert.deepEqual(f.build(), f.build()); });
test('missing exports fail the build', (t) => { const f = fixture(t); fs.unlinkSync(path.join(f.root, 'packages/core/src/value.ts')); assert.throws(f.build, /Missing public export/); });
test('unresolved imports fail before distribution', (t) => { const f = fixture(t); f.put('packages/core/src/value.ts', 'export * from "./missing";'); assert.throws(f.build, /Unresolved module/); });
test('cycles are handled without recursion failure', (t) => { const f = fixture(t); f.put('packages/core/src/value.ts', 'export * from "./cycle";'); f.put('packages/core/src/cycle.ts', 'export * from "./value";'); assert.ok(f.build()); });
test('undeclared external dependencies fail before distribution', (t) => { const f = fixture(t); f.put('packages/core/src/value.ts', 'export * from "unknown-package";'); assert.throws(f.build, /Missing portable dependency/); });
test('unselected workspace packages fail closed', (t) => { const f = fixture(t); f.put('packages/core/src/value.ts', 'export * from "@package/unknown/value";'); assert.throws(f.build, /Unresolved local import/); });
test('source dependencies may not escape source roots', (t) => { const f = fixture(t); f.put('packages/core/src/value.ts', 'export * from "../../../secret";'); f.put('secret.ts', 'export const secret = 1'); assert.throws(f.build, /escapes runtime/); });
test('init is non-destructive and preserves components.json', (t) => {
  const f = fixture(t); f.put('consumer/components.json', { style: 'new-york' });
  const config = initialize(f.cwd);
  assert.equal(config.sourceDir, 'src/lib/universal');
  assert.equal(config.css, 'src/index.css');
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.cwd, 'components.json'))).style, 'new-york');
  assert.throws(() => initialize(f.cwd), /already exists/);
});
test('init dry run writes nothing', (t) => { const f = fixture(t); initialize(f.cwd, { dryRun: true }); assert.equal(fs.existsSync(path.join(f.cwd, 'universal.json')), false); });
test('unsafe output paths and CSS collisions are rejected', (t) => {
  const f = fixture(t);
  for (const value of ['../outside', '/absolute', 'C:/Windows', 'src/../../bad', 'node_modules/bad', 'src\\bad', '.git/config']) assert.throws(() => safePath(f.cwd, value), /Unsafe|escapes/);
  assert.throws(() => initialize(f.cwd, { css: 'package.json' }), /stylesheet/);
  assert.throws(() => initialize(f.cwd, { css: 'src/lib/universal/ui/styles/tokens.css' }), /stylesheet/);
});
test('symlink output escapes are rejected', (t) => {
  const f = fixture(t); fs.symlinkSync(f.root, path.join(f.cwd, 'escape'), 'dir');
  assert.throws(() => safePath(f.cwd, 'escape/owned.ts'), /symlink/);
});
test('generation installs complete source but no library or CLI dependency', (t) => {
  const f = fixture(t); initialize(f.cwd); const registry = f.build();
  const plan = planInstall(f.cwd, registry, ['button']); applyPlan(plan, { noInstall: true });
  const manifest = JSON.parse(fs.readFileSync(path.join(f.cwd, 'package.json')));
  assert.equal(manifest.dependencies.clsx, '2.1.0');
  assert.equal(manifest.dependencies['tw-animate-css'], '^1.4.0');
  assert.ok(!Object.keys(manifest.dependencies).some((name) => name.startsWith('@package/') || name.includes('universal-cli')));
  assert.equal(doctor(f.cwd, registry).ok, true);
  assert.match(fs.readFileSync(path.join(f.cwd, 'src/index.css'), 'utf8'), /@import "\.\/lib\/universal\/ui\/styles\/tokens.css"/);
  assert.ok(fs.existsSync(path.join(f.cwd, 'src/lib/universal/core/value.ts')));
});
test('repeated add preserves CSS and source without duplicates', (t) => {
  const f = fixture(t); initialize(f.cwd); const r = f.build();
  applyPlan(planInstall(f.cwd, r, ['button']), { noInstall: true });
  const again = planInstall(f.cwd, r, ['button']);
  assert.equal(again.writes.size, 0);
});
test('modified files cause an atomic refusal; overwrite must be explicit', (t) => {
  const f = fixture(t); initialize(f.cwd); const r = f.build();
  applyPlan(planInstall(f.cwd, r, ['button']), { noInstall: true });
  f.put('consumer/src/lib/universal/ui/components/ui/button.tsx', 'company edit');
  assert.throws(() => planInstall(f.cwd, r, ['button']), /no changes were made/);
  assert.equal(fs.readFileSync(path.join(f.cwd, 'src/lib/universal/ui/components/ui/button.tsx'), 'utf8'), 'company edit');
  assert.equal(diffItems(f.cwd, r, ['button']).find((i) => i.file.endsWith('button.tsx')).status, 'modified');
  applyPlan(planInstall(f.cwd, r, ['button'], { overwrite: true }), { noInstall: true });
  assert.notEqual(fs.readFileSync(path.join(f.cwd, 'src/lib/universal/ui/components/ui/button.tsx'), 'utf8'), 'company edit');
});
test('add dry run does not alter files or invoke install', (t) => {
  const f = fixture(t); initialize(f.cwd); const plan = planInstall(f.cwd, f.build(), ['button']);
  let called = false; applyPlan(plan, { dryRun: true, spawn: () => { called = true; } });
  assert.equal(called, false); assert.equal(fs.existsSync(path.join(f.cwd, 'src/lib/universal')), false);
});
test('package manager detection supports each lockfile', (t) => {
  for (const [file, manager] of [['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['bun.lock', 'bun'], ['package-lock.json', 'npm']]) {
    const f = fixture(t); initialize(f.cwd); f.put('consumer/' + file, '');
    assert.equal(planInstall(f.cwd, f.build(), ['button']).manager, manager);
  }
});
test('mixed lockfiles require explicit selection', (t) => { const f = fixture(t); initialize(f.cwd); f.put('consumer/yarn.lock', ''); f.put('consumer/pnpm-lock.yaml', ''); assert.throws(() => planInstall(f.cwd, f.build(), ['button']), /Multiple lockfiles/); });
test('install uses argument arrays, reports failure, and retains generated files for retry', (t) => {
  const f = fixture(t); initialize(f.cwd); const plan = planInstall(f.cwd, f.build(), ['button']);
  const expectedArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm install'] : ['install'];
  assert.throws(() => applyPlan(plan, { spawn: (cmd, args, options) => { assert.equal(options.shell, false); assert.deepEqual(args, expectedArgs); return { status: 1 }; } }), /Source files were generated/);
  assert.ok(fs.existsSync(path.join(f.cwd, 'src/lib/universal/core/value.ts')));
});
test('registry traversal and hidden library dependencies are rejected', (t) => {
  const f = fixture(t), r = f.build();
  r.items[0].files[0].target = '@lib/universal/../../outside'; assert.throws(() => validateRegistry(r), /Unsafe/);
  const second = f.build(); second.items[0].dependencies = ['@package/ui@1.0.0']; assert.throws(() => validateRegistry(second), /Non-portable/);
});
test('all requires an explicit framework and excludes foreign frameworks', (t) => {
  const f = fixture(t), r = f.build(); assert.throws(() => selectItems(r, [], { all: true }), /requires/);
  assert.deepEqual(selectItems(r, [], { all: true, framework: 'react' }).map((i) => i.name), ['core', 'ui']);
});
test('doctor detects deleted source and reintroduced workspace imports', (t) => {
  const f = fixture(t); initialize(f.cwd); const r = f.build(); applyPlan(planInstall(f.cwd, r, ['button']), { noInstall: true });
  fs.unlinkSync(path.join(f.cwd, 'src/lib/universal/core/value.ts'));
  f.put('consumer/src/lib/universal/ui/lib/cn.ts', 'export * from "@package/ui/cn"');
  const report = doctor(f.cwd, r); assert.equal(report.ok, false); assert.equal(report.problems.length, 2);
});
test('generated framework-neutral code compiles and runs without the CLI or workspace', (t) => {
  const f = fixture(t); initialize(f.cwd); applyPlan(planInstall(f.cwd, f.build(), ['core']), { noInstall: true });
  const source = path.join(f.cwd, 'src/lib/universal/core/value.ts');
  const compiler = fileURLToPath(import.meta.resolve('typescript/lib/tsc.js'));
  const result = spawnSync(process.execPath, [compiler, source, '--outDir', path.join(f.cwd, 'out'), '--module', 'ESNext', '--target', 'ES2022', '--skipLibCheck'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', 'import { value } from "./out/value.js"; if(value !== 42) process.exit(1)'], { cwd: f.cwd, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});
test('packed-style CLI runs from outside the workspace using only its embedded registry', (t) => {
  const f = fixture(t), r = f.build();
  const packed = path.join(f.root, 'packed'); fs.mkdirSync(packed);
  for (const name of ['cli.mjs', 'install.mjs', 'templates.mjs']) fs.copyFileSync(path.join(here, '../source', name), path.join(packed, name));
  f.put('packed/registry/index.json', r);
  const run = (...args) => spawnSync(process.execPath, [path.join(packed, 'cli.mjs'), ...args], { cwd: f.cwd, encoding: 'utf8' });
  assert.equal(run('init').status, 0);
  const add = run('add', 'core', '--no-install'); assert.equal(add.status, 0, add.stderr);
  assert.equal(run('doctor').status, 0);
  assert.equal(run('add', 'not-real', '--no-install').status, 1);
});

test('all nine catalogs build into an actual standalone npm tarball', (t) => {
  const f = fixture(t);
  for (const folder of runtimePackages.filter((name) => !['core', 'ui'].includes(name))) {
    f.put(`packages/${folder}/package.json`, { name: `@package/${folder}` });
    f.put(`packages/${folder}/src/value.ts`, 'export const ready = true;\n');
  }
  for (const name of ['cli.mjs', 'install.mjs', 'templates.mjs', 'README.md']) {
    f.put(`packages/cli/source/${name}`, fs.readFileSync(path.join(here, '../source', name), 'utf8'));
  }
  const output = buildDistribution(f.root);
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? (process.env.ComSpec || 'cmd.exe') : 'npm';
  const npmArgs = isWindows
    ? ['/d', '/s', '/c', 'npm', 'pack', output, '--ignore-scripts', '--json', '--pack-destination', f.root, '--cache', path.join(f.root, '.npm-cache')]
    : ['pack', output, '--ignore-scripts', '--json', '--pack-destination', f.root, '--cache', path.join(f.root, '.npm-cache')];
  const result = spawnSync(npmCmd, npmArgs, { cwd: f.root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const archive = JSON.parse(result.stdout)[0];
  assert.ok(archive.files.some((file) => file.path === 'registry/index.json'));
  assert.ok(!archive.files.some((file) => /node_modules|graph.mjs/.test(file.path)));
  const unpack = spawnSync('tar', ['-xzf', path.join(f.root, archive.filename), '-C', f.root], { encoding: 'utf8' });
  assert.equal(unpack.status, 0, unpack.stderr);
  const cli = path.join(f.root, 'package/cli.mjs');
  for (const framework of ['react', 'vue', 'svelte', 'native']) {
    const cwd = path.join(f.root, `company-${framework}`);
    f.put(`company-${framework}/package.json`, { name: `company-${framework}`, private: true, type: 'module' });
    f.put(`company-${framework}/src/index.css`, '@import "tailwindcss";\n');
    const run = (...args) => spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
    assert.equal(run('init', '--framework', framework).status, 0);
    const add = run('add', '--all', '--framework', framework, '--no-install');
    assert.equal(add.status, 0, add.stderr);
    assert.equal(run('doctor').status, 0);

    const createRes = run('create', `starter-${framework}`, '--framework', framework, '--no-install');
    assert.equal(createRes.status, 0, createRes.stderr);
    assert.ok(fs.existsSync(path.join(cwd, `starter-${framework}/universal.json`)));
    assert.ok(fs.existsSync(path.join(cwd, `starter-${framework}/package.json`)));
    assert.ok(fs.existsSync(path.join(cwd, `starter-${framework}/src/index.css`)));
  }
  const cwd = path.join(f.root, 'company-react');
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
  const tauriRes = run('create', 'starter-tauri', '--framework', 'react', '--tauri', '--no-install');
  assert.equal(tauriRes.status, 0, tauriRes.stderr);
  assert.ok(fs.existsSync(path.join(cwd, 'starter-tauri/src-tauri/tauri.conf.json')));
  assert.ok(fs.existsSync(path.join(cwd, 'starter-tauri/src-tauri/Cargo.toml')));
});
