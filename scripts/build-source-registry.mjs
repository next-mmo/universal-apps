import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../packages/cli/source/graph.mjs';

export function buildDistribution(root) {
  root = fs.realpathSync(root);
  const registry = buildRegistry(root);
  const output = path.join(root, 'dist/universal-cli');
  // Build/validate the entire graph before touching the previous distribution.
  fs.mkdirSync(path.join(output, 'registry'), { recursive: true });
  const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
  for (const entry of fs.readdirSync(path.join(output, 'registry'))) {
    if (entry.endsWith('.json')) fs.unlinkSync(path.join(output, 'registry', entry));
  }
  for (const name of ['cli.mjs', 'install.mjs', 'templates.mjs']) fs.copyFileSync(path.join(root, 'packages/cli/source', name), path.join(output, name));
  fs.chmodSync(path.join(output, 'cli.mjs'), 0o755);
  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(output, 'LICENSE'));
  fs.copyFileSync(path.join(root, 'packages/cli/source/README.md'), path.join(output, 'README.md'));
  writeJson(path.join(output, 'package.json'), {
    name: '@next-mmo/universal-cli', version: registry.version, type: 'module',
    description: 'Copy editable Universal Apps source into your own project. No Universal Apps runtime library.',
    license: 'Unlicense', engines: { node: '>=20.10.0' },
    bin: { universal: './cli.mjs' }, files: ['cli.mjs', 'install.mjs', 'templates.mjs', 'registry', 'LICENSE', 'README.md'],
    publishConfig: { access: 'public' },
  });
  writeJson(path.join(output, 'registry/index.json'), registry);
  for (const item of registry.items) writeJson(path.join(output, 'registry', `${item.name}.json`), item);
  writeJson(path.join(output, 'registry/registry.json'), {
    $schema: 'https://ui.shadcn.com/schema/registry.json', name: 'universal-apps',
    homepage: 'https://github.com/next-mmo/universal-apps', items: registry.items,
  });
  console.log(JSON.stringify({ output, publicEntries: registry.publicEntryCount, items: registry.items.length, packages: registry.packages.length, runtimeDependencies: 0 }, null, 2));
  return output;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { buildDistribution(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
