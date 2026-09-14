#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialize, validateRegistry, planInstall, applyPlan, diffItems, doctor } from './install.mjs';

const help = `universal <command> [items] [options]

  init                configure local source generation in an existing project
  list                list available source items
  add <items...>      copy source, helpers, types and styles into your project
  diff <items...>     inspect local modifications without changing files
  doctor              check for missing files and workspace library dependencies

  -c, --cwd <path>          target project (default: current directory)
  --path <path>            generated source directory (init only)
  --css <path>             Tailwind v4 stylesheet (init only)
  --framework <name>       react, vue, svelte or native
  --all                    add all packages for an explicit --framework
  --overwrite              explicitly replace differing local source files
  --dry-run                show a write plan without changing anything
  --no-install             write dependency declarations but do not run install
  --package-manager <name>  npm, pnpm, yarn or bun
  --registry <file>         use a local registry bundle instead of the packed one
  --help                   display this help

Generated applications do not import or require this CLI at runtime.
`;

export async function main(args = process.argv.slice(2)) {
  if (!args.length || args.includes('--help') || args.includes('-h')) { console.log(help); return; }
  const [command, ...rest] = args;
  const options = {};
  const names = [];
  const values = new Map([['--cwd', 'cwd'], ['-c', 'cwd'], ['--path', 'path'], ['--css', 'css'], ['--framework', 'framework'], ['--package-manager', 'packageManager'], ['--registry', 'registry']]);
  const flags = new Map([['--all', 'all'], ['--overwrite', 'overwrite'], ['--dry-run', 'dryRun'], ['--no-install', 'noInstall'], ['--yes', 'yes'], ['-y', 'yes']]);
  for (let index = 0; index < rest.length; index++) {
    const arg = rest[index];
    if (values.has(arg)) {
      if (!rest[index + 1] || rest[index + 1].startsWith('-')) throw new Error(`Missing value for ${arg}`);
      options[values.get(arg)] = rest[++index];
    } else if (flags.has(arg)) options[flags.get(arg)] = true;
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else names.push(arg);
  }
  if (!['init', 'list', 'add', 'diff', 'doctor'].includes(command)) throw new Error(`Unknown command: ${command}`);
  if (options.framework && !['react', 'vue', 'svelte', 'native'].includes(options.framework)) throw new Error('Invalid --framework');
  if (command !== 'init' && (options.path || options.css)) throw new Error('--path and --css configure init only; edit universal.json for existing projects');
  if (!['add', 'diff'].includes(command) && names.length) throw new Error(`Unexpected arguments for ${command}`);
  const cwd = path.resolve(options.cwd ?? process.cwd());
  if (command === 'init') {
    console.log(JSON.stringify(initialize(cwd, options), null, 2));
    return;
  }
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = options.registry ? [path.resolve(options.registry)] : [path.join(here, 'registry/index.json'), path.resolve(here, '../../../dist/universal-cli/registry/index.json')];
  const registryPath = candidates.find((file) => fs.existsSync(file));
  if (!registryPath) throw new Error('Registry bundle is missing. Maintainers: run pnpm source:build before using pnpm source.');
  const registry = validateRegistry(JSON.parse(fs.readFileSync(registryPath, 'utf8')));
  if (command === 'list') {
    console.log(registry.items.filter((item) => !options.framework || [options.framework, 'shared'].includes(item.meta.framework)).map((item) => `${item.name}\t${item.meta.framework}\t${item.files.length} files`).join('\n'));
  } else if (command === 'add') {
    console.log(JSON.stringify(applyPlan(planInstall(cwd, registry, names, options), options), null, 2));
  } else if (command === 'diff') {
    for (const result of diffItems(cwd, registry, names, options)) {
      console.log(`${result.status}\t${result.file}`);
      if (result.status === 'modified') console.log(`--- local/${result.file}\n+++ registry/${result.file}\n${result.current.split('\n').map((line) => '-' + line).join('\n')}\n${result.registry.split('\n').map((line) => '+' + line).join('\n')}`);
    }
  } else {
    const report = doctor(cwd, registry);
    console.log(JSON.stringify(report, null, 2));
    if (!report.ok) process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(`universal: ${error.message}`); process.exitCode = 1; });
}
