import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const SESSIONS = new Map();
const SESSION_TTL = 3600_000; // 1 hour

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password, hash) {
  const computed = Buffer.from(hashPassword(password), 'utf-8');
  const stored = Buffer.from(hash, 'utf-8');
  if (computed.length !== stored.length) return false;
  return timingSafeEqual(computed, stored);
}

export function createSession(userId) {
  const token = randomBytes(32).toString('hex');
  SESSIONS.set(token, { userId, expiresAt: Date.now() + SESSION_TTL });
  return token;
}

export function getSession(token) {
  const s = SESSIONS.get(token);
  if (!s) return null;
  if (Date.now() > s.expiresAt) { SESSIONS.delete(token); return null; }
  return s;
}

export function destroySession(token) {
  SESSIONS.delete(token);
}

export function sessionTokenFrom(req) {
  return req.headers['x-session-token'] ?? parseCookie(req.headers.cookie ?? '', 'session');
}

export function requireAuth(store) {
  return (req, res, next) => {
    const token = sessionTokenFrom(req);
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const session = getSession(token);
    if (!session) return res.status(401).json({ error: 'Invalid or expired session' });
    const user = store.getUserById(session.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = user;
    req.sessionToken = token;
    next();
  };
}

function parseCookie(header, name) {
  const match = header.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return match ? match.slice(name.length + 1) : null;
}
