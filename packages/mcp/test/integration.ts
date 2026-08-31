/**
 * Integration test for the stdio MCP server: spawns the real process,
 * runs the initialize → tools/list → tools/call flow, and asserts each
 * response. Run with: tsx packages/mcp/test/integration.ts
 */
import { spawn } from 'node:child_process';
import path from 'node:path';

const serverPath = path.resolve(import.meta.dirname, '..', 'src', 'index.ts');
const child = spawn('npx', ['tsx', serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
});

let buffer = '';
const pending = new Map<number, (value: unknown) => void>();
let nextId = 1;

child.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  let index: number;
  while ((index = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, index).trim();
    buffer = buffer.slice(index + 1);
    if (line === '') continue;
    const message = JSON.parse(line) as { id?: number; result?: unknown; error?: { message: string } };
    if (typeof message.id === 'number' && pending.has(message.id)) {
      pending.get(message.id)?.(message.error ? { error: message.error } : message.result);
      pending.delete(message.id);
    }
  }
});
child.stderr.on('data', (chunk) => process.stderr.write(`[server] ${chunk}`));

function request(method: string, params?: Record<string, unknown>): Promise<unknown> {
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
  });
}

function assert(condition: unknown, label: string): void {
  if (!condition) {
    console.error(`FAIL ${label}`);
    process.exit(1);
  }
  console.log(`PASS ${label}`);
}

const init = (await request('initialize', {
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: { name: 'test', version: '0.0.0' },
})) as { serverInfo: { name: string }; tools?: unknown };
assert(init.serverInfo.name === 'tauri-universal-mcp', 'initialize handshake');

const listed = (await request('tools/list')) as { tools: { name: string }[] };
assert(
  listed.tools.map((t) => t.name).join(',') === 'find_capabilities,get_component_docs,get_recipe',
  'tools/list exposes 3 tools',
);

const find = (await request('tools/call', {
  name: 'find_capabilities',
  arguments: { query: 'table', framework: 'native', detail: 'symbols' },
})) as { content: { text: string }[] };
assert(
  find.content[0].text.includes('ui.table') && find.content[0].text.includes('TableHead'),
  'find_capabilities returns native table entry with symbols',
);

const docs = (await request('tools/call', {
  name: 'get_component_docs',
  arguments: { symbol: 'ProDataTable', framework: 'react' },
})) as { content: { text: string }[] };
assert(
  docs.content[0].text.includes('@package/pro/data-table') &&
    !docs.content[0].text.includes('pro-vue') &&
    docs.content[0].text.length < 1200,
  'get_component_docs returns one compact framework implementation',
);

const usage = (await request('tools/call', {
  name: 'get_component_docs',
  arguments: { symbol: 'ProDataTable', framework: 'react', detail: 'usage' },
})) as { content: { text: string }[] };
assert(usage.content[0].text.includes('Client mode'), 'usage detail explicitly returns the focused example');

const recipe = (await request('tools/call', {
  name: 'get_recipe',
  arguments: { id: 'crud', framework: 'react' },
})) as { content: { text: string }[] };
assert(
  recipe.content[0].text.includes('apps/tauri-app/src/pages/todos-page.tsx') &&
    !recipe.content[0].text.includes('vue-playground') &&
    recipe.content[0].text.length < 1200,
  'get_recipe returns one compact framework recipe',
);

const recipeUsage = (await request('tools/call', {
  name: 'get_recipe',
  arguments: { id: 'crud', framework: 'react', detail: 'usage' },
})) as { content: { text: string }[] };
assert(recipeUsage.content[0].text.includes('defineProResource'), 'recipe usage explicitly returns source');

const unknownTool = (await request('tools/call', {
  name: 'does_not_exist',
  arguments: {},
})) as { error?: { message: string } } | undefined;
assert(unknownTool.error?.message.includes('Unknown tool'), 'unknown tool returns protocol error');

child.kill();
console.log('ALL MCP INTEGRATION TESTS PASSED');
process.exit(0);
