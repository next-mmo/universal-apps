import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { openStore } from './store.js';
import { createApp } from './app.js';

const portText = process.env.PORT ?? '3001';
if (!/^\d+$/.test(portText) || Number(portText) > 65535) throw new Error('PORT must be 0–65535.');
const dataDir = process.env.CMS_DATA_DIR
  ? resolve(process.env.CMS_DATA_DIR)
  : fileURLToPath(new URL('../data', import.meta.url));
try {
  const store = await openStore(dataDir);
  const server = createApp({ store }).listen(Number(portText), '127.0.0.1');
  server.on('listening', () => console.log(`CMS Portfolio listening at http://127.0.0.1:${server.address().port}`));
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
  console.error('Startup failed. Check local data integrity and permissions.');
  process.exitCode = 1;
}
