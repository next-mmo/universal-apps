import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { test } from 'node:test';
import path from 'node:path';

interface Reply {
  content?: Array<{ text: string }>;
  isError?: boolean;
  tools?: Array<{ name: string }>;
  serverInfo?: { name: string };
}

test('real MCP process uses the shared catalog and handles invalid requests', { timeout: 15_000 }, async (t) => {
  // Reuse the active tsx loader / Node type-stripping flags; never invoke npx.
  const child = spawn(process.execPath, [...process.execArgv, path.resolve(import.meta.dirname, '../src/index.ts')], { stdio: ['pipe', 'pipe', 'pipe'] });
  t.after(() => { child.stdin.destroy(); child.kill(); });
  let buffer = '';
  let stderr = '';
  let id = 0;
  const pending = new Map<number, {
    resolve: (reply: Reply) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }>();
  child.stderr.on('data', (data) => { stderr = (stderr + String(data)).slice(-4000); });
  child.stdout.on('data', (data) => {
    buffer += String(data);
    let newline: number;
    while ((newline = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      const message = JSON.parse(line);
      const handler = pending.get(message.id);
      if (!handler) continue;
      clearTimeout(handler.timer);
      pending.delete(message.id);
      if (message.error) handler.reject(new Error(message.error.message));
      else handler.resolve(message.result);
    }
  });
  child.on('exit', (code) => {
    for (const handler of pending.values()) {
      clearTimeout(handler.timer);
      handler.reject(new Error(`MCP exited ${code}: ${stderr}`));
    }
    pending.clear();
  });
  function request(method: string, params?: unknown): Promise<Reply> {
    const requestId = ++id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`MCP timeout: ${stderr}`));
      }, 5000);
      pending.set(requestId, { resolve, reject, timer });
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params }) + '\n');
    });
  }
  function call(name: string, args: Record<string, unknown>) {
    return request('tools/call', { name, arguments: args });
  }
  assert.equal((await request('initialize', {
    protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' },
  })).serverInfo?.name, 'tauri-universal-mcp');
  assert.deepEqual((await request('tools/list')).tools?.map((tool) => tool.name), ['find_capabilities', 'get_component_docs', 'get_recipe']);
  const found = await call('find_capabilities', { query: 'cancel', framework: 'react' });
  assert.match(found.content![0].text, /core.async-task/);
  const api = await call('get_component_docs', { id: 'core.async-task', framework: 'react', detail: 'api' });
  assert.match(api.content![0].text, /createAsyncTask/);
  assert.match(api.content![0].text, /import type/);
  assert.equal(api.isError, undefined);
  const native = await call('get_component_docs', { id: 'ui.button', framework: 'native', detail: 'usage' });
  assert.equal(native.isError, true);
  assert.match(native.content![0].text, /USAGE_UNAVAILABLE/);
  const bad = await call('find_capabilities', { limit: -1 });
  assert.equal(bad.isError, true);
  await assert.rejects(call('does_not_exist', {}), /Unknown tool/);
  const example = await call('get_recipe', { id: 'cancellable-task', framework: 'vue', detail: 'usage' });
  assert.match(example.content![0].text, /createPreviewTask/);
  const last = call('get_component_docs', { id: 'block.app-frame', framework: 'react' });
  child.stdin.end();
  assert.match((await last).content![0].text, /@package\/pro\/app-frame/);
});
