import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { bounded, capabilityCard, compatible, findCapabilities, loadCatalog, readOwned, resolveRecipes, sourceContract, validateCatalog } from '../src/catalog.ts';
import type { AgentCatalog, Implementation } from '../src/catalog.ts';
import { planChecks, runCommand, discoverWorkspaces } from '../src/checks.ts';
import type { Workspace } from '../src/checks.ts';
import { createAsyncTask, TaskCancelledError } from '../../core/src/async-task.ts';
import { createMemoryDataProvider, createLocalStorageDataProvider, createSqliteDataProvider, createSupabaseDataProvider } from '../../pro-core/src/resource/data-provider.ts';

async function fixture(run: (root: string, put: (name: string, value: string) => Promise<void>) => Promise<void>) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'universal-foundation-'));
  const put = async (name: string, value: string) => {
    const file = path.join(root, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, value);
  };
  try { await run(root, put); }
  finally { await rm(root, { recursive: true, force: true }); }
}
const impl: Implementation = {
  import: '@example/tool', exports: ['run', 'Options'], source: 'packages/example/tool.ts',
  consumers: ['react', 'vue'], runtimes: ['browser', 'tauri'],
};
const catalog: AgentCatalog = {
  version: 1, name: 'fixture', summary: '',
  entries: [{ id: 'core.tool', kind: 'contract', summary: 'storage tools', docs: 'docs/tool.md', implementations: { core: impl } }],
  recipes: [],
};

test('source-derived imports distinguish values and types without executing source', () => fixture(async (root, put) => {
  await put(impl.source, 'throw new Error("must not execute");\nexport interface Options { value: string }\nexport function run() {}');
  const contract = await sourceContract(root, impl);
  assert.match(contract.imports, /import \{ run \}/);
  assert.match(contract.imports, /import type \{ Options \}/);
  assert.match(contract.declarations, /interface Options/);
  assert.doesNotMatch(contract.declarations, /must not execute/);
}));

test('default imports for both SFC frameworks use valid local names', () => fixture(async (root, put) => {
  for (const extension of ['vue', 'svelte']) {
    const source = `packages/example/app-shell.${extension}`;
    await put(source, '<div>Shell</div>');
    const contract = await sourceContract(root, { import: `@example/${extension}`, source, exports: ['default'], defaultExport: 'AppShell' });
    assert.equal(contract.imports, `import AppShell from "@example/${extension}";`);
  }
}));

test('stale exports are rejected rather than advertised', () => fixture(async (root, put) => {
  await put(impl.source, 'export function getTodoStore() {}');
  await assert.rejects(sourceContract(root, { ...impl, exports: ['todoStorage'] }), /absent/);
}));

test('compatible core capabilities remain visible in React searches', () => {
  assert.equal(findCapabilities(catalog, 'storage', { framework: 'react' }).length, 1);
  assert.equal(findCapabilities(catalog, 'storage', { framework: 'native' }).length, 0);
  assert.equal(findCapabilities(catalog, 'storage', { framework: 'react', runtime: 'server' }).length, 0);
  assert.equal(compatible(impl, 'core', 'vue', 'browser'), true);
});

test('catalog and source revisions refresh without restarting the process', () => fixture(async (root, put) => {
  await put('agent/catalog.json', JSON.stringify(catalog));
  const before = await loadCatalog(root);
  await put('agent/catalog.json', JSON.stringify({ ...catalog, name: 'changed' }));
  assert.notEqual((await loadCatalog(root)).revision, before.revision);
  await put(impl.source, 'export interface Options {}\nexport function run() {}');
  const first = await sourceContract(root, impl);
  await put(impl.source, 'export interface Options { next: number }\nexport function run() {}');
  assert.notEqual((await sourceContract(root, impl)).revision, first.revision);
}));

test('native docs cannot fall back to React usage', () => fixture(async (root, put) => {
  await put(impl.source, 'export interface Options {}\nexport function run() {}');
  await put('docs/tool.md', '## Usage\n<ReactOnly asChild />');
  const snapshot = { catalog: { ...catalog, entries: [{ ...catalog.entries[0], implementations: { native: impl } }] }, revision: 'test' };
  await assert.rejects(capabilityCard(root, snapshot, 'core.tool', { framework: 'native', detail: 'usage' }), /USAGE_UNAVAILABLE/);
}));

test('missing docs return an actionable error', () => fixture(async (root, put) => {
  await put(impl.source, 'export interface Options {}\nexport function run() {}');
  const snapshot = { catalog: { ...catalog, entries: [{ ...catalog.entries[0], implementations: { react: impl } }] }, revision: 'test' };
  await assert.rejects(capabilityCard(root, snapshot, 'core.tool', { framework: 'react', detail: 'usage' }), /DOCS_MISSING/);
}));

test('usage extraction returns only the selected section', () => fixture(async (root, put) => {
  await put(impl.source, 'export interface Options {}\nexport function run() {}');
  await put('docs/tool.md', '# Title\n## Usage\nClient mode\n```ts\nrun();\n```\n## Other\nNOT_THIS');
  const snapshot = { catalog: { ...catalog, entries: [{ ...catalog.entries[0], implementations: { react: impl } }] }, revision: 'test' };
  const card = await capabilityCard(root, snapshot, 'core.tool', { framework: 'react', detail: 'usage' });
  assert.match(card, /Client mode/);
  assert.doesNotMatch(card, /NOT_THIS/);
}));

test('response budgets account for the complete truncation suffix', () => {
  for (const text of ['x'.repeat(5000), 'line\n'.repeat(1000), '\u1780'.repeat(2000)]) assert.ok(bounded(text).length <= 1200);
  assert.equal(bounded('small'), 'small');
  assert.throws(() => bounded('x', 1), /budget/);
});

test('catalog file reads reject traversal and symlink escape', () => fixture(async (root, put) => {
  await put('safe.txt', 'safe');
  await assert.rejects(readOwned(root, '../secret.txt'), /workspace/);
  if (process.platform !== 'win32') {
    await fixture(async (outside, write) => {
      await write('secret.txt', 'not readable');
      await symlink(outside, path.join(root, 'escape'));
      await assert.rejects(readOwned(root, 'escape/secret.txt'), /escapes/);
    });
  }
}));

const workspaces: Workspace[] = [
  { name: '@lib/core', directory: 'packages/core', scripts: {}, dependencies: [] },
  { name: '@lib/ui', directory: 'packages/ui', scripts: {}, dependencies: ['@lib/core'] },
  { name: '@app/new', directory: 'apps/new-app', scripts: { build: 'vite build', test: 'test' }, dependencies: ['@lib/ui'] },
  { name: '@app/nested', directory: 'apps/benchmark/new-fixture', scripts: { build: 'vite build' }, dependencies: [] },
];

test('new and nested apps receive their own checks', () => {
  const result = planChecks(workspaces, ['apps/benchmark/new-fixture/src/app.tsx']);
  assert.deepEqual(result.affected, ['@app/nested']);
  assert.deepEqual(result.commands.map((command) => command.args), [['--dir', 'apps/benchmark/new-fixture', 'run', 'build']]);
});

test('dependency changes select transitive consumers, including leaf app tests', () => {
  const result = planChecks(workspaces, ['packages/core/src/value.ts']);
  assert.deepEqual(result.affected, ['@app/new', '@lib/core', '@lib/ui']);
  assert.equal(result.unresolved.length, 0);
  assert.equal(result.commands.length, 2);
});

test('all scope includes newly discovered workspaces', () => {
  assert.ok(planChecks(workspaces, [], true).commands.some((command) => command.label === '@app/nested:build'));
});

test('unowned or unverified product paths do not silently pass', () => {
  assert.ok(planChecks(workspaces, ['apps/missing/src/app.tsx']).unresolved.length > 0);
  assert.ok(planChecks([{ name: '@lib/alone', directory: 'packages/alone', scripts: {}, dependencies: [] }], ['packages/alone/src/index.ts']).unresolved.length > 0);
});

test('Tauri changes require explicit desktop validation', () => {
  assert.ok(planChecks(workspaces, ['apps/new-app/src-tauri/src/lib.rs']).unresolved.some((message) => message.includes('Rust/Tauri')));
});

test('workspace discovery uses the package manager inventory', () => fixture(async (root, put) => {
  await put('apps/new/package.json', JSON.stringify({ name: '@app/new', scripts: { test: 'run' } }));
  const entry = path.join(root, 'pnpm.cjs');
  await put('pnpm.cjs', `console.log(JSON.stringify([{path:${JSON.stringify(path.join(root, 'apps/new'))}}]));`);
  const old = process.env.npm_execpath;
  process.env.npm_execpath = entry;
  try { assert.equal((await discoverWorkspaces(root))[0].name, '@app/new'); }
  finally { if (old === undefined) delete process.env.npm_execpath; else process.env.npm_execpath = old; }
}));

test('hung commands get an explicit timeout and are terminated', async () => {
  const result = await runCommand(process.execPath, ['-e', 'process.on("SIGTERM",()=>{});setInterval(()=>{},1000)'], process.cwd(), 100);
  assert.equal(result.code, 124);
  assert.equal(result.timedOut, true);
});

test('spawn errors fail closed', async () => {
  const result = await runCommand('a-nonexistent-command-for-test', [], process.cwd(), 500);
  assert.notEqual(result.code, 0);
  assert.ok(result.error);
});

test('async task handles synchronous throws and rejected promises', async () => {
  for (const execute of [() => { throw new Error('sync'); }, () => Promise.reject(new Error('async'))]) {
    const task = createAsyncTask(execute);
    await assert.rejects(task.run(undefined));
    assert.equal(task.getSnapshot().status, 'error');
  }
});

test('async task publishes success and subscriptions can unsubscribe', async () => {
  const task = createAsyncTask((input: number) => input * 2);
  let notifications = 0;
  const off = task.subscribe(() => { notifications++; });
  assert.equal(await task.run(2), 4);
  assert.deepEqual(task.getSnapshot(), { status: 'success', value: 4 });
  assert.equal(notifications, 2);
  off(); task.reset(); assert.equal(notifications, 2);
});

test('cancellation rejects promptly even when the adapter ignores abort', async () => {
  const task = createAsyncTask(() => new Promise<string>(() => {}));
  const running = task.run(undefined);
  const rejected = assert.rejects(running, TaskCancelledError);
  task.cancel(); await rejected;
  assert.equal(task.getSnapshot().status, 'cancelled');
});

test('a superseded result cannot overwrite a newer task', async () => {
  const resolvers = new Map<string, (value: string) => void>();
  const task = createAsyncTask((input: string) => new Promise<string>((resolve) => resolvers.set(input, resolve)));
  const first = task.run('old');
  const firstRejected = assert.rejects(first, TaskCancelledError);
  await Promise.resolve();
  const next = task.run('new'); await Promise.resolve();
  await firstRejected;
  resolvers.get('new')!('fresh'); await next;
  resolvers.get('old')!('stale'); await Promise.resolve();
  assert.deepEqual(task.getSnapshot(), { status: 'success', value: 'fresh' });
});

test('reset remains idle after an aborted operation settles', async () => {
  const task = createAsyncTask(() => new Promise<void>(() => {}));
  const running = task.run(undefined);
  const rejected = assert.rejects(running, TaskCancelledError);
  task.reset(); await rejected;
  assert.equal(task.getSnapshot().status, 'idle');
});

test('framework searches do not match exports from another implementation', () => {
  const value: AgentCatalog = { ...catalog, entries: [{ ...catalog.entries[0], implementations: {
    react: { ...impl, exports: ['ReactOnly'], consumers: [] },
    native: { ...impl, exports: ['NativeOnly'], consumers: [] },
  } }] };
  assert.equal(findCapabilities(value, 'ReactOnly', { framework: 'native' }).length, 0);
  assert.equal(findCapabilities(value, 'NativeOnly', { framework: 'native' }).length, 1);
});

test('stderr warnings cannot corrupt a successful JSON inventory', async () => {
  const result = await runCommand(process.execPath, ['-e', 'console.error("warning");console.log(JSON.stringify([1,2]))'], process.cwd(), 1000);
  assert.deepEqual(JSON.parse(result.stdout), [1, 2]);
  assert.match(result.output, /warning/);
});

test('legacy extensionless imports validate without weakening explicit exports maps', () => fixture(async (root, put) => {
  await put('packages/example/package.json', JSON.stringify({ name: '@example/ui' }));
  await put('packages/example/button.tsx', 'export function Button() {}');
  await put('docs/button.md', '# Button');
  await put('packages/ui/src/components/ui/.keep', '');
  await put('packages/ui-native/src/components/ui/.keep', '');
  for (const name of ['components', 'blocks']) await put(`apps/tauri-app/content/docs/${name}/meta.json`, '{"pages":[]}');
  const entry = { id: 'ui.button', kind: 'component', summary: '', docs: 'docs/button.md', implementations: { native: { import: '@example/ui/button', exports: ['Button'], source: 'packages/example/button.tsx' } } };
  const snapshot = { catalog: { ...catalog, entries: [entry] }, revision: 'test' };
  assert.deepEqual(await validateCatalog(root, snapshot), []);
  await put('packages/example/package.json', JSON.stringify({ name: '@example/ui', exports: { './other': './button.tsx' } }));
  assert.match((await validateCatalog(root, snapshot)).join('\n'), /does not export/);
}));

test('universal DataProvider handles CRUD, sort, filter, and pagination', async () => {
  const provider = createMemoryDataProvider({
    users: [
      { id: '1', name: 'Alice', role: 'admin' },
      { id: '2', name: 'Bob', role: 'member' },
      { id: '3', name: 'Charlie', role: 'member' },
    ],
  });

  // Filter & sort
  const list = await provider.getList('users', {
    filters: { role: 'member' },
    sort: { field: 'name', order: 'desc' },
    pagination: { page: 1, pageSize: 1 },
  });
  assert.equal(list.total, 2);
  assert.equal(list.data.length, 1);
  assert.equal((list.data[0] as any).name, 'Charlie');

  // Create
  const created = await provider.create('users', { name: 'Dave', role: 'guest' });
  assert.equal((created as any).name, 'Dave');
  assert.ok((created as any).id);

  // Update
  const updated = await provider.update('users', (created as any).id, { role: 'member' });
  assert.equal((updated as any).role, 'member');

  // Delete
  const deleted = await provider.delete('users', (created as any).id);
  assert.equal(deleted.id, (created as any).id);

  // LocalStorage provider
  const mockStore = new Map<string, string>();
  const storageProvider = createLocalStorageDataProvider({
    prefix: 'test_',
    storage: {
      getItem: (k) => mockStore.get(k) ?? null,
      setItem: (k, v) => mockStore.set(k, v),
    },
  });
  const item = await storageProvider.create('todos', { title: 'Test Todo' });
  assert.ok(mockStore.has('test_todos'));
  const fetched = await storageProvider.getOne('todos', (item as any).id);
  assert.equal((fetched as any).title, 'Test Todo');
});

test('Sqlite and Supabase DataProviders map CRUD operations accurately', async () => {
  const tables = new Map<string, Array<Record<string, unknown>>>();
  tables.set('products', [
    { id: 'p1', name: 'Widget A', price: 10 },
    { id: 'p2', name: 'Widget B', price: 20 },
  ]);

  const sqlite = createSqliteDataProvider({
    executor: {
      async select<T>(sql: string, params: unknown[] = []): Promise<T[]> {
        if (sql.includes('COUNT(*)')) {
          return [{ count: 2 }] as T[];
        }
        if (sql.includes('WHERE "id" = ?')) {
          const id = params[0];
          return tables.get('products')!.filter((r) => r.id === id) as T[];
        }
        return tables.get('products')! as T[];
      },
      async execute(sql: string, params: unknown[] = []) {
        if (sql.includes('INSERT INTO')) {
          const row = { id: params[0] as string, name: params[1] as string, price: params[2] as number };
          tables.get('products')!.push(row);
          return { rowsAffected: 1, lastInsertId: row.id };
        }
        if (sql.includes('DELETE FROM')) {
          const id = params[0];
          tables.set('products', tables.get('products')!.filter((r) => r.id !== id));
          return { rowsAffected: 1 };
        }
        return { rowsAffected: 1 };
      },
    },
  });

  const products = await sqlite.getList('products', { pagination: { page: 1, pageSize: 10 } });
  assert.equal(products.total, 2);
  assert.equal(products.data.length, 2);

  const one = await sqlite.getOne('products', 'p1');
  assert.equal((one as any).name, 'Widget A');

  // Supabase mock test
  const mockFetch: typeof fetch = async (input, init) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    if (url.includes('/rest/v1/items') && method === 'GET') {
      return new Response(JSON.stringify([{ id: 'item-1', title: 'Task 1' }]), {
        headers: { 'content-range': '0-0/1' },
      });
    }
    if (url.includes('/rest/v1/items') && method === 'POST') {
      const body = JSON.parse(String(init?.body));
      return new Response(JSON.stringify([{ id: 'item-2', ...body }]), { status: 201 });
    }
    return new Response(JSON.stringify({ ok: true }));
  };

  const supabase = createSupabaseDataProvider({
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: 'anon-key',
    fetch: mockFetch,
  });

  const list = await supabase.getList('items');
  assert.equal(list.total, 1);
  assert.equal(list.data.length, 1);
  assert.equal((list.data[0] as any).title, 'Task 1');

  const created = await supabase.create('items', { title: 'Task 2' });
  assert.equal((created as any).title, 'Task 2');
});

test('resolveRecipes matches exact id, stripped prefix, and capability uses', () => {
  const fixtureCatalog: AgentCatalog = {
    version: 1,
    name: 'test',
    summary: '',
    entries: [],
    recipes: [
      {
        id: 'crud-page',
        summary: 'CRUD page recipe',
        frameworks: ['react'],
        uses: ['block.crud-page', 'bridge.todo-storage'],
        examples: { react: 'apps/tauri-app/src/pages/todos-page.tsx' },
        verify: 'pnpm check',
      },
      {
        id: 'schema-form',
        summary: 'Form recipe',
        frameworks: ['react', 'vue'],
        uses: ['block.form'],
        examples: { react: 'form.tsx' },
        verify: 'pnpm check',
      },
    ],
  };

  // Exact match
  assert.equal(resolveRecipes(fixtureCatalog, 'crud-page').length, 1);
  assert.equal(resolveRecipes(fixtureCatalog, 'crud-page')[0].id, 'crud-page');

  // Prefix stripped (block.crud-page -> crud-page)
  assert.equal(resolveRecipes(fixtureCatalog, 'block.crud-page').length, 1);
  assert.equal(resolveRecipes(fixtureCatalog, 'block.crud-page')[0].id, 'crud-page');

  // Capability uses match (bridge.todo-storage is in uses)
  assert.equal(resolveRecipes(fixtureCatalog, 'bridge.todo-storage').length, 1);
  assert.equal(resolveRecipes(fixtureCatalog, 'bridge.todo-storage')[0].id, 'crud-page');

  // Framework filter
  assert.equal(resolveRecipes(fixtureCatalog, 'crud-page', 'vue').length, 0);
  assert.equal(resolveRecipes(fixtureCatalog, 'schema-form', 'vue').length, 1);
});


