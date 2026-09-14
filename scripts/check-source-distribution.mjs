import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const parent = path.join(root, '.source-test-tmp');
fs.mkdirSync(parent, { recursive: true });
const scratch = fs.mkdtempSync(path.join(parent, 'packed-'));
const run = (command, args, cwd = root) => {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', shell: false });
  assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
};
try {
  const packed = JSON.parse(run('npm', ['pack', './dist/universal-cli', '--ignore-scripts', '--json', '--pack-destination', scratch]));
  run('tar', ['-xzf', path.join(scratch, packed[0].filename), '-C', scratch]);
  const distribution = path.join(scratch, 'package');
  const manifest = JSON.parse(fs.readFileSync(path.join(distribution, 'package.json'), 'utf8'));
  assert.equal(Object.keys(manifest.dependencies ?? {}).length, 0);
  assert.equal(Object.keys(manifest.devDependencies ?? {}).length, 0);
  const registry = JSON.parse(fs.readFileSync(path.join(distribution, 'registry/index.json'), 'utf8'));
  assert.equal(registry.packages.length, 9, 'Every runtime package must be covered');
  const cli = path.join(distribution, 'cli.mjs');
  for (const framework of ['react', 'vue', 'svelte', 'native']) {
    const cwd = path.join(scratch, framework);
    fs.mkdirSync(path.join(cwd, 'src'), { recursive: true });
    fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify({ name: `consumer-${framework}`, private: true, type: 'module' }));
    fs.writeFileSync(path.join(cwd, 'src/index.css'), '@import "tailwindcss";\n');
    run(process.execPath, [cli, 'init', '--framework', framework], cwd);
    run(process.execPath, [cli, 'add', '--all', '--framework', framework, '--no-install'], cwd);
    run(process.execPath, [cli, 'doctor'], cwd);
    const consumer = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    for (const group of ['dependencies', 'devDependencies']) for (const [name, version] of Object.entries(consumer[group] ?? {})) {
      assert.ok(!name.startsWith('@package/') && !name.includes('universal-cli'));
      assert.ok(!version.startsWith('workspace:'));
    }
    console.log(`${framework}: packed CLI generated all matching source items without a workspace library`);
  }
  console.log(`PASS: ${registry.publicEntryCount} public entries across ${registry.packages.length} runtime packages. Framework compilation is a separate release check.`);
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
