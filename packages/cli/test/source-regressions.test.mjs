import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
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
