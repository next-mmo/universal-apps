import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { openStore } from '../src/store.js';
import { createApp } from '../src/app.js';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';

let baseUrl, server, dataDir;

async function setup() {
  dataDir = mkdtempSync(join(tmpdir(), 'cms-test-'));
  const store = await openStore(dataDir);
  const app = createApp({ store });
  server = createServer(app);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  return store;
}

async function teardown(store) {
  try {
    await store.drain();
  } finally {
    await new Promise(r => { server.close(r); server.closeAllConnections(); });
    try { rmSync(dataDir, { recursive: true }); } catch {}
  }
}

async function login() {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password' }),
  });
  const cookie = res.headers.get('set-cookie') ?? '';
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

function auth(token) {
  return { 'Content-Type': 'application/json', 'X-Session-Token': token };
}

describe('Auth and security', () => {
  let store, token;
  before(async () => { store = await setup(); });
  after(async () => { await teardown(store); });

  it('rejects login with wrong password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrong' }),
    });
    assert.equal(res.status, 401);
  });

  it('logs in with correct credentials', async () => {
    token = await login();
    assert.ok(token);
  });

  it('returns user info with valid session', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, { headers: auth(token) });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.username, 'admin');
    assert.equal(data.role, 'admin');
  });

  it('rejects admin endpoints without auth', async () => {
    const res = await fetch(`${baseUrl}/api/admin/projects`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test' }),
    });
    assert.equal(res.status, 401);
  });

  it('sets security headers', async () => {
    const res = await fetch(`${baseUrl}/api/projects`);
    assert.ok(res.headers.get('content-security-policy'));
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  });

  it('cookie logout revokes replay of the same session', async () => {
    const cookieToken = await login();
    const headers = { Cookie: `session=${cookieToken}` };
    assert.equal((await fetch(`${baseUrl}/api/auth/me`, { headers })).status, 200);
    assert.equal((await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST', headers })).status, 200);
    assert.equal((await fetch(`${baseUrl}/api/auth/me`, { headers })).status, 401);
  });

  it('logs out and invalidates session', async () => {
    await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST', headers: auth(token) });
    const res = await fetch(`${baseUrl}/api/auth/me`, { headers: auth(token) });
    assert.equal(res.status, 401);
  });
});

describe('Projects CRUD', () => {
  let store, token;
  before(async () => { store = await setup(); token = await login(); });
  after(async () => { await teardown(store); });

  it('creates a project', async () => {
    const res = await fetch(`${baseUrl}/api/admin/projects`, {
      method: 'POST', headers: auth(token),
      body: JSON.stringify({ title: 'My App', description: 'A cool app', tags: ['node', 'express'] }),
    });
    assert.equal(res.status, 201);
    const p = await res.json();
    assert.equal(p.title, 'My App');
    assert.deepEqual(p.tags, ['node', 'express']);
    assert.ok(p.id);
  });

  it('lists projects publicly', async () => {
    const res = await fetch(`${baseUrl}/api/projects`);
    assert.equal(res.status, 200);
    const projects = await res.json();
    assert.ok(projects.length >= 1);
  });

  it('updates a project', async () => {
    const list = await (await fetch(`${baseUrl}/api/projects`)).json();
    const id = list[0].id;
    const res = await fetch(`${baseUrl}/api/admin/projects/${id}`, {
      method: 'PATCH', headers: auth(token),
      body: JSON.stringify({ title: 'Updated App' }),
    });
    assert.equal(res.status, 200);
    const p = await res.json();
    assert.equal(p.title, 'Updated App');
  });

  it('deletes a project', async () => {
    const list = await (await fetch(`${baseUrl}/api/projects`)).json();
    const id = list[0].id;
    const res = await fetch(`${baseUrl}/api/admin/projects/${id}`, {
      method: 'DELETE', headers: auth(token),
    });
    assert.equal(res.status, 200);
  });

  it('rejects project without title', async () => {
    const res = await fetch(`${baseUrl}/api/admin/projects`, {
      method: 'POST', headers: auth(token),
      body: JSON.stringify({ description: 'No title' }),
    });
    assert.equal(res.status, 400);
  });
});

describe('Blog posts CRUD', () => {
  let store, token;
  before(async () => { store = await setup(); token = await login(); });
  after(async () => { await teardown(store); });

  it('creates a draft post', async () => {
    const res = await fetch(`${baseUrl}/api/admin/posts`, {
      method: 'POST', headers: auth(token),
      body: JSON.stringify({ title: 'Draft Post', body: 'Content here', published: false }),
    });
    assert.equal(res.status, 201);
    const p = await res.json();
    assert.equal(p.published, false);
    assert.ok(p.slug);
  });

  it('draft not visible in public API or direct lookup', async () => {
    const posts = await (await fetch(`${baseUrl}/api/posts`)).json();
    assert.equal(posts.filter(p => p.title === 'Draft Post').length, 0);
    const admin = await (await fetch(`${baseUrl}/api/admin/posts`, { headers: auth(token) })).json();
    const draft = admin.find(p => p.title === 'Draft Post');
    const direct = await fetch(`${baseUrl}/api/posts/${draft.id}`);
    assert.equal(direct.status, 404);
  });

  it('publishes a post', async () => {
    const admin = await (await fetch(`${baseUrl}/api/admin/posts`, { headers: auth(token) })).json();
    const id = admin[0].id;
    const res = await fetch(`${baseUrl}/api/admin/posts/${id}`, {
      method: 'PATCH', headers: auth(token),
      body: JSON.stringify({ published: true }),
    });
    assert.equal(res.status, 200);
    const p = await res.json();
    assert.equal(p.published, true);
  });

  it('published post visible in public API', async () => {
    const posts = await (await fetch(`${baseUrl}/api/posts`)).json();
    assert.ok(posts.length >= 1);
  });

  it('deletes a post', async () => {
    const admin = await (await fetch(`${baseUrl}/api/admin/posts`, { headers: auth(token) })).json();
    const res = await fetch(`${baseUrl}/api/admin/posts/${admin[0].id}`, {
      method: 'DELETE', headers: auth(token),
    });
    assert.equal(res.status, 200);
  });
});

describe('Persistence shutdown', () => {
  it('creates a missing directory and drains concurrent queued writes before reload', async () => {
    const parent = mkdtempSync(join(tmpdir(), 'cms-drain-'));
    try {
      const directory = join(parent, 'nested', 'data');
      const store = await openStore(directory);
      for (let i = 0; i < 40; i++) {
        store.createProject({ title: `Project ${i}` });
        store.createPost({ title: `Post ${i}`, published: false });
      }
      await store.drain();
      const restored = await openStore(directory);
      assert.equal(restored.listProjects().length, 40);
      assert.equal(restored.listPosts().length, 40);
      await restored.drain();
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });
});

describe('Edge cases', () => {
  let store;
  before(async () => { store = await setup(); });
  after(async () => { await teardown(store); });

  it('returns 404 for unknown routes', async () => {
    const res = await fetch(`${baseUrl}/api/unknown`);
    assert.equal(res.status, 404);
  });

  it('returns 404 for nonexistent project', async () => {
    const res = await fetch(`${baseUrl}/api/projects/nonexistent`);
    assert.equal(res.status, 404);
  });

  it('returns 404 for nonexistent post', async () => {
    const res = await fetch(`${baseUrl}/api/posts/nonexistent`);
    assert.equal(res.status, 404);
  });
});
