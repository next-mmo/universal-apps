import { mkdir, readFile, open, rename, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export class StoreError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function titleValue(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 200) {
    throw new StoreError(400, 'Title must contain 1–200 characters.');
  }
  return value.trim();
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validateSnapshot(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.todos)) throw new Error('Invalid store schema');
  const ids = new Set();
  for (const todo of data.todos) {
    if (!todo || !uuid.test(todo.id) || ids.has(todo.id) || typeof todo.completed !== 'boolean' ||
        titleValue(todo.title) !== todo.title || !Number.isFinite(Date.parse(todo.createdAt)) ||
        !Number.isFinite(Date.parse(todo.updatedAt))) throw new Error('Invalid stored todo');
    ids.add(todo.id);
  }
}
async function atomicWrite(file, data, beforeRename = async () => {}) {
  const temp = `${file}.${randomUUID()}.tmp`;
  let handle;
  try {
    handle = await open(temp, 'wx', 0o600);
    await handle.writeFile(`${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await handle.sync();
    await handle.close();
    handle = undefined;
    await beforeRename();
    await rename(temp, file);
  } finally {
    await handle?.close().catch(() => {});
    // Only remove the unique temporary file owned by this attempted write.
    await unlink(temp).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}

// One store instance owns one file. This is not a multi-process database.
// Optional beforePersist seam injects I/O failures in deterministic tests.
export async function openStore(filename, { beforePersist = async () => {}, beforeRename = async () => {} } = {}) {
  const file = resolve(filename);
  await mkdir(dirname(file), { recursive: true });
  let snapshot;
  try { snapshot = JSON.parse(await readFile(file, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw new Error('Cannot read todo store; preserve file and inspect it.', { cause: error });
    snapshot = { version: 1, todos: [] };
    await atomicWrite(file, snapshot);
  }
  validateSnapshot(snapshot);
  let tail = Promise.resolve();
  const copy = value => structuredClone(value);
  function mutate(change) {
    const operation = tail.then(async () => {
      const next = copy(snapshot);
      const result = change(next.todos);
      await beforePersist(next);
      await atomicWrite(file, next, beforeRename);
      snapshot = next;
      return copy(result);
    });
    tail = operation.catch(() => {});
    return operation;
  }
  function indexOf(todos, id) {
    if (!uuid.test(id)) throw new StoreError(400, 'Invalid todo ID.');
    const index = todos.findIndex(todo => todo.id === id);
    if (index < 0) throw new StoreError(404, 'Todo not found.');
    return index;
  }
  return {
    async list() { await tail; return copy(snapshot.todos); },
    add(title) {
      const clean = titleValue(title);
      return mutate(todos => {
        const now = new Date().toISOString();
        const todo = { id: randomUUID(), title: clean, completed: false, createdAt: now, updatedAt: now };
        todos.push(todo);
        return todo;
      });
    },
    update(id, patch) {
      return mutate(todos => {
        const index = indexOf(todos, id);
        const todo = { ...todos[index], ...patch, updatedAt: new Date().toISOString() };
        todos[index] = todo;
        return todo;
      });
    },
    remove(id) { return mutate(todos => { todos.splice(indexOf(todos, id), 1); return null; }); },
    async drain() { await tail; }
  };
}
