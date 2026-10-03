#!/usr/bin/env node
// kb-workflow scaffold installer.
//
// Copies AGENTS.md, .agents/, and docs/ from this package into a target project.
// Preview by default; pass --write to create files. Existing files are never
// overwritten; a directory sitting where a file belongs is a conflict.
//
// Usage:
//   node init.mjs <target-dir>            # preview the plan
//   node init.mjs <target-dir> --write    # create the missing files
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const SCAFFOLD = ['AGENTS.md', '.agents', 'docs'];
const SKIP_DIRS = new Set(['node_modules', '.git']);

const args = process.argv.slice(2);
const write = args.includes('--write');
const targetArg = args.find((arg) => !arg.startsWith('--'));
if (!targetArg) {
  console.error('Usage: node init.mjs <target-dir> [--write]');
  process.exit(2);
}
const target = path.resolve(targetArg);

async function walk(dir) {
  const files = [];
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function classify(relative) {
  const destination = path.join(target, relative);
  try {
    const details = await stat(destination);
    return details.isFile() ? 'exists' : 'conflict';
  } catch (error) {
    if (error instanceof Error && error.code === 'ENOENT') return 'create';
    throw error;
  }
}

const sources = [];
for (const top of SCAFFOLD) {
  const full = path.join(packageRoot, top);
  if ((await stat(full)).isDirectory()) sources.push(...(await walk(full)));
  else sources.push(full);
}

const plan = [];
for (const source of sources) {
  const relative = path.relative(packageRoot, source).split(path.sep).join('/');
  plan.push({ relative, status: await classify(relative) });
}

console.log(`kb-workflow scaffold → ${target}`);
for (const { relative, status } of plan) {
  const mark = status === 'create' ? '+' : status === 'exists' ? '=' : 'x';
  const note = status === 'exists' ? ' (exists — keeping yours)' : status === 'conflict' ? ' (conflict — a directory occupies this path)' : '';
  console.log(`  ${mark} ${relative}${note}`);
}
const created = plan.filter((entry) => entry.status === 'create').length;
const conflicts = plan.filter((entry) => entry.status === 'conflict').length;
console.log(`${created} file(s) to create, ${plan.length - created - conflicts} kept, ${conflicts} conflict(s)`);

if (conflicts > 0) {
  console.error('Resolve the conflicts above, then re-run.');
  process.exit(1);
}
if (!write) {
  console.log('Preview only — re-run with --write to create the files.');
  process.exit(0);
}
for (const { relative, status } of plan) {
  if (status !== 'create') continue;
  const destination = path.join(target, ...relative.split('/'));
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, await readFile(path.join(packageRoot, ...relative.split('/'))));
}
console.log(`Wrote ${created} file(s) into ${target}.`);
