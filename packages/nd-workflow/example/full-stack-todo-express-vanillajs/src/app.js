import express from 'express';
import { fileURLToPath } from 'node:url';
import { StoreError, titleValue } from './store.js';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
export function createApp({ store }) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set({
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store'
    });
    const port = req.socket.localPort;
    const validHosts = [`127.0.0.1:${port}`, `localhost:${port}`];
    if (!validHosts.includes(req.get('host'))) return res.status(403).json({ error: 'Local host required.' });
    if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
      const origin = req.get('origin');
      if (origin && !validHosts.some(host => origin === `http://${host}`)) {
        return res.status(403).json({ error: 'Cross-origin mutation denied.' });
      }
      if (req.get('sec-fetch-site') === 'cross-site') return res.status(403).json({ error: 'Cross-site mutation denied.' });
      if (['POST', 'PATCH'].includes(req.method) && !req.is('application/json')) {
        return res.status(415).json({ error: 'Content-Type must be application/json.' });
      }
    }
    next();
  });
  app.use(express.json({ limit: '16kb', strict: true }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/todos', async (_req, res) => res.json({ todos: await store.list() }));
  const objectBody = body => {
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new StoreError(400, 'JSON object required.');
  };
  app.post('/api/todos', async (req, res) => {
    objectBody(req.body);
    if (Object.keys(req.body).length !== 1 || !Object.hasOwn(req.body, 'title')) throw new StoreError(400, 'Only title is accepted.');
    res.status(201).json({ todo: await store.add(titleValue(req.body.title)) });
  });
  app.patch('/api/todos/:id', async (req, res) => {
    objectBody(req.body);
    const keys = Object.keys(req.body);
    if (!keys.length || keys.some(key => !['title', 'completed'].includes(key))) throw new StoreError(400, 'Use title or completed.');
    const patch = {};
    if (Object.hasOwn(req.body, 'title')) patch.title = titleValue(req.body.title);
    if (Object.hasOwn(req.body, 'completed')) {
      if (typeof req.body.completed !== 'boolean') throw new StoreError(400, 'Completed must be boolean.');
      patch.completed = req.body.completed;
    }
    res.json({ todo: await store.update(req.params.id, patch) });
  });
  app.delete('/api/todos/:id', async (req, res) => { await store.remove(req.params.id); res.status(204).end(); });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));
  app.use(express.static(publicDir, { dotfiles: 'deny', etag: false }));
  app.use((_req, res) => res.status(404).json({ error: 'Page not found.' }));
  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON.' });
    if (error instanceof StoreError) return res.status(error.status).json({ error: error.message });
    res.status(500).json({ error: 'Storage operation failed. Please retry.' });
  });
  return app;
}
