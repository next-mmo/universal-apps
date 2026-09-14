import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { openStore } from './store.js';
import { createApp } from './app.js';

const portText = process.env.PORT ?? '3000';
if (!/^\d+$/.test(portText) || Number(portText) > 65535) throw new Error('PORT must be 0–65535.');
const file = process.env.TODO_DATA_FILE
  ? resolve(process.env.TODO_DATA_FILE)
  : fileURLToPath(new URL('../data/todos.json', import.meta.url));
try {
  const store = await openStore(file);
  const server = createApp({ store }).listen(Number(portText), '127.0.0.1');
  server.on('listening', () => console.log(`Todo listening at http://127.0.0.1:${server.address().port}`));
  server.on('error', () => { console.error('Server could not bind localhost port.'); process.exitCode = 1; });
  let stopping = false;
  function stop() {
    if (stopping) return;
    stopping = true;
    server.close(async () => { await store.drain(); process.exitCode = 0; });
    server.closeIdleConnections();
  }
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
} catch {
  console.error('Startup failed. Check local data integrity and permissions; existing data was not reset.');
  process.exitCode = 1;
}
