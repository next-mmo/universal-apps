#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const [repoArg = '.', appArg = '.'] = process.argv.slice(2);
const repo = path.resolve(repoArg);
const app = path.resolve(repo, appArg);
let failed = false;

function pass(message) {
  console.log(`OK  ${message}`);
}

function fail(message) {
  failed = true;
  console.error(`ERR ${message}`);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`${path.relative(repo, file)} is missing or invalid JSON: ${error.message}`);
    return null;
  }
}

const mcpPath = path.join(repo, '.agents', 'mcp_config.json');
const mcp = readJson(mcpPath);
if (mcp) {
  const servers = mcp.mcpServers ?? {};
  servers['chrome-devtools'] ? pass('Chrome DevTools MCP configured') : fail('chrome-devtools MCP server missing');
  servers.inspecto ? pass('Inspecto MCP configured') : fail('inspecto MCP server missing');
}

const inspectoSettingsPath = path.join(repo, '.inspecto', 'settings.json');
const settings = readJson(inspectoSettingsPath);
if (settings) {
  settings['delivery.mode'] === 'mcp'
    ? pass('Inspecto delivery.mode is mcp')
    : fail('Inspecto delivery.mode must be mcp');
}

const promptsPath = path.join(repo, '.inspecto', 'prompts.json');
const prompts = readJson(promptsPath);
if (prompts) {
  const items = Array.isArray(prompts) ? prompts : prompts.items ?? prompts.prompts ?? [];
  const ids = new Set(items.map((item) => item?.id));
  ids.has('browser-fix-verify')
    ? pass('browser-fix-verify workflow configured')
    : fail('browser-fix-verify workflow missing');
}

const pkgPath = path.join(app, 'package.json');
const pkg = readJson(pkgPath);
if (pkg) {
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  deps['@inspecto-dev/plugin']
    ? pass('@inspecto-dev/plugin declared in frontend package')
    : fail('@inspecto-dev/plugin missing from frontend package');
  deps['@inspecto-dev/core']
    ? pass('@inspecto-dev/core declared in frontend package')
    : fail('@inspecto-dev/core missing from frontend package');
}

const viteCandidates = ['vite.config.ts', 'vite.config.js', 'vite.config.mts', 'vite.config.mjs'];
const viteFile = viteCandidates.map((name) => path.join(app, name)).find((file) => fs.existsSync(file));
if (viteFile) {
  const source = fs.readFileSync(viteFile, 'utf8');
  source.includes('@inspecto-dev/plugin')
    ? pass(`Inspecto referenced by ${path.relative(repo, viteFile)}`)
    : fail(`Inspecto plugin not referenced by ${path.relative(repo, viteFile)}`);
  /production/.test(source)
    ? pass('Vite config contains a production guard signal; review it manually')
    : fail('Vite Inspecto setup has no obvious production guard; review before shipping');
} else {
  console.log('INFO No Vite config found; validate the non-Vite Inspecto integration with Inspecto doctor/build output.');
}

if (failed) process.exit(1);
pass('Static browser-agent setup validation passed');
