import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { get as httpGet } from 'node:http';
import { openStore } from '../src/store.js';
import { createApp } from '../src/app.js';

async function fixture(t, options) {
  const base = resolve('.test-data'); await mkdir(base, { recursive: true });
  const dir = await mkdtemp(join(base, 'api-')); const file = join(dir, 'todos.json');
  const store = await openStore(file, options);
  const server = createApp({ store }).listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await store.drain(); });
  const url = `http://127.0.0.1:${server.address().port}`;
  const request = (path, method = 'GET', body, headers = {}) => fetch(`${url}${path}`, { method, headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { store, file, url, request };
}

test('CRUD contract, timestamps, trim, and restart persistence', async t => {
  const { request, file } = await fixture(t);
  assert.deepEqual(await (await request('/api/todos')).json(), { todos: [] });
  const created = await request('/api/todos', 'POST', { title: '  First win  ' }); assert.equal(created.status, 201);
  const { todo } = await created.json(); assert.equal(todo.title, 'First win'); assert.equal(todo.completed, false); assert.ok(Date.parse(todo.createdAt));
  const updated = await request(`/api/todos/${todo.id}`, 'PATCH', { title: 'Edited', completed: true }); assert.equal(updated.status, 200);
  const reloaded = await openStore(file); assert.equal((await reloaded.list())[0].title, 'Edited'); assert.equal((await reloaded.list())[0].completed, true);
  assert.equal((await request(`/api/todos/${todo.id}`, 'DELETE')).status, 204);
  assert.deepEqual(await (await request('/api/todos')).json(), { todos: [] });
  assert.deepEqual(await (await openStore(file)).list(), []);
});

test('strict create validation rejects bad types and unknown fields', async t => {
  const { request } = await fixture(t);
  for (const body of [{}, { title: '' }, { title: '  ' }, { title: 1 }, { title: null }, { title: 'x'.repeat(201) }, { title: 'x', completed: true }, [], null]) {
    assert.equal((await request('/api/todos', 'POST', body)).status, 400, JSON.stringify(body));
  }
  assert.equal((await request('/api/todos', 'POST', { title: 'x'.repeat(200) })).status, 201);
});

test('patch rejects empty unknown and non-boolean fields; missing IDs have explicit status', async t => {
  const { request } = await fixture(t);
  const { todo } = await (await request('/api/todos', 'POST', { title: 'Keep' })).json();
  for (const body of [{}, { completed: 'true' }, { completed: 1 }, { title: '' }, { id: randomUUID() }, { title: 'x', extra: 1 }]) {
    assert.equal((await request(`/api/todos/${todo.id}`, 'PATCH', body)).status, 400);
  }
  assert.equal((await request(`/api/todos/${randomUUID()}`, 'PATCH', { completed: true })).status, 404);
  assert.equal((await request('/api/todos/nope', 'DELETE')).status, 400);
  assert.equal((await request(`/api/todos/${randomUUID()}`, 'DELETE')).status, 404);
});

test('JSON parser, body limit, content type, and unknown endpoints', async t => {
  const { url, request } = await fixture(t);
  assert.equal((await fetch(`${url}/api/todos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' })).status, 400);
  assert.equal((await request('/api/todos', 'POST', { title: 'x'.repeat(20000) })).status, 413);
  assert.equal((await fetch(`${url}/api/todos`, { method: 'POST', body: 'title=test' })).status, 415);
  assert.equal((await request('/api/nope')).status, 404);
  assert.equal((await request('/api/todos', 'PUT', {})).status, 404);
});

test('local origin/host guards, CSP, no data exposure', async t => {
  const { request, url } = await fixture(t);
  assert.equal((await request('/api/todos', 'POST', { title: 'bad' }, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await request('/api/todos', 'POST', { title: 'bad' }, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal((await request('/api/todos', 'POST', { title: 'ok' }, { Origin: url })).status, 201);
  const hostStatus = await new Promise((done, reject) => {
    httpGet(`${url}/api/health`, { headers: { Host: 'evil.example' } }, response => { response.resume(); response.on('end', () => done(response.statusCode)); }).on('error', reject);
  });
  assert.equal(hostStatus, 403);
  const home = await request('/'); assert.equal(home.status, 200); assert.ok(home.headers.get('content-security-policy').includes("script-src 'self'"));
  assert.equal(home.headers.get('x-powered-by'), null); assert.equal(home.headers.get('x-content-type-options'), 'nosniff');
  assert.equal((await request('/data/todos.json')).status, 404); assert.equal((await request('/src/store.js')).status, 404);
  assert.deepEqual(await (await request('/api/health')).json(), { status: 'ok' });
});

test('30 simultaneous writes remain unique and survive reload', async t => {
  const { request, file } = await fixture(t);
  const responses = await Promise.all(Array.from({ length: 30 }, (_, i) => request('/api/todos', 'POST', { title: `Task ${i}` })));
  assert.ok(responses.every(response => response.status === 201));
  const saved = await (await openStore(file)).list(); assert.equal(saved.length, 30); assert.equal(new Set(saved.map(todo => todo.id)).size, 30);
});

test('failed persistence does not publish memory changes or lose deletion; queue recovers', async t => {
  let fail = false;
  const { store, file, request } = await fixture(t, { beforePersist: async () => { if (fail) throw new Error('private/path EACCES'); } });
  const item = await store.add('Saved'); const original = await readFile(file, 'utf8'); fail = true;
  assert.equal((await request('/api/todos', 'POST', { title: 'Never saved' })).status, 500);
  const response = await request(`/api/todos/${item.id}`, 'DELETE'); assert.equal(response.status, 500); assert.ok(!(await response.text()).includes('private/path'));
  assert.equal((await store.list()).length, 1); assert.equal(await readFile(file, 'utf8'), original);
  fail = false; await store.add('Recovered'); assert.equal((await (await openStore(file)).list()).length, 2);
});

test('corrupt JSON and invalid stored schema fail closed without replacing bytes', async t => {
  const { file } = await fixture(t);
  for (const content of ['{broken', JSON.stringify({ version: 7, todos: [] }), JSON.stringify({ version: 1, todos: [{ id: 'bad' }] })]) {
    await writeFile(file, content); await assert.rejects(openStore(file)); assert.equal(await readFile(file, 'utf8'), content);
  }
});

test('failure after temp fsync preserves previous bytes and removes owned temp file', async t => {
  let fail = false;
  const { store, file } = await fixture(t, { beforeRename: async () => { if (fail) throw new Error('rename simulation'); } });
  await store.add('Original'); const before = await readFile(file, 'utf8'); fail = true;
  await assert.rejects(store.add('Failed'), /rename simulation/);
  assert.equal(await readFile(file, 'utf8'), before); assert.equal((await store.list()).length, 1);
  assert.deepEqual(await readdir(dirname(file)), ['todos.json']);
  fail = false; await store.add('Recovery'); assert.equal((await (await openStore(file)).list()).length, 2);
});

test('list returns defensive copies', async t => {
  const { store } = await fixture(t); await store.add('Immutable');
  const list = await store.list(); list[0].title = 'Changed'; list.push({});
  assert.equal((await store.list())[0].title, 'Immutable'); assert.equal((await store.list()).length, 1);
});

test('real server process restart preserves created todo', async t => {
  const { file } = await fixture(t);
  const children = [];
  t.after(() => children.forEach(child => { if (child.exitCode === null) child.kill(); }));
  const start = () => new Promise((resolveStart, reject) => {
    const child = spawn(process.execPath, ['src/server.js'], { cwd: resolve('.'), env: { ...process.env, PORT: '0', TODO_DATA_FILE: file }, stdio: ['ignore', 'pipe', 'pipe'] });
    children.push(child); let output = '';
    const timeout = setTimeout(() => { child.kill(); reject(new Error('Startup timed out')); }, 10000);
    child.once('error', error => { clearTimeout(timeout); reject(error); });
    child.stdout.on('data', chunk => { output += chunk; const match = output.match(/http:\/\/127\.0\.0\.1:\d+/); if (match) { clearTimeout(timeout); resolveStart({ child, url: match[0] }); } });
    child.once('exit', code => { clearTimeout(timeout); if (!output.includes('Todo listening')) reject(new Error(`Server exited ${code}`)); });
  });
  const first = await start();
  const created = await fetch(`${first.url}/api/todos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Survives process' }) }); assert.equal(created.status, 201);
  const stopped = once(first.child, 'exit'); first.child.kill(); await stopped;
  const second = await start();
  assert.equal((await (await fetch(`${second.url}/api/todos`)).json()).todos[0].title, 'Survives process');
  const ended = once(second.child, 'exit'); second.child.kill(); await ended;
});
