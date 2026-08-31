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
assert(recipe.includes('apps/tauri-app/src/pages/todos-page.tsx'), 'recipe returns the selected example path');
assert(!recipe.includes('vue-playground') && !recipe.includes('svelte-playground'), 'recipe excludes other frameworks');
assert(recipe.length < 1200, 'recipe default stays inside response budget');

const example = await capture(['recipe', 'crud-page', '--framework', 'react', '--example']);
assert(example.includes('defineProResource'), 'example source is available explicitly');

console.info('ALL CLI INTEGRATION TESTS PASSED');
