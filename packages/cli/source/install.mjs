import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { getTemplateFiles } from './templates.mjs';

const CONFIG = 'universal.json';
const RECEIPT = 'universal.lock.json';
const managers = ['npm', 'pnpm', 'yarn', 'bun'];
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const slash = (value) => value.split(path.sep).join('/');

/** Refuse traversal, absolute targets and symlink ancestors before any write. */
export function safePath(cwd, value) {
  if (typeof value !== 'string' || !value || path.isAbsolute(value) || /^[A-Za-z]:/.test(value) || value.includes('\\') || value.includes('\0') || value.split('/').some((part) => ['..', '.git', 'node_modules'].includes(part))) throw new Error(`Unsafe project path: ${value}`);
  const target = path.resolve(cwd, value);
  if (target === cwd || !target.startsWith(cwd + path.sep)) throw new Error(`Path escapes project: ${value}`);
  let current = cwd;
  for (const segment of path.relative(cwd, target).split(path.sep)) {
    current = path.join(current, segment);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`Refusing symlink target: ${value}`);
    // existsSync is false for dangling symlinks.
    try { if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Refusing symlink target: ${value}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return target;
}

export function validateRegistry(registry) {
  if (registry?.schemaVersion !== 1 || !Array.isArray(registry.items) || !Array.isArray(registry.packages)) throw new Error('Invalid source registry bundle');
  const names = new Set();
  for (const item of registry.items) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(item.name) || names.has(item.name) || !Array.isArray(item.files)) throw new Error('Invalid or duplicate registry item');
    names.add(item.name);
    for (const file of item.files) {
      if (typeof file.content !== 'string' || !file.target?.startsWith('@lib/universal/')) throw new Error(`Invalid source file in ${item.name}`);
      safePath(path.resolve('/registry-validation'), file.target.slice('@lib/universal/'.length));
    }
    for (const dependency of [...(item.dependencies ?? []), ...(item.devDependencies ?? [])]) parseDependency(dependency, registry.packages);
  }
  return registry;
}

function parseDependency(spec, forbidden = []) {
  if (typeof spec !== 'string') throw new Error('Invalid dependency specification');
  const split = spec.lastIndexOf('@');
  const name = spec.slice(0, split);
  const version = spec.slice(split + 1);
  if (split <= 0 || !/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name) || !version || /^(?:workspace|file|link|https?|git):/.test(version) || forbidden.includes(name) || name.startsWith('@package/')) throw new Error(`Non-portable dependency: ${spec}`);
  return [name, version];
}

function detectManager(cwd, manifest, explicit) {
  if (explicit && !managers.includes(explicit)) throw new Error(`Unsupported package manager: ${explicit}`);
  if (explicit) return explicit;
  const declared = manifest.packageManager?.split('@')[0];
  if (managers.includes(declared)) return declared;
  const locks = [['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['bun.lock', 'bun'], ['bun.lockb', 'bun'], ['package-lock.json', 'npm']].filter(([file]) => fs.existsSync(path.join(cwd, file)));
  if (new Set(locks.map(([, manager]) => manager)).size > 1) throw new Error('Multiple lockfiles found; specify --package-manager');
  return locks[0]?.[1] ?? 'npm';
}

export function initialize(cwd, options = {}) {
  cwd = fs.realpathSync(cwd);
  const manifest = readJson(safePath(cwd, 'package.json'));
  const existing = safePath(cwd, CONFIG);
  if (fs.existsSync(existing)) throw new Error('universal.json already exists; edit it instead of replacing company configuration');
  const allDeps = { ...manifest.dependencies, ...manifest.devDependencies };
  const framework = options.framework ?? (allDeps.vue ? 'vue' : allDeps.svelte ? 'svelte' : allDeps['react-native'] ? 'native' : 'react');
  if (!['react', 'vue', 'svelte', 'native'].includes(framework)) throw new Error(`Unsupported framework: ${framework}`);
  const candidates = ['src/app/globals.css', 'app/globals.css', 'src/index.css', 'src/style.css', 'src/styles.css', 'src/app.css', 'src/styles/globals.css', 'src/assets/main.css'];
  const config = {
    schemaVersion: 1,
    framework,
    sourceDir: options.path ?? (fs.existsSync(path.join(cwd, 'src')) ? 'src/lib/universal' : 'lib/universal'),
    css: options.css ?? candidates.find((file) => fs.existsSync(path.join(cwd, file))) ?? null,
  };
  safePath(cwd, config.sourceDir);
  if (config.css) {
    safePath(cwd, config.css);
    if (!config.css.endsWith('.css') || config.css.startsWith(config.sourceDir + '/')) throw new Error('css must be a .css stylesheet outside the generated source directory');
  }
  if (!options.dryRun) fs.writeFileSync(existing, json(config), { flag: 'wx' });
  return config;
}

function getConfig(cwd) {
  const config = readJson(safePath(cwd, CONFIG));
  if (config.schemaVersion !== 1 || !['react', 'vue', 'svelte', 'native'].includes(config.framework)) throw new Error('Unsupported universal.json configuration');
  safePath(cwd, config.sourceDir);
  if (config.css !== null) {
    safePath(cwd, config.css);
    if (!config.css.endsWith('.css') || config.css.startsWith(config.sourceDir + '/')) throw new Error('css must be a .css stylesheet outside the generated source directory');
  }
  return config;
}

export function selectItems(registry, names, options = {}) {
  const requested = new Set(names);
  if (options.all) {
    if (!options.framework) throw new Error('--all requires --framework to avoid mixing incompatible frameworks');
    for (const item of registry.items) {
      if ([options.framework, 'shared'].includes(item.meta?.framework) && item.name === item.meta?.package) requested.add(item.name);
    }
  }
  if (!requested.size) throw new Error('Choose at least one registry item; use list to discover names');
  return [...requested].map((name) => {
    const item = registry.items.find((item) => item.name === name || (item.name === `ui-${name}` && !registry.items.some((other) => other.name === name)));
    if (!item) throw new Error(`Unknown registry item: ${name}`);
    return item;
  });
}

export function planInstall(cwd, registry, names, options = {}) {
  cwd = fs.realpathSync(cwd);
  validateRegistry(registry);
  const config = getConfig(cwd);
  const manifestPath = safePath(cwd, 'package.json');
  const manifest = readJson(manifestPath);
  const items = selectItems(registry, names, options);
  for (const item of items) {
    if (![config.framework, 'shared'].includes(item.meta?.framework)) throw new Error(`${item.name} targets ${item.meta?.framework}, but this project is ${config.framework}`);
  }
  const writes = new Map();
  const unchanged = [];
  const conflicts = [];
  const proposed = new Map();
  for (const item of items) for (const file of item.files) {
    const relative = config.sourceDir + '/' + file.target.slice('@lib/universal/'.length);
    safePath(cwd, relative);
    if (proposed.has(relative) && proposed.get(relative) !== file.content) throw new Error(`Registry items disagree on shared file: ${relative}`);
    proposed.set(relative, file.content);
  }
  for (const [file, content] of proposed) {
    const target = safePath(cwd, file);
    if (fs.existsSync(target)) {
      if (fs.readFileSync(target, 'utf8') === content) { unchanged.push(file); continue; }
      if (!options.overwrite) { conflicts.push(file); continue; }
    }
    writes.set(file, content);
  }
  if (conflicts.length && !options.diff) throw new Error(`Existing files differ; no changes were made. Review diff, then use --overwrite explicitly:\n${conflicts.join('\n')}`);

  let dependenciesChanged = false;
  const requestedVersions = new Map();
  for (const item of items) for (const group of ['dependencies', 'devDependencies']) for (const spec of item[group] ?? []) {
    const [name, version] = parseDependency(spec, registry.packages);
    if (requestedVersions.has(name) && requestedVersions.get(name) !== version) throw new Error(`Registry items require different ${name} versions`);
    requestedVersions.set(name, version);
    // Preserve the company's chosen versions; never silently upgrade existing dependencies.
    if (manifest.dependencies?.[name] || manifest.devDependencies?.[name] || manifest.peerDependencies?.[name]) continue;
    manifest[group] ??= {};
    manifest[group][name] = version;
    dependenciesChanged = true;
  }
  for (const group of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const name of Object.keys(manifest[group] ?? {})) {
      if (registry.packages.includes(name)) throw new Error(`Remove the old ${name} dependency after migrating its imports; this CLI does not delete company dependencies automatically`);
    }
  }
  if (dependenciesChanged) writes.set('package.json', json(manifest));
  const tokens = `${config.sourceDir}/ui/styles/tokens.css`;
  if (proposed.has(tokens) && !options.diff) {
    if (!config.css) throw new Error('Set css in universal.json to your existing Tailwind v4 stylesheet before adding web components');
    const cssFile = safePath(cwd, config.css);
    const original = fs.existsSync(cssFile) ? fs.readFileSync(cssFile, 'utf8') : '';
    let specifier = slash(path.relative(path.dirname(cssFile), safePath(cwd, tokens)));
    if (!specifier.startsWith('.')) specifier = './' + specifier;
    const rule = `@import ${JSON.stringify(specifier)};`;
    if (!original.includes(rule) && !original.includes(`@import '${specifier}';`)) {
      const charset = original.match(/^\uFEFF?\s*@charset\s+[^;]+;\s*/)?.[0] ?? '';
      writes.set(config.css, charset + rule + '\n' + original.slice(charset.length));
    }
  }
  const receiptFile = safePath(cwd, RECEIPT);
  const receipt = fs.existsSync(receiptFile) ? readJson(receiptFile) : { schemaVersion: 1, items: [], files: {} };
  if (receipt.schemaVersion !== 1 || !Array.isArray(receipt.items) || !receipt.files || typeof receipt.files !== 'object') throw new Error('Invalid universal.lock.json');
  receipt.items = [...new Set([...receipt.items, ...items.map((item) => item.name)])].sort();
  for (const [file, content] of proposed) receipt.files[file] = hash(content);
  receipt.registryVersion = registry.version;
  if (!options.diff && (!fs.existsSync(receiptFile) || fs.readFileSync(receiptFile, 'utf8') !== json(receipt))) writes.set(RECEIPT, json(receipt));
  const manager = detectManager(cwd, manifest, options.packageManager);
  return { cwd, items: items.map((item) => item.name), writes, proposed, unchanged, conflicts, manager, dependenciesChanged };
}

/** Validate the entire plan, snapshot originals, and roll back file writes on I/O failure. */
export function applyPlan(plan, options = {}) {
  const summary = { items: plan.items, files: [...plan.writes.keys()], unchanged: plan.unchanged, packageManager: plan.manager, install: !options.noInstall, dryRun: !!options.dryRun };
  if (options.dryRun) return summary;
  const snapshots = new Map();
  for (const [file] of plan.writes) {
    const target = safePath(plan.cwd, file);
    snapshots.set(file, fs.existsSync(target) ? fs.readFileSync(target) : null);
  }
  const applied = [];
  try {
    for (const [file, content] of plan.writes) {
      const target = safePath(plan.cwd, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      const temp = target + `.universal-${crypto.randomBytes(6).toString('hex')}.tmp`;
      try {
        fs.writeFileSync(temp, content, { flag: 'wx' });
        fs.renameSync(temp, target);
        applied.push(file);
      } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
    }
  } catch (error) {
    for (const file of applied.reverse()) {
      const target = safePath(plan.cwd, file);
      const old = snapshots.get(file);
      if (old === null) fs.unlinkSync(target); else fs.writeFileSync(target, old);
    }
    throw error;
  }
  if (!options.noInstall) {
    const windows = process.platform === 'win32';
    const executable = windows ? (process.env.ComSpec ?? 'cmd.exe') : plan.manager;
    const args = windows ? ['/d', '/s', '/c', `${plan.manager} install`] : ['install'];
    const result = (options.spawn ?? spawnSync)(executable, args, { cwd: plan.cwd, stdio: 'inherit', shell: false });
    if (result.error || result.status !== 0) throw new Error(`Source files were generated, but ${plan.manager} install failed. Run it again in the project. ${result.error?.message ?? ''}`);
  }
  return summary;
}

export function diffItems(cwd, registry, names, options = {}) {
  const plan = planInstall(cwd, registry, names, { ...options, diff: true, noInstall: true });
  return [...plan.proposed].map(([file, content]) => {
    const target = safePath(plan.cwd, file);
    const existing = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
    return { file, status: existing === null ? 'missing' : existing === content ? 'unchanged' : 'modified', current: existing, registry: content };
  });
}

export function doctor(cwd, registry) {
  cwd = fs.realpathSync(cwd);
  const config = getConfig(cwd);
  const manifest = readJson(safePath(cwd, 'package.json'));
  const problems = [];
  for (const group of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) for (const [name, version] of Object.entries(manifest[group] ?? {})) {
    if (registry.packages.includes(name) || (/^workspace:/.test(version) && name.startsWith('@package/'))) problems.push(`Library dependency remains: ${name}`);
  }
  const receiptFile = safePath(cwd, RECEIPT);
  if (!fs.existsSync(receiptFile)) problems.push('No source installation receipt exists; add an item first');
  else for (const file of Object.keys(readJson(receiptFile).files ?? {})) {
    const target = safePath(cwd, file);
    if (!fs.existsSync(target)) { problems.push(`Missing source file: ${file}`); continue; }
    if (/\.(?:[cm]?[jt]sx?|vue|svelte|css)$/.test(file) && /(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)["']@package\//.test(fs.readFileSync(target, 'utf8'))) problems.push(`Workspace import remains: ${file}`);
  }
  return { ok: problems.length === 0, sourceDir: config.sourceDir, problems, note: 'This checks source ownership, not framework compilation or third-party license compliance.' };
}

export function createProject(cwd, name, registry, options = {}) {
  if (typeof name !== 'string' || !name || /[\/\\:]/.test(name) || name === '.' || name === '..') {
    throw new Error(`Invalid project name: ${name}`);
  }
  cwd = fs.realpathSync(cwd);
  const projectDir = path.resolve(cwd, name);
  if (fs.existsSync(projectDir) && fs.readdirSync(projectDir).length > 0) {
    throw new Error(`Target directory already exists and is not empty: ${name}`);
  }

  const framework = options.framework ?? 'react';
  const templateFiles = getTemplateFiles(name, options);

  if (options.dryRun) {
    return {
      dryRun: true,
      projectDir,
      framework,
      files: [...templateFiles.keys()],
      tauri: !!options.tauri,
    };
  }

  fs.mkdirSync(projectDir, { recursive: true });
  for (const [relPath, content] of templateFiles.entries()) {
    const full = path.join(projectDir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
  }

  // Initialize universal.json
  const config = initialize(projectDir, {
    framework,
    css: 'src/index.css',
  });

  // If registry is provided, add default starter components
  let added = [];
  if (registry) {
    const starterItem = framework === 'react' ? 'button' : framework === 'native' ? 'ui-native-components-ui-button' : 'core';
    try {
      const plan = planInstall(projectDir, registry, [starterItem], { noInstall: true });
      applyPlan(plan, { noInstall: true });
      added.push(starterItem);
    } catch {
      // If starter item fails to plan, continue with base template
    }
  }

  // Run package manager install if requested
  const manager = detectManager(projectDir, readJson(path.join(projectDir, 'package.json')), options.packageManager);
  if (!options.noInstall) {
    const windows = process.platform === 'win32';
    const executable = windows ? (process.env.ComSpec ?? 'cmd.exe') : manager;
    const args = windows ? ['/d', '/s', '/c', `${manager} install`] : ['install'];
    const result = (options.spawn ?? spawnSync)(executable, args, { cwd: projectDir, stdio: 'inherit', shell: false });
    if (result.error || result.status !== 0) {
      throw new Error(`Project created, but ${manager} install failed: ${result.error?.message ?? ''}`);
    }
  }

  return {
    name,
    projectDir,
    framework,
    tauri: !!options.tauri,
    manager,
    filesCount: templateFiles.size,
    added,
    config,
  };
}
