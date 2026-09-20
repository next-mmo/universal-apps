import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { agent } from '../src/agent';
import { loadConfig } from '../src/config';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL ${label}`);
  console.info(`PASS ${label}`);
}

async function capture(args: string[]): Promise<string> {
  const config = await loadConfig();
  const lines: string[] = [];
  const original = console.log;
  console.log = (...values: unknown[]) => lines.push(values.map(String).join(' '));
  try {
    await agent(config, args);
  } finally {
    console.log = original;
  }
  return lines.join('\n');
}

const found = await capture(['find', '', '--framework', 'react']);
assert(found.includes('more; pass --all'), 'find defaults to five ranked results');
assert(found.length < 1200, 'find default stays inside response budget');

const inspected = await capture(['inspect', 'block.data-table', '--framework', 'react']);
assert(inspected.includes('@package/pro/data-table'), 'inspect returns the stable React import');
assert(!inspected.includes('pro-vue') && !inspected.includes('pro-svelte'), 'inspect excludes other frameworks');
assert(inspected.length < 1200, 'inspect default stays inside response budget');

const recipe = await capture(['recipe', 'crud-page', '--framework', 'react']);
assert(recipe.includes('apps/docs/src/pages/todos-page.tsx'), 'recipe returns the selected example path');
assert(!recipe.includes('vue-playground') && !recipe.includes('svelte-playground'), 'recipe excludes other frameworks');
assert(recipe.length < 1200, 'recipe default stays inside response budget');

const example = await capture(['recipe', 'crud-page', '--framework', 'react', '--example']);
assert(example.includes('defineProResource'), 'example source is available explicitly');

const aliasedRecipe = await capture(['recipe', 'block.crud-page', '--framework', 'react']);
assert(aliasedRecipe.includes('apps/docs/src/pages/todos-page.tsx'), 'recipe resolves capability alias');

const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'tauri-universal-agent-'));
const starterRoot = path.join(tempRoot, 'todo');
try {
  const dryRun = await capture(['init', 'todo', '--out', starterRoot, '--dry-run']);
  assert(dryRun.includes('CREATE AGENTS.md'), 'init dry-run reports starter files');
  await access(path.join(starterRoot, 'AGENTS.md')).then(
    () => {
      throw new Error('FAIL init dry-run wrote files');
    },
    () => undefined,
  );

  const created = await capture(['init', 'todo', '--out', starterRoot]);
  assert(created.includes('CREATE .agents/docs/prd/0001-todo.md'), 'init writes the Todo PRD');
  assert((await readFile(path.join(starterRoot, 'AGENTS.md'), 'utf8')).toLowerCase().includes('reuse'), 'starter includes reuse guidance');

  const rerun = await capture(['init', 'todo', '--out', starterRoot]);
  assert(rerun.includes('EXISTS AGENTS.md'), 'init preserves existing files on rerun');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

console.info('ALL CLI INTEGRATION TESTS PASSED');
