import express from 'express';
import { verifyPassword, createSession, destroySession, requireAuth, sessionTokenFrom } from './auth.js';

export function createApp({ store }) {
  const app = express();

  // Security
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  app.use(express.json({ limit: '100kb' }));
  app.use(express.static('public'));

  // --- Public API ---

  app.get('/api/projects', (_req, res) => {
    res.json(store.listProjects());
  });

  app.get('/api/projects/:id', (req, res) => {
    const p = store.getProject(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    res.json(p);
  });

  app.get('/api/posts', (_req, res) => {
    res.json(store.listPosts(true));
  });

  app.get('/api/posts/:id', (req, res) => {
    const p = store.getPost(req.params.id);
    if (!p || p.published !== true) return res.status(404).json({ error: 'Post not found' });
    res.json(p);
  });

  // --- Auth ---

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const user = store.findUser(username.trim());
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = createSession(user.id);
    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; SameSite=Strict; Path=/`);
    res.json({ ok: true, user: { id: user.id, username: user.username, role: user.role } });
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = sessionTokenFrom(req);
    destroySession(token);
    res.setHeader('Set-Cookie', 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireAuth(store), (req, res) => {
    res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
  });

  // --- Admin API ---

  app.post('/api/admin/projects', requireAuth(store), (req, res) => {
    const { title, description, tags, imageUrl, liveUrl, repoUrl } = req.body ?? {};
    if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ error: 'Title required' });
    const p = store.createProject({ title, description, tags, imageUrl, liveUrl, repoUrl });
    res.status(201).json(p);
  });

  app.patch('/api/admin/projects/:id', requireAuth(store), (req, res) => {
    const result = store.updateProject(req.params.id, req.body ?? {});
    if (!result) return res.status(404).json({ error: 'Project not found' });
    res.json(result);
  });

  app.delete('/api/admin/projects/:id', requireAuth(store), (req, res) => {
    if (!store.deleteProject(req.params.id)) return res.status(404).json({ error: 'Project not found' });
    res.json({ ok: true });
  });

  app.post('/api/admin/posts', requireAuth(store), (req, res) => {
    const { title, body, tags, published } = req.body ?? {};
    if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ error: 'Title required' });
    const p = store.createPost({ title, body, tags, published });
    res.status(201).json(p);
  });

  app.patch('/api/admin/posts/:id', requireAuth(store), (req, res) => {
    const result = store.updatePost(req.params.id, req.body ?? {});
    if (!result) return res.status(404).json({ error: 'Post not found' });
    res.json(result);
  });

  app.delete('/api/admin/posts/:id', requireAuth(store), (req, res) => {
    if (!store.deletePost(req.params.id)) return res.status(404).json({ error: 'Post not found' });
    res.json({ ok: true });
  });

  // Admin: list all posts (including drafts)
  app.get('/api/admin/posts', requireAuth(store), (_req, res) => {
    res.json(store.listPosts(false));
  });

  // Catch-all
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  return app;
}
