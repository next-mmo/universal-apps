import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../source/graph.mjs';

function fixture(t) {
  const parent = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.source-test-tmp');
  fs.mkdirSync(parent, { recursive: true });
  const root = fs.mkdtempSync(path.join(parent, 'edges-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const put = (file, value) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, typeof value === 'string' ? value : JSON.stringify(value));
  };
  put('package.json', { name: 'registry-edge-fixture' });
  put('LICENSE', 'Fixture license\n');
  put('packages/core/package.json', { name: '@package/core', exports: { './value': './src/value.ts' } });
  put('packages/core/src/value.ts', 'export const value = 42;\n');
  put('packages/utils/package.json', { name: '@package/utils', private: true });
  return { root, put, build: () => buildRegistry(root, { packages: ['core', 'utils'] }) };
}

test('manifest-only reserved packages are inventoried without fabricated source items', (t) => {
  const f = fixture(t), registry = f.build();
  assert.deepEqual(registry.emptyPackages, ['@package/utils']);
  assert.deepEqual(registry.packages, ['@package/core', '@package/utils']);
  assert.deepEqual(registry.items.map((item) => item.name), ['core', 'core-value']);
});

test('adding source to a previously empty package automatically exposes it', (t) => {
  const f = fixture(t);
  f.put('packages/utils/src/format.ts', 'export const format = String;\n');
  const registry = f.build();
  assert.deepEqual(registry.emptyPackages, []);
  assert.ok(registry.items.some((item) => item.name === 'utils-format'));
});

test('missing declared source roots still fail instead of looking empty', (t) => {
  const f = fixture(t);
  f.put('packages/utils/package.json', { name: '@package/utils', exports: './src/index.ts' });
  assert.throws(f.build, /Missing source directory/);
});

test('imports from reserved packages without implementations still fail', (t) => {
  const f = fixture(t);
  f.put('packages/core/src/value.ts', 'export * from "@package/utils";\n');
  assert.throws(f.build, /Unresolved module/);
});

test('conditional exports can use default without an import condition', (t) => {
  const f = fixture(t);
  f.put('packages/core/package.json', { name: '@package/core', exports: { './value': { default: './src/value.ts' } } });
  assert.ok(f.build().items.some((item) => item.name === 'core-value'));
});

test('root string exports expose the declared entry, not every private helper', (t) => {
  const f = fixture(t);
  f.put('packages/core/package.json', { name: '@package/core', exports: './src/value.ts' });
  f.put('packages/core/src/private.ts', 'export const internal = true;\n');
  const registry = f.build();
  assert.deepEqual(registry.items.map((item) => item.name), ['core', 'core-index']);
  assert.ok(registry.items.every((item) => !item.files.some((file) => file.path.endsWith('private.ts'))));
});

test('npm exec invokes the packed bin and actually generates source through its symlink', { skip: process.platform === 'win32' }, (t) => {
  const f = fixture(t);
  const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../source');
  for (const file of ['cli.mjs', 'install.mjs', 'templates.mjs']) f.put(`packed/${file}`, fs.readFileSync(path.join(source, file), 'utf8'));
  fs.chmodSync(path.join(f.root, 'packed/cli.mjs'), 0o755);
  f.put('packed/package.json', { name: 'universal-bin-regression', version: '1.0.0', type: 'module', bin: { universal: './cli.mjs' }, files: ['cli.mjs', 'install.mjs', 'templates.mjs', 'registry'] });
  f.put('packed/registry/index.json', f.build());
  f.put('consumer/package.json', { name: 'isolated-company-app', private: true, type: 'module' });
  f.put('consumer/src/index.css', '@import "tailwindcss";\n');
  const cwd = path.join(f.root, 'consumer');
  const cache = path.join(f.root, '.npm-cache');
  const npm = (...args) => spawnSync('npm', args, { cwd, encoding: 'utf8', shell: false, timeout: 20000 });
  const packed = npm('pack', path.join(f.root, 'packed'), '--ignore-scripts', '--json', '--pack-destination', f.root, '--cache', cache);
  assert.equal(packed.status, 0, packed.stdout + packed.stderr);
  const archive = path.join(f.root, JSON.parse(packed.stdout)[0].filename);
  const run = (...args) => npm('exec', '--offline', '--yes', '--cache', cache, '--package', archive, '--', 'universal', ...args);
  const init = run('init');
  assert.equal(init.status, 0, init.stderr);
  assert.match(init.stdout, /sourceDir/);
  assert.ok(fs.existsSync(path.join(cwd, 'universal.json')), 'A zero exit code without generated configuration is not success');
  const add = run('add', 'core-value', '--no-install');
  assert.equal(add.status, 0, add.stderr);
  assert.match(add.stdout, /core-value/);
  assert.ok(fs.existsSync(path.join(cwd, 'src/lib/universal/core/value.ts')));
  const check = run('doctor');
  assert.equal(check.status, 0, check.stderr);
  assert.equal(JSON.parse(check.stdout).ok, true);
  const invalid = run('not-a-command');
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Unknown command/);
  const manifest = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
  assert.deepEqual(manifest, { name: 'isolated-company-app', private: true, type: 'module' });
});
