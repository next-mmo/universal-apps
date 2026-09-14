import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Runs against the checkout, not copied or mocked implementations.
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const { sourceContract, validateCatalog, capabilityCard, findCapabilities } = await import('../src/catalog.ts');
const { runCommand, workspacePlan } = await import('../src/checks.ts');
const { createAsyncTask } = await import('../../core/src/async-task.ts');
const ts = createRequire(path.join(repo, 'package.json'))('typescript');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fixture(run) {
  const root = await mkdtemp(path.join(tmpdir(), 'tauri-pretest-'));
  const put = async (name, text) => {
    const full = path.join(root, name);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, text);
    return full;
  };
  try { await run(root, put); }
  finally { await rm(root, { recursive: true, force: true }); }
}
function snapshot(implementations) {
  return { revision: 'fixture', catalog: {
    version: 1, name: 'fixture', summary: '', recipes: [],
    entries: [{ id: 'ui.control', kind: 'component', summary: 'control', docs: 'docs/control.md', implementations }],
  } };
}
async function validationFixture(put) {
  await put('docs/control.md', '# Control');
  await put('packages/ui/src/components/ui/.keep', '');
  await put('packages/ui-native/src/components/ui/.keep', '');
  for (const section of ['blocks', 'components']) {
    await put(`apps/tauri-app/content/docs/${section}/meta.json`, '{"pages":[]}');
  }
}

test('CONTROL: successful command preserves exit status and stdout', async () => {
  const result = await runCommand(process.execPath, ['-e', 'console.log("ok")'], here, 2000);
  assert.equal(result.code, 0);
  assert.equal(result.stdout.trim(), 'ok');
  assert.equal(result.timedOut, false);
});

test('CONTROL: direct exports distinguish runtime values and types', () => fixture(async (root, put) => {
  await put('packages/test/control.ts', 'export interface Options { text: string }\nexport function run() {}');
  const value = await sourceContract(root, { source: 'packages/test/control.ts', import: '@test/control', exports: ['Options', 'run'] });
  assert.match(value.imports, /import type \{ Options \}/);
  assert.match(value.imports, /import \{ run \}/);
}));

test('CONTROL: keyword search excludes symbols from the wrong implementation', () => {
  const value = snapshot({
    react: { import: '@test/react', source: 'react.ts', exports: ['ReactOnly'] },
    native: { import: '@test/native', source: 'native.ts', exports: ['NativeOnly'] },
  });
  assert.equal(findCapabilities(value.catalog, 'ReactOnly', { framework: 'native' }).length, 0);
});

test('CONTROL: ordinary overlapping tasks preserve latest-result semantics', async () => {
  const resolve = new Map();
  const task = createAsyncTask(input => new Promise(done => resolve.set(input, done)));
  const first = task.run('first');
  const firstRejected = assert.rejects(first, { name: 'AbortError' });
  await delay(0);
  const second = task.run('second');
  await delay(0);
  resolve.get('second')('new');
  await second;
  resolve.get('first')('old');
  await firstRejected;
  assert.deepEqual(task.getSnapshot(), { status: 'success', value: 'new' });
});

test('R1: all-workspace verification must handle the real metadata-only utils placeholder explicitly', () => fixture(async (root, put) => {
  // Same manifest-only shape as packages/utils at the reviewed SHA. Inventory transport is stubbed;
  // the real discoverWorkspaces/workspacePlan implementation reads the on-disk manifests.
  await put('package.json', '{"name":"fixture"}');
  await put('apps/demo/package.json', '{"name":"@app/demo","scripts":{"build":"vite build"}}');
  await put('apps/demo/src/app.ts', 'export const app = 1;');
  await put('packages/utils/package.json', '{"name":"@package/utils","private":true,"version":"0.1.0","type":"module"}');
  const entrypoint = await put('pnpm.cjs', `console.log(JSON.stringify(${JSON.stringify([
    { path: root }, { path: path.join(root, 'apps/demo') }, { path: path.join(root, 'packages/utils') },
  ])}));`);
  const old = process.env.npm_execpath;
  process.env.npm_execpath = entrypoint;
  try {
    const plan = await workspacePlan(root, { all: true });
    assert.deepEqual(plan.unresolved, [], 'manifest-only placeholder currently blocks the advertised all-workspace command');
  } finally {
    if (old === undefined) delete process.env.npm_execpath;
    else process.env.npm_execpath = old;
  }
}));

test('R2: a timed-out check must not leave a SIGTERM-resistant descendant running', { skip: process.platform === 'win32' }, () => fixture(async (root, put) => {
  let pid;
  const heartbeat = path.join(root, 'heartbeat.json');
  const worker = await put('worker.cjs', `const fs=require('node:fs');process.on('SIGTERM',()=>{});const beat=()=>fs.writeFileSync(${JSON.stringify(heartbeat)},JSON.stringify({pid:process.pid,time:Date.now()}));beat();setInterval(beat,25);`);
  try {
    const parent = `require('node:child_process').spawn(process.execPath,[${JSON.stringify(worker)}],{stdio:'ignore'});setInterval(()=>{},1000);`;
    const result = await runCommand(process.execPath, ['-e', parent], root, 2000);
    const first = JSON.parse(await readFile(heartbeat, 'utf8')); pid = first.pid;
    assert.equal(result.code, 124);
    assert.equal(result.timedOut, true);
    await delay(850); // Longer than the implementation's SIGKILL grace period.
    const second = JSON.parse(await readFile(heartbeat, 'utf8'));
    assert.equal(second.time, first.time, 'worker heartbeat advances after check runner already returned timeout');
  } finally {
    if (pid) { try { process.kill(pid, 'SIGKILL'); } catch {} }
    await delay(50);
  }
}));

test('R3: catalog validation must reject a missing transitive re-export', () => fixture(async (root, put) => {
  await validationFixture(put);
  await put('packages/test/package.json', '{"name":"@test/lib","exports":{"./control":"./control.ts"}}');
  const source = await put('packages/test/control.ts', "export { missing } from './dependency.ts';");
  await put('packages/test/dependency.ts', 'export const available = 1;');
  const impl = { import: '@test/lib/control', source: 'packages/test/control.ts', exports: ['missing'] };
  const program = ts.createProgram([source], {
    noEmit: true, types: [], allowImportingTsExtensions: true, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, target: ts.ScriptTarget.ES2022,
  });
  assert.ok(ts.getPreEmitDiagnostics(program).some(item => item.code === 2305), 'compiler confirms invalid export');
  const errors = await validateCatalog(root, snapshot({ react: impl }));
  assert.ok(errors.length > 0, 'catalog incorrectly returns no errors for the broken re-export');
}));

test('R4: valid generic TypeScript must not be parsed as JSX', () => fixture(async (root, put) => {
  const source = await put('packages/test/control.ts', 'export const identity = <T>(value: T) => value;\nexport const after = 42;');
  const program = ts.createProgram([source], { noEmit: true, types: [], target: ts.ScriptTarget.ES2022 });
  assert.equal(ts.getPreEmitDiagnostics(program).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
  const value = await sourceContract(root, { import: '@test/lib/control', source: 'packages/test/control.ts', exports: ['after'] });
  assert.match(value.imports, /after/);
}));

test('R5: direct symbol lookup must reject a symbol absent from the selected framework', () => fixture(async (root, put) => {
  await put('packages/test/react.ts', 'export function DialogClose() {}');
  await put('packages/test/native.ts', 'export function Dialog() {}');
  const value = snapshot({
    react: { import: '@test/react', source: 'packages/test/react.ts', exports: ['DialogClose'] },
    native: { import: '@test/native', source: 'packages/test/native.ts', exports: ['Dialog'] },
  });
  await assert.rejects(capabilityCard(root, value, 'DialogClose', { framework: 'native' }));
}));

test('R6: cancelling an old task must not overwrite a replacement started synchronously by its abort callback', async () => {
  let second;
  let finish;
  let startedSecond = false;
  const task = createAsyncTask((input, { signal }) => {
    if (input === 'first') signal.addEventListener('abort', () => {
      second = task.run('second'); second.catch(() => {});
    });
    return new Promise(resolve => {
      if (input === 'second') { startedSecond = true; finish = resolve; }
    });
  });
  const first = task.run('first'); const rejected = assert.rejects(first, { name: 'AbortError' });
  await delay(0);
  task.cancel();
  await delay(0);
  try {
    assert.equal(startedSecond, true);
    assert.equal(task.getSnapshot().status, 'pending', 'replacement is running but snapshot falsely reports cancelled');
  } finally {
    finish?.('done'); await second; await rejected;
  }
});

test('metadata-only classification is revoked as soon as source or scripts appear', () => fixture(async (root, put) => {
  await put('package.json', '{"name":"fixture"}');
  const manifest = { name: '@lib/placeholder', private: true, version: '0.1.0', type: 'module' };
  await put('packages/placeholder/package.json', JSON.stringify(manifest));
  const entrypoint = await put('pnpm.cjs', `console.log(JSON.stringify([{path:${JSON.stringify(path.join(root, 'packages/placeholder'))}}]));`);
  const old = process.env.npm_execpath;
  process.env.npm_execpath = entrypoint;
  try {
    const empty = await workspacePlan(root, { all: true });
    assert.deepEqual(empty.metadataOnly, ['@lib/placeholder']);
    assert.deepEqual(empty.unresolved, []);
    await put('packages/placeholder/src/tool.ts', 'export const tool = 1;');
    assert.deepEqual((await workspacePlan(root, { all: true })).unresolved, ['@lib/placeholder']);
    await rm(path.join(root, 'packages/placeholder/src'), { recursive: true });
    await put('packages/placeholder/package.json', JSON.stringify({ ...manifest, scripts: { dev: 'custom-tool' } }));
    assert.deepEqual((await workspacePlan(root, { all: true })).unresolved, ['@lib/placeholder']);
  } finally {
    if (old === undefined) delete process.env.npm_execpath;
    else process.env.npm_execpath = old;
  }
}));

test('transitive re-exports and imported aliases preserve value/type distinction', () => fixture(async (_root, put) => {
  const root = _root;
  await put('packages/test/types.ts', 'export interface Options { text: string }\nexport class Engine {}\nexport const value = 1;');
  await put('packages/test/middle.ts', "export type { Engine as OnlyType } from './types';\nexport { Options, value } from './types';");
  await put('packages/test/control.ts', "import { Options as LocalOptions } from './middle';\nexport { LocalOptions as Config };\nexport { OnlyType, value as run } from './middle';");
  const impl = { source: 'packages/test/control.ts', import: '@test/lib/control', exports: ['Config', 'OnlyType', 'run'] };
  const before = await sourceContract(root, impl);
  assert.match(before.imports, /import type \{ Config, OnlyType \}/);
  assert.match(before.imports, /import \{ run \}/);
  await put('packages/test/types.ts', 'export interface Options { text: number }\nexport class Engine {}\nexport const value = 2;');
  assert.notEqual((await sourceContract(root, impl)).revision, before.revision);
}));

test('star-export cycles terminate, while conflicting star exports fail', () => fixture(async (root, put) => {
  await put('packages/test/a.ts', "export * from './b';\nexport const value = 1;");
  await put('packages/test/b.ts', "export * from './a';");
  const impl = { source: 'packages/test/b.ts', import: '@test/b', exports: ['value'] };
  assert.match((await sourceContract(root, impl)).imports, /value/);
  await assert.rejects(sourceContract(root, { ...impl, exports: ['absent'] }), /absent/);
  await put('packages/test/c.ts', 'export const value = 2;');
  await put('packages/test/b.ts', "export * from './a';\nexport * from './c';");
  await assert.rejects(sourceContract(root, impl), /Ambiguous/);
}));

test('parser accepts JSX only in JSX files and reports malformed source', () => fixture(async (root, put) => {
  const impl = { source: 'packages/test/control.tsx', import: '@test/control', exports: ['View'] };
  await put(impl.source, 'export const View = () => <div>ok</div>;');
  assert.match((await sourceContract(root, impl)).imports, /View/);
  await put(impl.source, 'export const View = ;');
  await assert.rejects(sourceContract(root, impl), /Invalid source/);
}));

test('default export aliases are discoverable only for supported runtime/framework', () => fixture(async (root, put) => {
  await put('packages/test/Panel.vue', '<template><div>Panel</div></template>');
  const value = snapshot({
    vue: { source: 'packages/test/Panel.vue', import: '@test/Panel.vue', exports: ['default'], defaultExport: 'Panel', runtimes: ['browser'] },
  });
  assert.match(await capabilityCard(root, value, 'Panel', { framework: 'vue', runtime: 'browser' }), /import Panel from/);
  await assert.rejects(capabilityCard(root, value, 'Panel', { framework: 'react' }));
  await assert.rejects(capabilityCard(root, value, 'Panel', { framework: 'vue', runtime: 'server' }));
  assert.match(await capabilityCard(root, value, 'ui.control', { framework: 'vue' }), /Panel/);
}));

test('reset cannot erase a replacement started by an abort callback', async () => {
  let replacement;
  let finish;
  const task = createAsyncTask((input, { signal }) => {
    if (input === 'old') signal.addEventListener('abort', () => {
      replacement = task.run('replacement'); replacement.catch(() => {});
    });
    return new Promise(resolve => { if (input === 'replacement') finish = resolve; });
  });
  const old = task.run('old'); const rejected = assert.rejects(old, { name: 'AbortError' });
  await delay(0);
  task.reset();
  await delay(0);
  assert.equal(task.getSnapshot().status, 'pending');
  finish('new'); await replacement; await rejected;
  assert.deepEqual(task.getSnapshot(), { status: 'success', value: 'new' });
});

test('a run invoked from an abort callback supersedes the outer replacing run', async () => {
  let nested;
  const executed = [];
  const task = createAsyncTask((input, { signal }) => {
    executed.push(input);
    if (input === 'first') {
      signal.addEventListener('abort', () => { nested = task.run('third'); nested.catch(() => {}); });
      return new Promise(() => {});
    }
    return input;
  });
  const first = task.run('first'); const rejected = assert.rejects(first, { name: 'AbortError' });
  await delay(0);
  await assert.rejects(task.run('second'), { name: 'AbortError' });
  assert.equal(await nested, 'third'); await rejected;
  assert.deepEqual(executed, ['first', 'third']);
  assert.deepEqual(task.getSnapshot(), { status: 'success', value: 'third' });
});

test('pending subscriber can replace a run before its side effects start', async () => {
  let nested;
  let replaced = false;
  const executed = [];
  const task = createAsyncTask(input => { executed.push(input); return input; });
  task.subscribe(() => {
    if (!replaced && task.getSnapshot().status === 'pending') {
      replaced = true;
      nested = task.run('new'); nested.catch(() => {});
    }
  });
  await assert.rejects(task.run('old'), { name: 'AbortError' });
  assert.equal(await nested, 'new');
  assert.deepEqual(executed, ['new']);
  assert.deepEqual(task.getSnapshot(), { status: 'success', value: 'new' });
});
