import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve, dirname } from 'node:path';

/** Durable JSON file store with atomic writes. Shared pattern with Todo example. */

async function loadJSON(file) {
  try {
    const raw = await readFile(file, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

async function saveJSON(file, data) {
  const tmp = file + '.tmp.' + process.pid;
  const bytes = JSON.stringify(data, null, 2) + '\n';
  await writeFile(tmp, bytes, 'utf-8');
  await rename(tmp, file);
}

function stamp() { return new Date().toISOString(); }

export async function openStore(dir) {
  await mkdir(dir, { recursive: true });
  const projectsFile = resolve(dir, 'projects.json');
  const postsFile = resolve(dir, 'posts.json');
  const usersFile = resolve(dir, 'users.json');

  let projects = (await loadJSON(projectsFile)) ?? [];
  let posts = (await loadJSON(postsFile)) ?? [];
  let users = (await loadJSON(usersFile)) ?? [
    { id: 'admin', username: 'admin', passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', role: 'admin' }
  ];

  let dirty = { projects: false, posts: false, users: false };
  let draining = false;

  async function flush() {
    if (dirty.projects) { dirty.projects = false; try { await saveJSON(projectsFile, projects); } catch (e) { dirty.projects = true; throw e; } }
    if (dirty.posts) { dirty.posts = false; try { await saveJSON(postsFile, posts); } catch (e) { dirty.posts = true; throw e; } }
    if (dirty.users) { dirty.users = false; try { await saveJSON(usersFile, users); } catch (e) { dirty.users = true; throw e; } }
  }

  const queue = [];
  let flushing = false;
  function enqueue() {
    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject });
      if (!flushing) processQueue();
    });
  }
  async function processQueue() {
    flushing = true;
    while (queue.length) {
      const batch = queue.splice(0);
      try { await flush(); batch.forEach(b => b.resolve()); }
      catch (e) { batch.forEach(b => b.reject(e)); }
    }
    flushing = false;
  }

  let writeError = null;
  function scheduleFlush() {
    if (!draining) enqueue().catch(error => { writeError = error; });
  }

  return {
    // Projects
    listProjects() { return projects.map(p => ({ ...p })); },
    getProject(id) { const p = projects.find(x => x.id === id); return p ? { ...p } : null; },
    createProject({ title, description, tags, imageUrl, liveUrl, repoUrl }) {
      const p = { id: randomUUID(), title: title.trim(), description: (description ?? '').trim(), tags: tags ?? [], imageUrl: imageUrl ?? '', liveUrl: liveUrl ?? '', repoUrl: repoUrl ?? '', createdAt: stamp(), updatedAt: stamp() };
      projects.push(p);
      dirty.projects = true; scheduleFlush();
      return { ...p };
    },
    updateProject(id, updates) {
      const idx = projects.findIndex(x => x.id === id);
      if (idx === -1) return null;
      const allowed = ['title', 'description', 'tags', 'imageUrl', 'liveUrl', 'repoUrl'];
      for (const key of Object.keys(updates)) {
        if (allowed.includes(key)) projects[idx][key] = typeof updates[key] === 'string' ? updates[key].trim() : updates[key];
      }
      projects[idx].updatedAt = stamp();
      dirty.projects = true; scheduleFlush();
      return { ...projects[idx] };
    },
    deleteProject(id) {
      const idx = projects.findIndex(x => x.id === id);
      if (idx === -1) return false;
      projects.splice(idx, 1);
      dirty.projects = true; scheduleFlush();
      return true;
    },

    // Blog posts
    listPosts(publishedOnly = false) {
      const list = publishedOnly ? posts.filter(p => p.published) : posts;
      return list.map(p => ({ ...p }));
    },
    getPost(id) { const p = posts.find(x => x.id === id); return p ? { ...p } : null; },
    createPost({ title, body, tags, published }) {
      const p = { id: randomUUID(), title: title.trim(), body: (body ?? '').trim(), slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), tags: tags ?? [], published: published ?? false, createdAt: stamp(), updatedAt: stamp() };
      posts.push(p);
      dirty.posts = true; scheduleFlush();
      return { ...p };
    },
    updatePost(id, updates) {
      const idx = posts.findIndex(x => x.id === id);
      if (idx === -1) return null;
      const allowed = ['title', 'body', 'tags', 'published'];
      for (const key of Object.keys(updates)) {
        if (allowed.includes(key)) posts[idx][key] = typeof updates[key] === 'string' ? updates[key].trim() : updates[key];
      }
      if (updates.title) posts[idx].slug = updates.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      posts[idx].updatedAt = stamp();
      dirty.posts = true; scheduleFlush();
      return { ...posts[idx] };
    },
    deletePost(id) {
      const idx = posts.findIndex(x => x.id === id);
      if (idx === -1) return false;
      posts.splice(idx, 1);
      dirty.posts = true; scheduleFlush();
      return true;
    },

    // Auth
    findUser(username) { return users.find(u => u.username === username) ?? null; },
    getUserById(id) { return users.find(u => u.id === id) ?? null; },

    async drain() {
      draining = true;
      await enqueue();
      if (writeError) throw writeError;
    },
    async reload() {
      projects = (await loadJSON(projectsFile)) ?? [];
      posts = (await loadJSON(postsFile)) ?? [];
      users = (await loadJSON(usersFile)) ?? [];
    },
  };
}
